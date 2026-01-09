import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, MapPin, Phone, User, LogOut, ChevronDown, Calendar, FileText, Award, Heart, Building2, Settings, BarChart3, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useUserRole } from "@/hooks/useUserRole";
import NotificacoesDropdown from "@/components/NotificacoesDropdown";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { city, state } = useGeolocation();
  const { config } = useSiteConfig();
  const { role } = useUserRole();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on link
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  const getUserMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { icon: User, label: 'Perfil', href: '/profile' },
    ];

    // Add role-specific dashboard items
    if (user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'master') {
      baseItems.push(
        { icon: Settings, label: 'Dashboard Admin', href: '/admin' },
        { icon: BarChart3, label: 'Relatórios', href: '/admin-reports' }
      );
    } else if (user.user_metadata?.role === 'clinic') {
      baseItems.push(
        { icon: Settings, label: 'Dashboard Clínica', href: '/clinic-dashboard' },
        { icon: Calendar, label: 'Agendamentos', href: '/agendamentos' }
      );
    } else {
      // Patient items
      baseItems.push(
        { icon: LayoutDashboard, label: 'Dashboard', href: '/patient-dashboard' },
        { icon: Calendar, label: 'Meus Agendamentos', href: '/meus-agendamentos' },
        { icon: Heart, label: 'Favoritos', href: '/favoritos' }
      );
    }

    return baseItems;
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ease-out border-b ${isScrolled
        ? 'bg-[#1A1A2E]/90 backdrop-blur-2xl border-white/[0.08] shadow-2xl'
        : 'bg-[#1A1A2E]/70 backdrop-blur-xl border-white/[0.05]'
      }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-18">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E94560] to-[#FB923C] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#E94560]/20 group-hover:scale-110 transition-transform">
                D
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl tracking-tight">Doutorizze</span>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-[#E94560]/20 text-[#E94560] text-[10px] font-bold rounded-full border border-[#E94560]/30 w-fit">
                  PREMIUM V2
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-4 xl:ml-10 flex items-center space-x-2 lg:space-x-3 xl:space-x-6">
              <Link to="/" className="text-white/60 hover:text-white transition-colors font-semibold text-sm xl:text-base py-2 px-3">
                Início
              </Link>
              <Link to="/como-funciona" className="text-white/60 hover:text-white transition-colors font-semibold text-sm xl:text-base py-2 px-3">
                Como Funciona
              </Link>
              <Link to="/para-clinicas" className="text-white/60 hover:text-white transition-colors font-semibold text-sm xl:text-base py-2 px-3">
                Para Clínicas
              </Link>

              <div className="hidden xl:flex items-center space-x-2 ml-4 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                <MapPin className="h-4 w-4 text-[#E94560]" />
                <span className="text-sm text-white/70 font-medium">
                  {city && state ? `${city}, ${state}` : (city || state || 'Localização')}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
            {user && <NotificacoesDropdown />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-white/5 transition-all duration-200 rounded-xl px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center text-white font-bold">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden xl:flex flex-col items-start">
                      <span className="text-sm font-bold text-white leading-none">{getDisplayName()}</span>
                      <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">{role}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white/40" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-2 duration-200">
                  {getUserMenuItems().map((item, index) => (
                    <DropdownMenuItem key={index} asChild>
                      <Link to={item.href} className="flex items-center space-x-3 py-2.5 transition-colors">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive py-2.5">
                    <LogOut className="h-4 w-4 mr-3" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="v2-outline" size="sm" className="hidden xl:flex">
                  <Link to="/patient-login">Login Paciente</Link>
                </Button>
                <Button asChild variant="v2-gradient" size="sm">
                  <Link to="/clinic-login">Acesso Clínica</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Tablet Actions */}
          <div className="hidden md:flex lg:hidden items-center space-x-2">
            {user && <NotificacoesDropdown />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-secondary/80 transition-all duration-200 rounded-lg">
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium max-w-20 truncate">{getDisplayName()}</span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex items-center space-x-3 py-2.5">
                      <span>Início</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/como-funciona" className="flex items-center space-x-3 py-2.5">
                      <span>Como Funciona</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/para-clinicas" className="flex items-center space-x-3 py-2.5">
                      <span>Para Clínicas</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  {getUserMenuItems().map((item, index) => (
                    <DropdownMenuItem key={index} asChild>
                      <Link to={item.href} className="flex items-center space-x-3 py-2.5">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive py-2.5">
                    <LogOut className="h-4 w-4 mr-3" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-1.5 md:space-x-2">
                <Button asChild variant="outline" size="sm" className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:border-primary/30 text-xs md:text-sm px-2 md:px-3 group">
                  <Link to="/patient-login" className="group-hover:text-primary transition-colors duration-300">Paciente</Link>
                </Button>
                <Button asChild size="sm" className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:brightness-110 text-xs md:text-sm px-2 md:px-3">
                  <Link to="/clinic-login">Clínica</Link>
                </Button>
              </div>
            )}

            {/* Location info for tablet */}
            <div className="hidden md:flex items-center space-x-1.5 ml-3 px-2 py-1 bg-secondary/30 hover:bg-secondary/40 rounded-full transition-all duration-300 ease-out hover:shadow-sm group">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground font-medium transition-colors duration-300">{city}</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-secondary/80 transition-all duration-200 rounded-lg relative"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              <div className="relative w-6 h-6">
                <Menu className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
                <X className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className="bg-white/98 backdrop-blur-sm border-t border-border shadow-lg">
          {/* Navigation Links */}
          <div className="px-4 pt-4 pb-2">
            <div className="space-y-1">
              {[
                { to: '/', label: 'Início' },
                { to: '/como-funciona', label: 'Como Funciona' },
                { to: '/para-clinicas', label: 'Para Clínicas' }
              ].map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 transform hover:translate-x-1 animate-in slide-in-from-left-5 fill-mode-both`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Location info */}
          <div className="px-4 py-3 mx-4 mb-3 bg-gradient-to-r from-secondary/40 to-secondary/20 rounded-xl animate-in slide-in-from-bottom-3 fill-mode-both" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{city}, {state}</p>
                <p className="text-xs text-muted-foreground">Sua localização</p>
              </div>
            </div>
          </div>

          {/* Mobile user actions */}
          <div className="px-4 pb-6">
            {user ? (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '250ms' }}>
                {/* User Info Card */}
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role} • Conectado</p>
                  </div>
                </div>

                {/* User Menu Items */}
                <div className="space-y-1">
                  {getUserMenuItems().map((item, index) => (
                    <Link
                      key={index}
                      to={item.href}
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 transform hover:translate-x-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-secondary/50 rounded-lg flex items-center justify-center">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Logout Button */}
                <Button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 rounded-xl py-3"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sair da Conta
                </Button>
              </div>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '250ms' }}>
                <Button asChild className="w-full rounded-xl py-3 transition-all duration-200 hover:scale-[1.02]">
                  <Link to="/patient-login" onClick={() => setIsMenuOpen(false)}>
                    <User className="h-4 w-4 mr-3" />
                    Login Paciente
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-xl py-3 transition-all duration-200 hover:scale-[1.02]">
                  <Link to="/clinic-login" onClick={() => setIsMenuOpen(false)}>
                    <Building2 className="h-4 w-4 mr-3" />
                    Login Clínica
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;