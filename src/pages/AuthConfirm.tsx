import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AuthConfirm() {
  const navigate = useNavigate();

  useEffect(() => {
    // Como não precisamos mais de confirmação de email,
    // redirecionar usuários para a página de login
    toast.info('Confirmação de email não é mais necessária. Redirecionando...');
    
    setTimeout(() => {
      navigate('/auth');
    }, 3000);
  }, [navigate]);

  const handleGoToLogin = () => {
    navigate('/auth');
  };

  const renderContent = () => {
    return (
      <div className="flex flex-col items-center space-y-4">
        <Info className="h-12 w-12 text-blue-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-700">
            Confirmação de email não é mais necessária
          </h3>
          <p className="text-muted-foreground mt-2">
            Nosso sistema foi atualizado para não exigir confirmação de email.
            Você será redirecionado para a página de login em alguns segundos.
          </p>
        </div>
        <Button onClick={handleGoToLogin} className="mt-4">
          Ir para Login
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sistema Atualizado
          </CardTitle>
          <CardDescription>
            Confirmação de email não é mais necessária
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}