import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, MapPin, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CreditSimulator = () => {
  const navigate = useNavigate();
  const [treatmentValue, setTreatmentValue] = useState([0]); // Valor inicial R$ 0,00
  const [installments, setInstallments] = useState([2]); // 12x inicial (índice 2 do array)
  const [showResult, setShowResult] = useState(false);

  // Opções de parcelas disponíveis
  const installmentOptions = [3, 6, 12, 18, 24, 36];

  // Formatar valor em reais
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular valor da parcela
  const calculateInstallmentValue = (): number => {
    const selectedInstallments = installmentOptions[installments[0]];
    return treatmentValue[0] / selectedInstallments;
  };

  // Simular crédito
  const handleSimulate = () => {

    setShowResult(true);
    toast.success('Simulação realizada com sucesso!');

    // Redirecionar para a página de solicitação de crédito após 3 segundos
    setTimeout(() => {
      navigate('/patient/credit-request');
    }, 3000);
  };

  return (
    <section className="py-24 bg-[#0F0F23] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#3B82F6]/5 rounded-full blur-[120px] -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Título e Descrição */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Simulador de <span className="text-[#3B82F6]">Crédito</span>
            </h2>
            <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium">
              Descubra como financiar seu tratamento de forma simples, transparente e acessível.
            </p>
          </div>

          {/* Aviso de pré-simulação */}
          <div className="bg-[#F9B500]/10 border border-[#F9B500]/20 rounded-2xl p-4 mb-12 flex items-center justify-center gap-3">
            <span className="text-[#F9B500] text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F9B500] animate-pulse"></span>
              PRÉ-SIMULAÇÃO: Os valores são estimativas sujeitas a validação interna.
            </span>
          </div>

          {/* Layout de duas colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda - Simulação de Parcelas */}
            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-[#3B82F6]" />
                  </div>
                  Simulação de Parcelas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Valor do Tratamento */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-white/60 uppercase tracking-widest outline-none">
                    Valor do Tratamento
                  </label>
                  <div className="text-4xl font-black text-[#3B82F6]">
                    {formatCurrency(treatmentValue[0])}
                  </div>
                  <div className="text-xs text-white/20 font-medium">
                    LIMITE: R$ 300 — R$ 50.000
                  </div>
                  <Slider
                    value={treatmentValue}
                    onValueChange={setTreatmentValue}
                    max={50000}
                    min={300}
                    step={100}
                    className="w-full"
                  />
                </div>

                {/* Número de Parcelas */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-white/60 uppercase tracking-widest outline-none">
                    Número de Parcelas
                  </label>
                  <div className="text-3xl font-black text-[#4ADE80]">
                    {installmentOptions[installments[0]]}x
                  </div>
                  <Slider
                    value={installments}
                    onValueChange={setInstallments}
                    max={5}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Resultado da Simulação */}
                {showResult && (
                  <div className="bg-[#4ADE80]/5 border border-[#4ADE80]/20 p-6 rounded-3xl">
                    <div className="text-center">
                      <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-2">
                        Valor da Parcela
                      </p>
                      <p className="text-4xl font-black text-[#FB923C]">
                        {formatCurrency(calculateInstallmentValue())}
                      </p>
                    </div>
                  </div>
                )}

                {/* Botão Simular */}
                <div className="text-center pt-4">
                  <Button
                    onClick={handleSimulate}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    🧮 Simular Crédito
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Coluna Direita - Vantagens do Crédito Doutorizze */}
            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold text-[#4ADE80] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4ADE80]/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-[#4ADE80]" />
                  </div>
                  Vantagens Doutorizze
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Lista de Vantagens */}
                <div className="space-y-4">
                  {[
                    "Aprovação rápida em até 24 horas",
                    "Sem consulta ao SPC/Serasa",
                    "Parcelas fixas sem surpresas",
                    "Atendimento humanizado"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-[#4ADE80]/20 group-hover:border-[#4ADE80]/30 transition-all">
                        <Check className="h-4 w-4 text-[#4ADE80]" />
                      </div>
                      <span className="text-white/70 font-medium">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Seção de Segurança */}
                <div className="pt-8 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                      <p className="text-white font-bold text-sm mb-1">100% Digital</p>
                      <p className="text-white/20 text-[10px] uppercase font-black uppercase tracking-widest">Processo</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                      <p className="text-white font-bold text-sm mb-1">Seguro</p>
                      <p className="text-white/20 text-[10px] uppercase font-black uppercase tracking-widest">Criptografado</p>
                    </div>
                  </div>
                </div>

                {/* Texto de Rodapé */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-yellow-800">
                    💡 Para solicitar seu crédito, entre em contato com uma de nossas clínicas parceiras ou utilize nosso sistema de agendamento.
                  </p>
                </div>

                {/* Texto de Disclaimer */}
                <div className="text-xs text-gray-500 text-center mt-4">
                  * Sujeito à análise de crédito. Valores e condições podem variar conforme perfil do cliente.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aviso de Responsabilidade */}
          <div className="mt-16 text-center">
            <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-8">
              <p className="text-sm text-white/30 leading-relaxed font-medium italic">
                * Os resultados apresentados são estimativas e podem sofrer alteração após a análise de crédito.
                Esta simulação não constitui proposta ou garantia de aprovação.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreditSimulator;
