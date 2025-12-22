import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import {
  getUserSubscription,
  getUserPaymentHistory,
  createCustomerPortalSession,
  cancelSubscription,
  formatCurrency,
  formatDate,
  getPlanByPriceId
} from '@/lib/stripe'
import {
  CreditCard,
  Calendar,
  DollarSign,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2
} from 'lucide-react'

interface Subscription {
  id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: string
  price_id: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at?: string
  stripe_customers: {
    stripe_customer_id: string
    email: string
  }
}

interface PaymentHistory {
  id: string
  stripe_invoice_id?: string
  stripe_payment_intent_id?: string
  amount: number
  currency: string
  status: string
  description: string
  paid_at?: string
  created_at: string
}

export default function CustomerPortal() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadUserData()
    }
  }, [user?.id])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const [subscriptionData, historyData] = await Promise.all([
        getUserSubscription(user!.id),
        getUserPaymentHistory(user!.id)
      ])
      
      setSubscription(subscriptionData)
      setPaymentHistory(historyData)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da assinatura.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!subscription?.stripe_customers?.stripe_customer_id) {
      toast({
        title: 'Erro',
        description: 'Dados do cliente não encontrados.',
        variant: 'destructive'
      })
      return
    }

    try {
      setActionLoading(true)
      const { url } = await createCustomerPortalSession({
        customerId: subscription.stripe_customers.stripe_customer_id,
        returnUrl: window.location.href
      })
      
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error creating portal session:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir o portal de gerenciamento.',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return

    const confirmed = window.confirm(
      'Tem certeza que deseja cancelar sua assinatura? Ela permanecerá ativa até o final do período atual.'
    )

    if (!confirmed) return

    try {
      setActionLoading(true)
      await cancelSubscription(subscription.stripe_subscription_id)
      
      toast({
        title: 'Assinatura cancelada',
        description: 'Sua assinatura foi cancelada e permanecerá ativa até o final do período atual.'
      })
      
      // Reload data to reflect changes
      await loadUserData()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a assinatura.',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const, icon: CheckCircle },
      canceled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
      past_due: { label: 'Em atraso', variant: 'destructive' as const, icon: AlertTriangle },
      unpaid: { label: 'Não pago', variant: 'destructive' as const, icon: AlertTriangle },
      incomplete: { label: 'Incompleto', variant: 'secondary' as const, icon: AlertTriangle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'secondary' as const,
      icon: AlertTriangle
    }

    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const isSuccess = status === 'succeeded' || status === 'paid'
    return (
      <Badge variant={isSuccess ? 'default' : 'destructive'}>
        {isSuccess ? 'Pago' : 'Falhou'}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados da assinatura...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Minha Assinatura
          </CardTitle>
          <CardDescription>
            Gerencie sua assinatura e métodos de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {getPlanByPriceId(subscription.price_id)?.name || 'Plano Personalizado'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription.stripe_customers.email}
                  </p>
                </div>
                {getStatusBadge(subscription.status)}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Próxima cobrança</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Valor</p>
                    <p className="text-sm text-muted-foreground">
                      {getPlanByPriceId(subscription.price_id)?.price ? 
                        `R$ ${getPlanByPriceId(subscription.price_id)?.price.toFixed(2).replace('.', ',')}` : 
                        'Consultar'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Sua assinatura será cancelada em {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleManageSubscription}
                  disabled={actionLoading}
                  className="flex items-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4" />
                  )}
                  Gerenciar Assinatura
                  <ExternalLink className="h-3 w-3" />
                </Button>
                
                {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={actionLoading}
                  >
                    Cancelar Assinatura
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhuma assinatura ativa</h3>
              <p className="text-muted-foreground mb-4">
                Você não possui uma assinatura ativa no momento.
              </p>
              <Button onClick={() => window.location.href = '/plans'}>
                Ver Planos Disponíveis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Histórico de Pagamentos
          </CardTitle>
          <CardDescription>
            Visualize todos os seus pagamentos e faturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{payment.description}</h4>
                      {getPaymentStatusBadge(payment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhum pagamento encontrado</h3>
              <p className="text-muted-foreground">
                Seu histórico de pagamentos aparecerá aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}