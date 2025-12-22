import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface SubscriptionCheck {
  loading: boolean
  error: string | null
  hasActiveSubscription: (planType: string) => boolean
  canAccessAdvancedServices: () => boolean
}

export function useSubscriptionCheck(): SubscriptionCheck {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchActiveSubscriptions()
  }, [user])

  const fetchActiveSubscriptions = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 [SUBSCRIPTION CHECK] Iniciando verificação de assinatura para usuário:', user.id)

      // PRIMEIRO: Buscar todas as assinaturas do usuário sem join
      const { data: allSubscriptions, error: allSubsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)

      if (allSubsError) {
        console.error('❌ [SUBSCRIPTION CHECK] Erro na consulta de todas as assinaturas:', allSubsError)
        // Não lançar erro aqui, apenas logar
      }

      console.log('🔍 [SUBSCRIPTION CHECK] TODAS as assinaturas do usuário (qualquer status):', allSubscriptions)
      console.log('🔍 [SUBSCRIPTION CHECK] Total de assinaturas encontradas:', allSubscriptions?.length || 0)

      // SEGUNDO: Buscar apenas assinaturas ativas do usuário sem join
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (subscriptionError) {
        console.error('❌ [SUBSCRIPTION CHECK] Erro na consulta de assinaturas ativas:', subscriptionError)
        // Não lançar erro, apenas logar e continuar com array vazio
        setActiveSubscriptions([])
        return
      }

      console.log('📊 [SUBSCRIPTION CHECK] Assinaturas ATIVAS encontradas:', subscriptions)
      console.log('📊 [SUBSCRIPTION CHECK] Número de assinaturas ATIVAS:', subscriptions?.length || 0)

      // TERCEIRO: Se há assinaturas ativas, buscar os planos separadamente
      let subscriptionsWithPlans = subscriptions || []
      
      if (subscriptions && subscriptions.length > 0) {
        // Buscar planos para cada assinatura
        const planIds = subscriptions.map(sub => sub.plan_id).filter(Boolean)
        
        if (planIds.length > 0) {
          const { data: plans, error: plansError } = await supabase
            .from('subscription_plans')
            .select('*')
            .in('id', planIds)

          if (!plansError && plans) {
            // Fazer o join manualmente
            subscriptionsWithPlans = subscriptions.map(subscription => {
              const plan = plans.find(p => p.id === subscription.plan_id)
              return {
                ...subscription,
                subscription_plans: plan || null
              }
            })
          } else {
            console.warn('⚠️ [SUBSCRIPTION CHECK] Erro ao buscar planos ou nenhum plano encontrado:', plansError)
            // Manter as assinaturas sem os dados do plano
            subscriptionsWithPlans = subscriptions.map(subscription => ({
              ...subscription,
              subscription_plans: null
            }))
          }
        }

        subscriptionsWithPlans.forEach((sub, index) => {
          console.log(`📋 [SUBSCRIPTION CHECK] Assinatura ATIVA ${index + 1}:`, {
            id: sub.id,
            status: sub.status,
            plan_name: sub.subscription_plans?.name,
            stripe_subscription_id: sub.stripe_subscription_id,
            stripe_customer_id: sub.stripe_customer_id,
            plan_id: sub.plan_id,
            created_at: sub.created_at,
            current_period_start: sub.current_period_start,
            current_period_end: sub.current_period_end
          })
        })
      } else {
        console.log('⚠️ [SUBSCRIPTION CHECK] Nenhuma assinatura ATIVA encontrada para o usuário')
      }

      console.log('🔍 [SUBSCRIPTION CHECK] Dados que serão definidos no estado:', subscriptionsWithPlans)
      setActiveSubscriptions(subscriptionsWithPlans)
    } catch (err) {
      console.error('❌ [SUBSCRIPTION CHECK] Erro ao buscar assinaturas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      // Definir array vazio em caso de erro para evitar crashes
      setActiveSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const hasActiveSubscription = (planType: string): boolean => {
    console.log(`🔎 [SUBSCRIPTION CHECK] ==========================================`)
    console.log(`🔎 [SUBSCRIPTION CHECK] VERIFICANDO ACESSO PARA PLANO: ${planType}`)
    console.log(`🔎 [SUBSCRIPTION CHECK] Assinaturas ativas disponíveis: ${activeSubscriptions.length}`)
    console.log(`🔎 [SUBSCRIPTION CHECK] Array completo de assinaturas:`, activeSubscriptions)
    
    // Verificar cada assinatura individualmente
    activeSubscriptions.forEach((subscription, index) => {
      console.log(`🔎 [SUBSCRIPTION CHECK] Analisando assinatura ${index + 1}:`, {
        id: subscription.id,
        status: subscription.status,
        plan_type: subscription.subscription_plans?.plan_type,
        plan_name: subscription.subscription_plans?.name,
        stripe_subscription_id: subscription.stripe_subscription_id,
        plan_id: subscription.plan_id,
        subscription_plans_object: subscription.subscription_plans
      })
      
      const matches = subscription.subscription_plans?.plan_type === planType
      console.log(`🔎 [SUBSCRIPTION CHECK] Assinatura ${index + 1} corresponde ao tipo '${planType}'? ${matches ? '✅ SIM' : '❌ NÃO'}`)
    })
    
    const hasAccess = activeSubscriptions.some(
      subscription => {
        // Verificar tanto pelo nome quanto pelo tipo do plano
        const planNameMatch = subscription.subscription_plans?.name === planType
        const planTypeMatch = subscription.subscription_plans?.plan_type === planType
        const isBasicPatientPlan = planType === 'basic' && 
          (subscription.subscription_plans?.name?.toLowerCase().includes('paciente') ||
           subscription.subscription_plans?.name?.toLowerCase().includes('patient') ||
           subscription.subscription_plans?.plan_type === 'patient')
        
        console.log(`🔎 [SUBSCRIPTION CHECK] Verificando plano:`, {
          planName: subscription.subscription_plans?.name,
          planType: subscription.subscription_plans?.plan_type,
          searchingFor: planType,
          planNameMatch,
          planTypeMatch,
          isBasicPatientPlan
        })
        
        return planNameMatch || planTypeMatch || isBasicPatientPlan
      }
    )
    
    console.log(`🔎 [SUBSCRIPTION CHECK] RESULTADO FINAL para '${planType}': ${hasAccess ? '✅ ACESSO LIBERADO' : '❌ ACESSO NEGADO'}`)
    
    if (hasAccess) {
      const matchingSubscription = activeSubscriptions.find(
        subscription => {
          const planNameMatch = subscription.subscription_plans?.name === planType
          const planTypeMatch = subscription.subscription_plans?.plan_type === planType
          const isBasicPatientPlan = planType === 'basic' && 
            (subscription.subscription_plans?.name?.toLowerCase().includes('paciente') ||
             subscription.subscription_plans?.name?.toLowerCase().includes('patient') ||
             subscription.subscription_plans?.plan_type === 'patient')
          return planNameMatch || planTypeMatch || isBasicPatientPlan
        }
      )
      console.log(`✅ [SUBSCRIPTION CHECK] ASSINATURA QUE CONCEDE ACESSO:`, {
        id: matchingSubscription?.id,
        plan_name: matchingSubscription?.subscription_plans?.name,
        stripe_subscription_id: matchingSubscription?.stripe_subscription_id,
        stripe_customer_id: matchingSubscription?.stripe_customer_id,
        plan_id: matchingSubscription?.plan_id,
        status: matchingSubscription?.status,
        created_at: matchingSubscription?.created_at
      })
    } else {
      console.log(`❌ [SUBSCRIPTION CHECK] NENHUMA ASSINATURA ENCONTRADA PARA O TIPO: ${planType}`)
      console.log(`❌ [SUBSCRIPTION CHECK] Tipos disponíveis:`, activeSubscriptions.map(s => s.subscription_plans?.name))
    }
    
    console.log(`🔎 [SUBSCRIPTION CHECK] ==========================================`)
    
    return hasAccess
  }

  const canAccessAdvancedServices = (): boolean => {
    return hasActiveSubscription('clinic_advanced')
  }

  return {
    loading,
    error,
    hasActiveSubscription,
    canAccessAdvancedServices
  }
}