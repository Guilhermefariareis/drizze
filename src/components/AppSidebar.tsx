import {
  BarChart3,
  Settings,
  Calendar,
  CreditCard,
  Users,
  Crown,
  UserCog,
  MessageCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import React, { useState, useEffect } from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useClinicProfile } from "@/hooks/useClinicProfile"

interface MenuItem {
  title: string;
  url: string;
  route: string;
  icon: any;
  masterOnly?: boolean;
}

const items: MenuItem[] = [
  { title: "Dashboard", url: "dashboard", route: "/clinic-dashboard?tab=dashboard", icon: BarChart3 },
  { title: "Gerenciar Agendamento", url: "agendamento", route: "/clinic-dashboard?tab=agendamento&view=calendario", icon: Calendar },
  { title: "Configuração de Horários", url: "configuracao-horarios", route: "/clinic-dashboard?tab=horarios", icon: Clock },
  { title: "Crédito Odonto", url: "credit", route: "/clinic-dashboard?tab=credito", icon: CreditCard },
  { title: "Leads", url: "leads", route: "/clinic-dashboard?tab=leads", icon: Users },
  { title: "Profissionais", url: "professionals", route: "/clinic-dashboard?tab=professionals", icon: UserCog },
  { title: "Perfil da Clínica", url: "profile", route: "/clinic-dashboard?tab=profile", icon: Settings },
  { title: "Suporte", url: "support", route: "/clinic-dashboard?tab=support", icon: MessageCircle },
]

const proItems: MenuItem[] = [
  { title: "Serviços Avançados", url: "advanced-services", route: "/clinic-dashboard?tab=advanced-services", icon: Settings, masterOnly: true },
  { title: "Dados Clinicorp", url: "agenda", route: "/clinic-dashboard?tab=agenda", icon: Calendar, masterOnly: true },
]

export function AppSidebar() {
  const { user } = useAuth()
  const { clinic } = useClinicProfile()
  const navigate = useNavigate()
  const location = useLocation()

  const isMaster = clinic?.master_user_id === user?.id || clinic?.owner_id === user?.id

  const isActive = (item: MenuItem) => {
    const currentPath = location.pathname
    const currentSearch = location.search
    const fullCurrentUrl = currentPath + currentSearch

    // Verificar se é a rota exata
    if (item.route === currentPath || item.route === fullCurrentUrl) {
      return true
    }

    // Para rotas com query params, verificar se o path base e o tab coincidem
    if (item.route.includes('?tab=')) {
      const [routePath, routeTab] = item.route.split('?tab=')
      const urlParams = new URLSearchParams(currentSearch)
      const currentTab = urlParams.get('tab')

      return currentPath === routePath && currentTab === routeTab
    }

    return false
  }

  const getNavCls = (item: MenuItem) =>
    isActive(item)
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-muted/50"

  const allItems = [...items, ...proItems.filter(item => !item.masterOnly || isMaster)]

  const [open, setOpen] = useState(true)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const mobile = 'matches' in e ? e.matches : e.matches
      setIsMobile(mobile)
      // Ao sair do mobile, reabre o sidebar em desktop
      if (!mobile) {
        setOpen(true)
      }
    }

    // Inicializa estado baseado no viewport atual
    handleChange(mql)

    if ('addEventListener' in mql) {
      mql.addEventListener('change', handleChange as (ev: Event) => void)
      return () => mql.removeEventListener('change', handleChange as (ev: Event) => void)
    } else if ('addListener' in mql) {
      mql.addListener(handleChange as (ev: MediaQueryListEvent) => void)
      return () => mql.removeListener(handleChange as (ev: MediaQueryListEvent) => void)
    }
  }, [])

  useEffect(() => {
    // Restaurar última rota do dashboard da clínica
    try {
      const last = localStorage.getItem('clinicLastRoute')
      const current = location.pathname + location.search
      // Só redireciona se estiver na rota base sem tab
      if (last && location.pathname === '/clinic-dashboard' && !location.search && last !== current) {
        navigate(last, { replace: true })
      }
    } catch { }
  }, [])

  return (
    <div
      className={`fixed left-0 top-0 ${open ? 'w-64' : 'w-20'} h-screen bg-[#0F0F23] border-r border-white/10 flex flex-col z-[80] transition-all duration-300 shadow-2xl`}
      style={{ transform: isMobile && !open ? 'translateX(-100%)' : 'translateX(0)' }}
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0F0F23] z-[80]">
        {open && <h2 className="text-xl font-black text-white tracking-tight">Doutorizze</h2>}
        {/* Toggle só em telas pequenas */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
          aria-label="Alternar menu"
          onClick={() => setOpen(prev => !prev)}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <nav className="space-y-2">
          {allItems.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                try {
                  localStorage.setItem('clinicLastRoute', item.route)
                } catch { }
                navigate(item.route)
              }}
              className={`${isActive(item)
                ? "bg-primary text-white shadow-glow shadow-primary/20"
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
                } w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all font-medium group`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive(item) ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive(item) ? 'text-white' : 'text-muted-foreground group-hover:text-white'}`} />
              </div>
              {open && (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="truncate text-sm">{item.title}</span>
                  {item.masterOnly && isMaster && (
                    <Crown className="h-3 w-3 text-warning flex-shrink-0 animate-pulse" />
                  )}
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
