import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the raw body and signature
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('Missing stripe-signature header')
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log('Received webhook event:', event.type)

    // Log the webhook event
    await supabase
      .from('stripe_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        processed: false,
        data: event.data,
        created_at: new Date(event.created * 1000).toISOString()
      })

    // Handle different event types
    switch (event.type) {
      case 'customer.created':
        await handleCustomerCreated(event, supabase)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event, supabase)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, supabase)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event, supabase)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event, supabase)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event, supabase)
        break
      
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event, supabase)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark the webhook event as processed
    await supabase
      .from('stripe_webhook_events')
      .update({ processed: true })
      .eq('event_id', event.id)

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Handler functions
async function handleCustomerCreated(event: Stripe.Event, supabase: any) {
  const customer = event.data.object as Stripe.Customer
  
  console.log('Creating customer:', customer.id)
  
  await supabase
    .from('stripe_customers')
    .insert({
      stripe_customer_id: customer.id,
      email: customer.email,
      name: customer.name,
      metadata: customer.metadata
    })
}

async function handleSubscriptionCreated(event: Stripe.Event, supabase: any) {
  const subscription = event.data.object as Stripe.Subscription
  
  console.log('Creating subscription:', subscription.id)
  
  // Get the user ID from customer metadata or email
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', subscription.customer)
    .single()
  
  if (customer?.user_id) {
    await supabase
      .from('subscriptions')
      .insert({
        user_id: customer.user_id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        price_id: subscription.items.data[0]?.price.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      })
  }
}

async function handleSubscriptionUpdated(event: Stripe.Event, supabase: any) {
  const subscription = event.data.object as Stripe.Subscription
  
  console.log('Updating subscription:', subscription.id)
  
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      price_id: subscription.items.data[0]?.price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(event: Stripe.Event, supabase: any) {
  const subscription = event.data.object as Stripe.Subscription
  
  console.log('Deleting subscription:', subscription.id)
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(event: Stripe.Event, supabase: any) {
  const invoice = event.data.object as Stripe.Invoice
  
  console.log('Payment succeeded for invoice:', invoice.id)
  
  // Get the user ID from the subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single()
  
  if (subscription?.user_id) {
    await supabase
      .from('payment_history')
      .insert({
        user_id: subscription.user_id,
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: invoice.payment_intent,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        description: invoice.description || 'Subscription payment',
        paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      })
  }
}

async function handlePaymentFailed(event: Stripe.Event, supabase: any) {
  const invoice = event.data.object as Stripe.Invoice
  
  console.log('Payment failed for invoice:', invoice.id)
  
  // Get the user ID from the subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single()
  
  if (subscription?.user_id) {
    await supabase
      .from('payment_history')
      .insert({
        user_id: subscription.user_id,
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: invoice.payment_intent,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
        description: invoice.description || 'Subscription payment failed'
      })
  }
}

async function handleCheckoutCompleted(event: Stripe.Event, supabase: any) {
  const session = event.data.object as Stripe.Checkout.Session
  
  console.log('Checkout completed:', session.id)
  
  // If this is a subscription checkout, the subscription will be handled by subscription.created
  // If this is a one-time payment, handle it here
  if (session.mode === 'payment' && session.payment_intent) {
    // Handle one-time payment (like booking payments)
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', session.customer)
      .single()
    
    if (customer?.user_id) {
      await supabase
        .from('payment_history')
        .insert({
          user_id: customer.user_id,
          stripe_payment_intent_id: session.payment_intent,
          amount: session.amount_total,
          currency: session.currency,
          status: 'succeeded',
          description: session.metadata?.description || 'One-time payment',
          paid_at: new Date().toISOString()
        })
    }
  }
}