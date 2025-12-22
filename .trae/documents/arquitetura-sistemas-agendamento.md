# Arquitetura dos Sistemas de Agendamento

## Visão Geral

O projeto Doutorizze possui dois sistemas distintos para gerenciamento de agendamentos:

### 1. Sistema Clinicorp (Somente Leitura)
- **Propósito**: Visualização de agendamentos existentes do sistema Clinicorp
- **Funcionalidades**: Apenas leitura e consulta
- **Integração**: API externa do Clinicorp
- **Componentes**:
  - `ClinicorpAppointmentsManager`: Visualização de agendamentos
  - `useClinicorpAppointments`: Hook para leitura de dados
  - `useClinicorpApi`: Gerenciamento de credenciais

### 2. Sistema Doutorizze (Leitura e Escrita)
- **Propósito**: Sistema independente para criação e gerenciamento de novos agendamentos
- **Funcionalidades**: CRUD completo de agendamentos
- **Integração**: Supabase (banco de dados próprio)
- **Componentes**:
  - `ClinicAppointmentBooking`: Criação de novos agendamentos
  - `useAgendamentos`: Hook para CRUD de agendamentos
  - `useHorariosDisponiveis`: Gerenciamento de horários

## Separação de Responsabilidades

### Clinicorp - Apenas Visualização
```
┌─────────────────────────────────────┐
│           CLINICORP                 │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     API Externa             │    │
│  │   (Somente Leitura)         │    │
│  └─────────────────────────────┘    │
│                │                    │
│                ▼                    │
│  ┌─────────────────────────────┐    │
│  │  useClinicorpAppointments   │    │
│  │  (Leitura de agendamentos)  │    │
│  └─────────────────────────────┘    │
│                │                    │
│                ▼                    │
│  ┌─────────────────────────────┐    │
│  │ ClinicorpAppointmentsManager│    │
│  │   (Visualização apenas)     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Doutorizze - Sistema Completo
```
┌─────────────────────────────────────┐
│           DOUTORIZZE                │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        SUPABASE             │    │
│  │    (Banco Próprio)          │    │
│  └─────────────────────────────┘    │
│                │                    │
│                ▼                    │
│  ┌─────────────────────────────┐    │
│  │     useAgendamentos         │    │
│  │  (CRUD completo)            │    │
│  └─────────────────────────────┘    │
│                │                    │
│                ▼                    │
│  ┌─────────────────────────────┐    │
│  │  ClinicAppointmentBooking   │    │
│  │  (Criação de agendamentos)  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Fluxo de Dados

### Para Visualização (Clinicorp)
1. Usuário acessa `ClinicorpAppointmentsManager`
2. Componente usa `useClinicorpAppointments`
3. Hook faz requisições para API do Clinicorp
4. Dados são exibidos em modo somente leitura

### Para Criação (Doutorizze)
1. Usuário acessa `ClinicAppointmentBooking`
2. Componente usa `useAgendamentos`
3. Hook interage com Supabase
4. Novos agendamentos são criados no banco próprio

## Tabelas do Supabase (Sistema Doutorizze)

### Tabela `agendamentos`
- Armazena agendamentos criados pelo sistema Doutorizze
- Independente dos dados do Clinicorp
- Estrutura própria otimizada para as necessidades do sistema

### Tabelas de Apoio
- `horarios_funcionamento`: Horários de funcionamento das clínicas
- `horarios_bloqueados`: Horários indisponíveis
- `clinicas`: Dados das clínicas cadastradas

## Regras de Negócio

### ✅ Permitido
- Clinicorp: Visualizar agendamentos existentes
- Doutorizze: Criar, editar, cancelar agendamentos
- Doutorizze: Gerenciar horários disponíveis
- Doutorizze: Configurar bloqueios de horário

### ❌ Não Permitido
- Clinicorp: Criar ou modificar agendamentos
- Doutorizze: Acessar dados do Clinicorp diretamente
- Misturar funcionalidades entre os sistemas

## Benefícios da Separação

1. **Independência**: Sistema Doutorizze funciona independentemente do Clinicorp
2. **Flexibilidade**: Cada sistema pode evoluir separadamente
3. **Segurança**: Clinicorp mantém controle sobre seus dados
4. **Performance**: Dados do Doutorizze otimizados para suas necessidades
5. **Manutenibilidade**: Código mais limpo e organizado

## Implementação Atual

### Componentes Corrigidos
- ✅ `ClinicAppointmentBooking`: Usa apenas sistema Doutorizze
- ✅ `ClinicorpAppointmentsManager`: Usa apenas sistema Clinicorp (leitura)

### Hooks Especializados
- ✅ `useAgendamentos`: CRUD para sistema Doutorizze
- ✅ `useClinicorpAppointments`: Leitura para sistema Clinicorp
- ✅ `useHorariosDisponiveis`: Gerenciamento de horários Doutorizze

Esta arquitetura garante que cada sistema tenha responsabilidades bem definidas e funcione de forma independente, mantendo a integridade e a performance de ambos os sistemas.