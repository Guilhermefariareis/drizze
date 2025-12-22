import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '@/integrations/supabase/client'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!)

export { stripePromise }
export const getStripe = () => stripePromise

// Types
export interface StripePlan {
  name: string
  stripePriceId: string
  price: number
  interval: 'month' | 'year'
  features: string[]
}

// Stripe configuration
export const stripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  apiVersion: '2023-10-16' as const,
}

// Plan configurations with Stripe Price IDs
export const stripePlans = {
  basic: {
    name: 'Plano Básico',
    stripePriceId: 'price_basic_monthly', // Replace with actual Stripe Price ID
    price: 29.90,
    interval: 'month' as const,
    features: [
      'Até 50 consultas por mês',
      'Suporte por email',
      'Relatórios básicos'
    ]
  },
  premium: {
    name: 'Plano Premium',
    stripePriceId: 'price_premium_monthly', // Replace with actual Stripe Price ID
    price: 59.90,
    interval: 'month' as const,
    features: [
      'Consultas ilimitadas',
      'Suporte prioritário',
      'Relatórios avançados',
      'Integração com calendário'
    ]
  },
  enterprise: {
    name: 'Plano Enterprise',
    stripePriceId: 'price_enterprise_monthly', // Replace with actual Stripe Price ID
    price: 99.90,
    interval: 'month' as const,
    features: [
      'Tudo do Premium',
      'Suporte 24/7',
      'API personalizada',
      'Gerente de conta dedicado'
    ]
  }
}

// Create checkout session
export async function createCheckoutSessionFull({
  priceId,
  userId,
  successUrl,
  cancelUrl,
  mode = 'subscription'
}: {
  priceId: string
  userId: string
  successUrl: string
  cancelUrl: string
  mode?: 'subscription' | 'payment'
}) {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        userId,
        successUrl,
        cancelUrl,
        mode
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Create customer portal session
export async function createCustomerPortalSession({
  customerId,
  returnUrl
}: {
  customerId: string
  returnUrl: string
}) {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: {
        customerId,
        returnUrl
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}

// Get user's active subscription
export async function getUserSubscription(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        stripe_customers (
          stripe_customer_id,
          email
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }
}

// Get user's payment history
export async function getUserPaymentHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error fetching payment history:', error)
    return []
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: {
        subscriptionId
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

// Update subscription
export async function updateSubscription({
  subscriptionId,
  newPriceId
}: {
  subscriptionId: string
  newPriceId: string
}) {
  try {
    const { data, error } = await supabase.functions.invoke('update-subscription', {
      body: {
        subscriptionId,
        newPriceId
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100) // Stripe amounts are in cents
}

// Helper function to format date
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Get plan by price ID
export function getPlanByPriceId(priceId: string) {
  return Object.values(stripePlans).find(plan => plan.stripePriceId === priceId)
}

// Simplified functions for checkout
export async function createCheckoutSession(priceId: string) {
  try {
    const { user } = await supabase.auth.getUser()
    if (!user.data.user) {
      throw new Error('User not authenticated')
    }

    const result = await createCheckoutSessionFull({
      priceId,
      userId: user.data.user.id,
      successUrl: `${window.location.origin}/subscription?success=true`,
      cancelUrl: `${window.location.origin}/plans?canceled=true`,
      mode: 'subscription'
    })

    return result.sessionId
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function redirectToCheckout(sessionId: string) {
  try {
    const stripe = await stripePromise
    if (!stripe) {
      throw new Error('Stripe not initialized')
    }

    const { error } = await stripe.redirectToCheckout({ sessionId })
    
    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    throw error
  }
}

// Validate Stripe configuration
export function validateStripeConfig() {
  if (!stripeConfig.publishableKey) {
    throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not configured')
  }
  
  if (!stripeConfig.publishableKey.startsWith('pk_')) {
    throw new Error('Invalid Stripe publishable key format')
  }
  
  return true
}