import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3 } from 'lucide-react';
import { SimpleTestModal } from './SimpleTestModal';

interface SimpleCreditManagerProps {
  clinicId?: string;
}

export const SimpleCreditManager: React.FC<SimpleCreditManagerProps> = ({ clinicId }) => {
  console.log('🔥 [SimpleCreditManager] Componente renderizado!');
  console.log('🔥 [SimpleCreditManager] clinicId:', clinicId);

  const [editModalOpen, setEditModalOpen] = useState(false);

  const testRequests = [
    {
      id: '1',
      patient_name: 'Rozana Silva',
      requested_amount: 5000,
      installments: 12,
      status: 'pending' as const,
      treatment_description: 'Implante dentário'
    },
    {
      id: '2', 
      patient_name: 'João Santos',
      requested_amount: 3000,
      installments: 6,
      status: 'pending' as const,
      treatment_description: 'Ortodontia'
    }
  ];

  const handleEditValues = (request: any) => {
    console.log('🔥 [SimpleCreditManager] BOTÃO EDITAR VALORES CLICADO!');
    console.log('🔥 [SimpleCreditManager] Request:', request);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Crédito (Versão Simplificada)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{request.patient_name}</h3>
                    <p className="text-sm text-gray-600">
                      R$ {request.requested_amount.toLocaleString()} em {request.installments}x
                    </p>
                    <p className="text-sm text-gray-500">{request.treatment_description}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant="outline">{request.status}</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditValues(request)}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar Valores
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SimpleTestModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
};