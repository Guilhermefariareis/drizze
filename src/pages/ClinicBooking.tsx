import React from 'react';
import { ClinicAppointmentBooking } from '@/components/clinic/ClinicAppointmentBooking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useClinicProfile } from '@/hooks/useClinicProfile';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ClinicBooking = () => {
  const { user } = useAuth();
  const { clinic } = useClinicProfile();

  if (!user) {
    return <Navigate to="/clinic-login" replace />;
  }

  // Obter o clinicId correto
  const clinicId = clinic?.id || user?.id || '';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Agendamento</h1>
          <p className="text-muted-foreground mt-2">
            Crie agendamentos usando a integração com Clinicorp
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Novo Agendamento</CardTitle>
            <p className="text-muted-foreground">
              Selecione uma data e horário disponível para criar um novo agendamento
            </p>
          </CardHeader>
          <CardContent>
            <ClinicAppointmentBooking 
              clinicId={clinicId}
              onAppointmentCreated={(appointment) => {
                console.log('Agendamento criado com sucesso:', appointment);
                // Aqui você pode redirecionar ou atualizar a página
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ClinicBooking;