import { useState } from 'react';
import { Menu, X, Home, Search, Calendar, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';

interface MobileNavProps {
  currentPath?: string;
}

export function MobileNav({ currentPath }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Início', icon: Home, path: '/' },
    { label: 'Buscar', icon: Search, path: '/search' },
    { label: 'Agendar', icon: Calendar, path: '/booking' },
    { label: 'Perfil', icon: User, path: '/patient-dashboard' },
    { label: 'Configurações', icon: Settings, path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col space-y-4 py-4">
          <div className="px-4 py-2">
            <h2 className="text-lg font-semibold">Menu</h2>
          </div>
          
          <div className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={currentPath === item.path ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}