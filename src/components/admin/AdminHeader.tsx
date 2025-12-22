import { Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  hideSearch?: boolean;
}

export function AdminHeader({ hideSearch = false }: AdminHeaderProps) {
  const { signOut } = useAuth();
  return (
    <>
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          {/* Search */}
          {!hideSearch && (
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários, clínicas..."
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Espaço reservado para futuras ações */}
          </div>
        </div>
      </header>
      
      {/* Menu de perfil fixo no canto superior direito */}
      <div className="fixed top-2 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-shadow">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@doutorizze.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}