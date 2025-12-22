# Funcionalidade: Edição de Valores pela Clínica

## 1. Visão Geral da Funcionalidade

Esta funcionalidade permite que as clínicas revisem e ajustem valores, parcelas e condições das solicitações de crédito antes de encaminhar para aprovação final do administrador, proporcionando maior flexibilidade no processo de análise de crédito.

**Objetivo Principal**: Dar autonomia às clínicas para personalizar as condições de crédito conforme sua análise de risco e relacionamento com o paciente.

## 2. Fluxo de Processo Atualizado

### 2.1 Fluxo Atual vs. Novo Fluxo

**Fluxo Anterior:**
1. Paciente cria solicitação → Status: "Pendente"
2. Clínica aprova/rejeita → Status: "Aprovado"/"Rejeitado"

**Novo Fluxo Proposto:**
1. Paciente cria solicitação → Status: "Pendente"
2. Clínica visualiza e pode editar valores → Status: "Em Análise"
3. Clínica aprova com valores editados → Status: "Aguardando Admin"
4. Admin faz aprovação final → Status: "Aprovado"/"Rejeitado"

### 2.2 Estados de Status

| Status | Descrição | Ações Disponíveis |
|--------|-----------|-------------------|
| Pendente | Solicitação criada pelo paciente | Clínica: Editar, Aprovar, Rejeitar |
| Em Análise | Clínica está editando valores | Clínica: Salvar alterações, Enviar para Admin |
| Aguardando Admin | Aguardando aprovação final | Admin: Aprovar, Rejeitar, Solicitar ajustes |
| Aprovado | Aprovado pelo admin | Nenhuma |
| Rejeitado | Rejeitado pela clínica ou admin | Nenhuma |

## 3. Especificações Técnicas

### 3.1 Campos Editáveis pela Clínica

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| requested_amount | DECIMAL(10,2) | Valor solicitado ajustado | Min: R$ 100, Max: R$ 50.000 |
| installments | INTEGER | Número de parcelas | Min: 1, Max: 60 |
| interest_rate | DECIMAL(5,2) | Taxa de juros mensal | Min: 0%, Max: 15% |
| clinic_notes | TEXT | Observações da clínica | Máx: 500 caracteres |
| special_conditions | TEXT | Condições especiais | Máx: 1000 caracteres |
| clinic_approved_amount | DECIMAL(10,2) | Valor final aprovado pela clínica | Calculado automaticamente |

### 3.2 Novos Campos na Tabela credit_requests

```sql
-- Campos adicionais para edição pela clínica
ALTER TABLE credit_requests ADD COLUMN clinic_approved_amount DECIMAL(10,2);
ALTER TABLE credit_requests ADD COLUMN clinic_installments INTEGER;
ALTER TABLE credit_requests ADD COLUMN clinic_interest_rate DECIMAL(5,2) DEFAULT 2.5;
ALTER TABLE credit_requests ADD COLUMN clinic_notes TEXT;
ALTER TABLE credit_requests ADD COLUMN special_conditions TEXT;
ALTER TABLE credit_requests ADD COLUMN edited_by_clinic BOOLEAN DEFAULT FALSE;
ALTER TABLE credit_requests ADD COLUMN clinic_edit_date TIMESTAMP WITH TIME ZONE;
```

### 3.3 Tabela de Histórico de Alterações

```sql
CREATE TABLE credit_request_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_request_id UUID REFERENCES credit_requests(id),
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    change_reason TEXT
);
```

## 4. Interface do Usuário

### 4.1 Painel da Clínica - Melhorias

| Elemento | Descrição | Localização |
|----------|-----------|-------------|
| Botão "Editar Valores" | Permite abrir modal de edição | Ao lado dos botões Aprovar/Rejeitar |
| Badge "Editado" | Indica se valores foram alterados | No card da solicitação |
| Histórico de Alterações | Link para ver mudanças realizadas | Dentro do card expandido |

### 4.2 Modal de Edição de Valores

**Componentes do Modal:**
- **Cabeçalho**: "Editar Valores da Solicitação"
- **Seção 1**: Valores Originais (somente leitura)
- **Seção 2**: Novos Valores (editáveis)
- **Seção 3**: Cálculos Automáticos
- **Seção 4**: Observações e Condições
- **Rodapé**: Botões Cancelar, Salvar Rascunho, Enviar para Admin

**Campos do Modal:**

```typescript
interface EditValueModal {
  // Valores originais (readonly)
  originalAmount: number;
  originalInstallments: number;
  originalRate: number;
  
  // Valores editáveis
  newAmount: number;
  newInstallments: number;
  newRate: number;
  clinicNotes: string;
  specialConditions: string;
  
  // Cálculos automáticos
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
}
```

