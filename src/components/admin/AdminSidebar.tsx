import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Settings,
  BarChart3,
  MessageSquare,
  Shield,
  FileText,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useSiteConfig } from '@/hooks/useSiteConfig';

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Usuários', path: '/admin/users' },
  { icon: Building2, label: 'Clínicas', path: '/admin/clinics' },
  { icon: FileCheck, label: 'Novo Credenciamento', path: '/admin/credentialing' },
  { icon: Calendar, label: 'Consultas', path: '/admin/appointments' },
  { icon: DollarSign, label: 'Financeiro', path: '/admin/financial' },
  { icon: CreditCard, label: 'Gerenciamento de Crédito', path: '/admin/credit-management' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/reports' },
  { icon: Settings, label: 'Config. Site', path: '/admin/site-config' },
  { icon: MessageSquare, label: 'Tickets Suporte', path: '/admin/support' },
  { icon: Shield, label: 'Segurança', path: '/admin/security' },
  { icon: FileText, label: 'Auditoria', path: '/admin/audit' },
];

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
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
                src="/logo-white-final.png"
                alt="Logo"
                className="h-16 w-auto object-contain mb-2"
              />
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-auto"
          >
            {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start transition-smooth hover-lift",
                !open && "px-2",
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
          <div className="bg-gradient-primary text-white p-3 rounded-lg text-center">
            <p className="text-sm font-medium">Admin Panel</p>
            <p className="text-xs opacity-90">v2.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
}