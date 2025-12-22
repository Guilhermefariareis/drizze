import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { subscriptionId, newPriceId, prorationBehavior = 'create_prorations' } = await req.json()

    if (!subscriptionId || !newPriceId) {
      throw new Error('Missing required parameters: subscriptionId and newPriceId')
    }

    // Get the current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // Get the current subscription item
    const subscriptionItem = subscription.items.data[0]
    
    if (!subscriptionItem) {
      throw new Error('No subscription items found')
    }

    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscriptionItem.id,
          price: newPriceId,
        },
      ],
      proration_behavior: prorationBehavior,
    })

    // Update the subscription in our database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        price_id: newPriceId,
        status: updatedSubscription.status,
        current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (updateError) {
      console.error('Error updating subscription in database:', updateError)
      // Don't throw here as the Stripe update was successful
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          current_period_start: updatedSubscription.current_period_start,
          current_period_end: updatedSubscription.current_period_end,
          price_id: newPriceId,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error updating subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})