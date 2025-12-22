import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SimpleTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SimpleTestModal: React.FC<SimpleTestModalProps> = ({ open, onOpenChange }) => {
  console.log('🔥 [SimpleTestModal] Modal renderizado!');
  console.log('🔥 [SimpleTestModal] open:', open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modal de Teste</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Este é um modal de teste simples!</p>
          <p>Se você está vendo isso, o botão funcionou!</p>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};