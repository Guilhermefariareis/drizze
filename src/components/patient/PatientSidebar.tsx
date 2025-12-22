import { 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  Star,
  User,
  Settings,
  ChevronLeft,
  ChevronRight
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
    <div className={cn(
      "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-[70]",
      open ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {open && (
            <div className="flex flex-col items-center">
              <img 
                src={config.site_logo?.url || "/doutorizze-uploads/e4e59e9c-6806-48a8-be4c-476ac461beb9.png"} 
                alt="Logo" 
                className="h-16 w-auto object-contain mb-2"
              />
              <h2 className="text-lg font-semibold text-primary">Painel do Paciente</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start h-12 px-3",
                !open && "px-0 justify-center",
                location.pathname === item.path && "bg-primary/10 text-primary"
              )}
              asChild
            >
              <Link to={item.path}>
                <item.icon className={cn("h-5 w-5", open && "mr-3")} />
                {open && <span>{item.label}</span>}
              </Link>
            </Button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {open && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-muted-foreground text-center">
            <p>Doutorizze</p>
            <p>Painel do Paciente</p>
          </div>
        </div>
      )}
    </div>
  );
}