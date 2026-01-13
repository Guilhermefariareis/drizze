import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Star,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useSiteConfig } from '@/hooks/useSiteConfig';

interface PatientSidebarProps {
  open: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: Home, label: 'Voltar ao Site', path: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
  { icon: Calendar, label: 'Agendamentos', path: '/patient/appointments' },
  { icon: Star, label: 'Meu Plano', path: '/patient/plan' },
  { icon: CreditCard, label: 'Crédito Odonto', path: '/patient/credit' },
  { icon: User, label: 'Perfil', path: '/patient/profile' },
  { icon: Settings, label: 'Configurações', path: '/patient/settings' },
];

export function PatientSidebar({ open, onToggle }: PatientSidebarProps) {
  const location = useLocation();
  const { config } = useSiteConfig();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden"
          onClick={onToggle}
        />
      )}

      <div className={cn(
        "fixed left-0 top-0 h-full bg-[#0A0514] border-r border-white/5 transition-all duration-500 z-[70] shadow-2xl shadow-primary/5",
        "lg:translate-x-0",
        open ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-white/5 relative overflow-hidden">
          {open && <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-[20px] -z-10 animate-pulse"></div>}
          <div className="flex items-center justify-between">
            {open && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                  </div>
                  <h2 className="text-xl font-black text-white font-outfit">Doutorizze</h2>
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">Painel Paciente</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-10 w-10 text-white/40 hover:text-primary hover:bg-primary/10 transition-all rounded-xl"
            >
              {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
            {!open && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="fixed left-4 top-4 h-12 w-12 text-white bg-primary/20 hover:bg-primary/30 backdrop-blur-md transition-all rounded-2xl z-[80] lg:hidden shadow-lg shadow-primary/20"
              >
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 mt-4">
          <div className="space-y-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-14 px-4 rounded-2xl transition-all duration-300 relative group",
                    !open && "px-0 justify-center",
                    isActive
                      ? "bg-primary/15 text-primary shadow-[inset_0_0_20px_rgba(155,77,255,0.1)] border border-primary/20"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                  asChild
                >
                  <Link to={item.path} onClick={() => window.innerWidth < 1024 && onToggle()}>
                    <item.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", open && "mr-4", isActive && "text-primary")} />
                    {open && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                    {isActive && open && (
                      <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-glow" />
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        {open && (
          <div className="absolute bottom-10 left-6 right-6 p-6 rounded-3xl bg-primary/5 border border-white/5">
            <div className="flex flex-col gap-1 items-center">
              <p className="text-xs font-black text-white px-3 py-1 bg-white/5 rounded-full">v4.0 Premium</p>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-2">© 2026 Doutorizze</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