### 4.3 Responsividade

- **Desktop**: Modal centralizado com largura de 800px
- **Tablet**: Modal ocupa 90% da largura da tela
- **Mobile**: Modal em tela cheia com scroll vertical

## 5. Regras de Negócio

### 5.1 Permissões de Edição

- ✅ Clínica pode editar apenas solicitações com status "Pendente"
- ✅ Após edição, status muda automaticamente para "Em Análise"
- ✅ Clínica pode salvar como rascunho múltiplas vezes
- ✅ Apenas uma edição ativa por solicitação
- ❌ Não é possível editar após envio para admin

### 5.2 Validações de Valores

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| Valor | Não pode ser menor que R$ 100 | "Valor mínimo é R$ 100,00" |
| Valor | Não pode ser maior que R$ 50.000 | "Valor máximo é R$ 50.000,00" |
| Parcelas | Entre 1 e 60 parcelas | "Número de parcelas deve ser entre 1 e 60" |
| Taxa | Entre 0% e 15% ao mês | "Taxa deve ser entre 0% e 15% ao mês" |

### 5.3 Cálculos Automáticos

```typescript
// Fórmula para cálculo da parcela
const monthlyPayment = (amount * (1 + rate/100) ** installments) / installments;

// Total a pagar
const totalAmount = monthlyPayment * installments;

// Total de juros
const totalInterest = totalAmount - amount;
```

## 6. Notificações

### 6.1 Notificações para o Paciente

| Evento | Título | Mensagem |
|--------|--------|----------|
| Valores editados | "Proposta Atualizada" | "A clínica revisou sua solicitação com novos valores" |
| Enviado para admin | "Em Análise Final" | "Sua solicitação foi enviada para aprovação final" |

### 6.2 Notificações para o Admin

| Evento | Título | Mensagem |
|--------|--------|----------|
| Nova solicitação editada | "Solicitação Aguardando Aprovação" | "Nova solicitação com valores editados pela clínica" |

## 7. Relatórios e Analytics

### 7.1 Métricas para Clínicas

- Número de solicitações editadas vs. não editadas
- Tempo médio de análise por solicitação
- Taxa de aprovação após edição
- Valores médios de ajuste (aumento/diminuição)

### 7.2 Métricas para Admins

- Solicitações aguardando aprovação
- Taxa de aprovação de solicitações editadas vs. originais
- Clínicas que mais editam valores
- Impacto financeiro das edições

## 8. Implementação por Fases

### 8.1 Fase 1 - Backend e Banco de Dados
- ✅ Criar novos campos na tabela credit_requests
- ✅ Criar tabela de histórico
- ✅ Implementar APIs de edição
- ✅ Atualizar validações

### 8.2 Fase 2 - Interface da Clínica
- ✅ Adicionar botão "Editar Valores"
- ✅ Criar modal de edição
- ✅ Implementar cálculos automáticos
- ✅ Adicionar validações frontend

### 8.3 Fase 3 - Notificações e Histórico
- ✅ Sistema de notificações
- ✅ Histórico de alterações
- ✅ Logs de auditoria

### 8.4 Fase 4 - Painel do Admin
- ✅ Visualização de solicitações editadas
- ✅ Comparação valores originais vs. editados
- ✅ Aprovação/rejeição com comentários

## 9. Testes e Validação

### 9.1 Cenários de Teste

1. **Edição Básica**: Clínica edita valor e parcelas
2. **Validações**: Teste de limites mínimos e máximos
3. **Cálculos**: Verificação de fórmulas matemáticas
4. **Fluxo Completo**: Paciente → Clínica → Admin
5. **Permissões**: Teste de acesso por diferentes usuários
6. **Responsividade**: Teste em diferentes dispositivos

### 9.2 Critérios de Aceitação

- ✅ Clínica consegue editar valores sem quebrar funcionalidade existente
- ✅ Cálculos automáticos estão corretos
- ✅ Histórico de alterações é mantido
- ✅ Notificações são enviadas corretamente
- ✅ Interface é responsiva e intuitiva
- ✅ Performance não é impactada

## 10. Considerações de Segurança

### 10.1 Auditoria
- Todas as alterações são logadas com timestamp e usuário
- Histórico completo de mudanças é mantido
- Não é possível deletar histórico de alterações

### 10.2 Permissões
- Apenas usuários autenticados como clínica podem editar
- Validação de propriedade da solicitação
- Rate limiting para evitar spam de edições

### 10.3 Validação de Dados
- Sanitização de inputs
- Validação server-side obrigatória
- Prevenção de SQL injection e XSS

---

**Documento criado em**: 29/09/2025  
**Versão**: 1.0  
**Status**: Especificação Completa  
**Próximos Passos**: Iniciar implementação da Fase 1