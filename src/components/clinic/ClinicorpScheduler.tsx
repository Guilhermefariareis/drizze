import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinicorpApi } from '@/hooks/useClinicorpApi';
import { toast } from 'sonner';
import { Calendar, Clock } from 'lucide-react';

interface ProfessionalOption {
  id: string;
  name: string;
  raw?: any;
}

export default function ClinicorpScheduler({ clinicId }: { clinicId?: string }) {
  const { request, listProfessionals, listAvailableTimes, loading } = useClinicorpApi();

  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [times, setTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listProfessionals(undefined, clinicId);
        console.log('[ClinicorpScheduler] Professionals response:', res);
        
        // Handle both array and object with list property  
        let rawProfessionalsArray = [];
        if (Array.isArray(res)) {
          rawProfessionalsArray = res;
        } else if (res && res.list && Array.isArray(res.list)) {
          rawProfessionalsArray = res.list;
        }
        
        // Map to ProfessionalOption format
        const mapped: ProfessionalOption[] = rawProfessionalsArray.map((p: any) => ({
          id: p.id?.toString() || p.UserName || '',
          name: p.FullName || p.UserName || 'Nome não informado',
          raw: p,
        })).filter(p => p.id);
        
        console.log('[ClinicorpScheduler] Mapped professionals:', mapped);
        if (!cancelled) setProfessionals(mapped);
      } catch (e: any) {
        console.error('[ClinicorpScheduler] Error loading professionals:', e);
        if (!cancelled) toast.error('Não foi possível carregar profissionais');
      }
    })();
    return () => { cancelled = true; };
  }, [clinicId]);

  const canFetchTimes = useMemo(
    () => !!date,
    [date]
  );

  const pad = (n: number) => String(n).padStart(2, '0');

  const toHHmmFromDate = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const normalizeSlots = (items: any[], baseDate?: string) => {
    const out: string[] = [];
    for (const t of items || []) {
      let val: string | undefined;
      if (typeof t === 'string') {
        if (t.includes('T')) {
          const dt = new Date(t);
          if (!isNaN(dt.getTime())) val = toHHmmFromDate(dt);
        } else if (/^\d{1,2}:\d{2}/.test(t)) {
          val = t.slice(0, 5);
        }
      } else if (typeof t === 'number') {
        const hrs = Math.floor(t / 60);
        const mins = t % 60;
        val = `${pad(hrs)}:${pad(mins)}`;
      } else if (t && typeof t === 'object') {
        // Considera várias convenções de chaves, inclusive maiúsculas vindas da Clinicorp ("From")
        const cand: any =
          t.time ?? t.hora ?? t.hour ?? t.horario ?? t.slot ?? t.label ??
          t.start ?? t.from ?? t.start_time ?? t.hora_inicio ??
          t.From ?? t.To ?? t.Start ?? t.End;
        if (typeof cand === 'string') {
          if (cand.includes('T')) {
            const dt = new Date(cand);
            if (!isNaN(dt.getTime())) val = toHHmmFromDate(dt);
          } else if (/^\d{1,2}:\d{2}/.test(cand)) {
            val = cand.slice(0, 5);
          }
        } else if (typeof cand === 'number') {
          const hrs = Math.floor(cand / 60);
          const mins = cand % 60;
          val = `${pad(hrs)}:${pad(mins)}`;
        }
      }
      if (val) out.push(val);
    }
    return Array.from(new Set(out));
  };

  const fetchTimes = async () => {
    if (!date) {
      toast.info('Informe a data');
      return;
    }
    try {
      const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date(date).toISOString().split('T')[0];
      const query: Record<string, any> = { date: dateOnly };
      console.log('[Clinicorp] get_avaliable_times_calendar', query);
      const res = await listAvailableTimes(query, clinicId);

      const items = Array.isArray(res)
        ? res
        : Array.isArray(res?.times)
          ? res.times
          : Array.isArray(res?.horarios)
            ? res.horarios
            : Array.isArray(res?.data)
              ? res.data
              : [];
      const normalized = normalizeSlots(items, dateOnly);
      setTimes(normalized);
      if (normalized.length === 0) toast.info('Sem horários disponíveis para a data selecionada');
    } catch (e: any) {
      console.warn('[Clinicorp] Calendar endpoint failed, tentando alternativa', e?.message || e);
      try {
        const keyVariants = ['professional_id','professionalId','codigo_profissional','codigoProfissional','professional','id_professional'];
        let res: any = null;
        for (const key of keyVariants) {
          const q: Record<string, any> = { [key]: selectedProfessional, date };
          try {
            res = await request('/appointment/get_avaliable_times', 'GET', { query: q, clinic_id: clinicId, suppressToast: true });
            if (res) break;
          } catch {}
        }
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.times)
            ? res.times
            : Array.isArray(res?.horarios)
              ? res.horarios
              : Array.isArray(res?.data)
                ? res.data
                : [];
        const normalized = normalizeSlots(items, date);
        setTimes(normalized);
        if (normalized.length === 0) toast.info('Sem horários disponíveis na tentativa alternativa');
      } catch (ee) {
        console.error(ee);
        toast.error('Falha ao buscar horários');
      }
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Visualizar Horários Clinicorp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profissional, Data e Code Link */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Motivo da consulta</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: Avaliação, limpeza, dor de dente..." />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={fetchTimes} disabled={!date || loading}>
                <Clock className="h-4 w-4 mr-2" /> Buscar horários
              </Button>
            </div>
          </div>

          {/* Horários */}
          {times.length > 0 && (
            <div>
              <Label>Horários disponíveis</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {times.map((t, i) => (
                  <Button
                    key={`${t}-${i}`}
                    type="button"
                    variant={selectedTime === t ? 'default' : 'secondary'}
                    onClick={() => setSelectedTime(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Informação sobre horários selecionados */}
          {selectedTime && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Horário selecionado:</strong> {selectedTime} em {date}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Este é apenas para visualização. Para criar agendamentos, use o sistema Doutorizze.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
