import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 pt-32">
        <div className="max-w-md w-full">
          <Card className="text-center shadow-elegant">
            <CardContent className="p-6 lg:p-8 space-y-6">
              {/* 404 Visual */}
              <div className="space-y-4">
                <div className="mx-auto w-24 h-24 lg:w-32 lg:h-32 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-3xl lg:text-4xl font-bold text-white">404</span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-xl lg:text-2xl font-bold">Página não encontrada</h1>
                  <p className="text-sm lg:text-base text-muted-foreground">
                    A página que você está procurando não existe ou foi movida.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao Início
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/search')}
                    className="flex items-center justify-center"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>

              {/* Help Text */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Se você acredita que isso é um erro, entre em contato conosco.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    );
};

export default NotFound;
