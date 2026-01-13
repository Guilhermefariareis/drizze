import React from 'react'
import { Navigate } from 'react-router-dom'
import Footer from '@/components/Footer'
import CustomerPortal from '@/components/CustomerPortal'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function SubscriptionPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Minha Assinatura
            </h1>
            <p className="text-gray-600">
              Gerencie sua assinatura, métodos de pagamento e visualize seu histórico de pagamentos.
            </p>
          </div>

          <CustomerPortal />
        </div>
      </main>

      <Footer />
    </div>
  )
}