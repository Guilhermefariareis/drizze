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
  const [activeMobileSection, setActiveMobileSection] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { city, state } = useGeolocation();
  const { config } = useSiteConfig();
  const { role, fullName } = useUserRole();


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
    if (fullName) {
      return fullName;
    }
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
    <nav className="sticky top-0 z-50 bg-[#1A1A2E]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 flex-nowrap">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E94560] to-[#FB923C] flex items-center justify-center text-white shadow-lg shadow-[#E94560]/20 group-hover:scale-110 transition-transform">
                <img src="/logo-white-final.png" alt="Logo" className="w-6 h-6 object-contain" />
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
              <Link to="/" className="text-white/60 hover:text-white transition-colors font-semibold text-sm xl:text-base py-2 px-3 whitespace-nowrap">
                Início
              </Link>
              <Link to="/como-funciona" className="text-white/60 hover:text-white transition-colors font-semibold text-sm xl:text-base py-2 px-3 whitespace-nowrap">
                Como Funciona
              </Link>
              <Link to="/para-clinicas" className="text-white/60 hover:text-white transition-colors font-semibold text-sm xl:text-base py-2 px-3 whitespace-nowrap">
                Para Clínicas
              </Link>
              <Link to="/para-dentistas" className="text-white/60 hover:text-white transition-colors font-semibold text-sm xl:text-base py-2 px-3 whitespace-nowrap">
                Para Dentistas
              </Link>

            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-4 lg:space-x-4 xl:space-x-6 whitespace-nowrap shrink-0 h-full">
            {user && <NotificacoesDropdown />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-white/5 h-10 px-2 rounded-xl border border-transparent hover:border-white/10 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden xl:flex flex-col items-start gap-0.5 min-w-0">
                      <span className="text-sm font-bold text-white leading-none tracking-tight truncate max-w-[120px]">{getDisplayName()}</span>
                      <span className="text-[9px] text-white/60 uppercase font-black tracking-widest leading-none truncate w-full">{role}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white/40 shrink-0" />
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
              <div className="flex items-center gap-3">
                {/* Botão Entrar com Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative group overflow-hidden px-8 h-11 transition-all duration-300 hover:scale-105 mr-3 rounded-full shadow-lg shadow-[#E94560]/20 hover:shadow-[#E94560]/40">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#E94560] to-[#FB923C] group-hover:opacity-90 transition-opacity duration-300" />
                      <span className="relative z-10 font-bold text-white flex items-center text-base">
                        Entrar <ChevronDown className="ml-2 h-4 w-4 opacity-90 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-2 duration-200 bg-[#1A1A2E]/95 backdrop-blur-xl border-white/10 text-white rounded-xl">
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4 text-base rounded-lg m-1">
                      <Link to="/patient-login">
                        <User className="h-5 w-5 mr-3 text-[#4ADE80]" />
                        <span>Paciente</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4 text-base rounded-lg m-1">
                      <Link to="/login-dentista">
                        <User className="h-5 w-5 mr-3 text-[#60A5FA]" />
                        <span>Dentista</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4 text-base rounded-lg m-1">
                      <Link to="/clinic-login">
                        <Building2 className="h-5 w-5 mr-3 text-[#F472B6]" />
                        <span>Clínica</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Botão Cadastre-se com Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative group overflow-hidden px-8 h-11 transition-all duration-300 hover:scale-105 rounded-full">
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-all duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-700" />
                      <span className="relative z-10 font-bold text-white flex items-center text-base">
                        Cadastre-se <ChevronDown className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-2 duration-200 bg-[#1A1A2E]/95 backdrop-blur-xl border-white/10 text-white rounded-xl">
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4 text-base rounded-lg m-1">
                      <Link to="/patient-login?signup=true">
                        <User className="h-5 w-5 mr-3 text-[#4ADE80]" />
                        <span>Paciente</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4 text-base rounded-lg m-1">
                      <Link to="/login-dentista?signup=true">
                        <User className="h-5 w-5 mr-3 text-[#60A5FA]" />
                        <span>Dentista</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer py-3 px-4 text-base rounded-lg m-1">
                      <Link to="/clinic-login?signup=true">
                        <Building2 className="h-5 w-5 mr-3 text-[#F472B6]" />
                        <span>Clínica</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Location info for tablet/desktop */}
            <div className="hidden xl:flex items-center space-x-1.5 ml-4 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 transition-all duration-300 ease-out hover:bg-white/10 group">
              <MapPin className="h-3.5 w-3.5 text-[#E94560] group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs text-white/70 group-hover:text-white font-medium transition-colors duration-300">
                {city && state ? `${city}, ${state}` : (city || state || 'Brasil')}
              </span>
            </div>
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
                <Button asChild variant="secondary" size="sm" className="transition-all duration-300 ease-out hover:scale-105 hover:shadow-md text-xs md:text-sm px-2 md:px-3">
                  <Link to="/login-dentista">Dentista</Link>
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
          <div className="lg:hidden">
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
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className="bg-white/98 backdrop-blur-sm border-t border-border shadow-lg">
          {/* Navigation Links */}
          <div className="px-4 pt-4 pb-2">
            <div className="space-y-1">
              {[
                { to: '/', label: 'Início' },
                { to: '/como-funciona', label: 'Como Funciona' },
                { to: '/para-clinicas', label: 'Para Clínicas' },
                { to: '/para-dentistas', label: 'Para Dentistas' }
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

              <div className="space-y-4 animate-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: '250ms' }}>
                {/* Entrar Section */}
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveMobileSection(activeMobileSection === 'entrar' ? null : 'entrar')}
                    className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-[#E94560]/10 to-[#FB923C]/10 border border-[#E94560]/20 rounded-xl text-left font-medium transition-all hover:bg-[#E94560]/20"
                  >
                    <span className="flex items-center text-white">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#E94560] to-[#FB923C] flex items-center justify-center mr-3 shadow-lg shadow-[#E94560]/20">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      Entrar
                    </span>
                    <ChevronDown className={`h-4 w-4 text-white/70 transition-transform duration-300 ${activeMobileSection === 'entrar' ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`space-y-2 pl-2 overflow-hidden transition-all duration-300 ${activeMobileSection === 'entrar' ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <Link to="/patient-login" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 rounded-lg hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] mr-3" />
                      Paciente
                    </Link>
                    <Link to="/login-dentista" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 rounded-lg hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] mr-3" />
                      Dentista
                    </Link>
                    <Link to="/clinic-login" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 rounded-lg hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F472B6] mr-3" />
                      Clínica
                    </Link>
                  </div>
                </div>

                {/* Cadastre-se Section */}
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveMobileSection(activeMobileSection === 'cadastrar' ? null : 'cadastrar')}
                    className="flex items-center justify-between w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-left font-medium transition-all hover:bg-white/10"
                  >
                    <span className="flex items-center text-white">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 border border-white/10">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      Cadastre-se
                    </span>
                    <ChevronDown className={`h-4 w-4 text-white/70 transition-transform duration-300 ${activeMobileSection === 'cadastrar' ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`space-y-2 pl-2 overflow-hidden transition-all duration-300 ${activeMobileSection === 'cadastrar' ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <Link to="/patient-login?signup=true" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 rounded-lg hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] mr-3" />
                      Paciente
                    </Link>
                    <Link to="/login-dentista?signup=true" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 rounded-lg hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] mr-3" />
                      Dentista
                    </Link>
                    <Link to="/clinic-login?signup=true" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 rounded-lg hover:bg-white/5 text-sm text-white/80 hover:text-white transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F472B6] mr-3" />
                      Clínica
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav >
  );
};

export default Navbar;