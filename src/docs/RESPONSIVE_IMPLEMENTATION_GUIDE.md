# Guia de Implementação de Responsividade

## 📋 Visão Geral

Este guia fornece instruções completas para implementar responsividade no sistema, garantindo que todas as telas se adaptem perfeitamente a diferentes dispositivos e tamanhos de tela.

## 🎯 Objetivos

- **Desktop**: Layout completo com todas as funcionalidades (1200px+)
- **Tablet**: Layout otimizado para touch (768px - 1199px)
- **Mobile**: Layout compacto e focado em usabilidade (até 767px)

## 📱 Breakpoints Definidos

```typescript
export const BREAKPOINTS = {
  mobile: 767,    // Até 767px
  tablet: 1199,   // 768px - 1199px
  desktop: 1200,  // 1200px+
};
```

## 🏗️ Arquitetura de Componentes Responsivos

### 1. Hooks de Responsividade

#### `useBreakpoint()`
Detecta o breakpoint atual baseado na largura da janela:

```typescript
import { useBreakpoint } from '@/hooks/useBreakpoint';

function MyComponent() {
  const breakpoint = useBreakpoint(); // 'mobile', 'tablet', ou 'desktop'
  
  return (
    <div className={breakpoint === 'mobile' ? 'p-4' : 'p-6'}>
      Conteúdo adaptativo
    </div>
  );
}
```

#### Hooks Auxiliares
- `useIsMobile()`: Retorna true se estiver em mobile
- `useIsTablet()`: Retorna true se estiver em tablet
- `useIsDesktop()`: Retorna true se estiver em desktop
- `useWindowSize()`: Retorna largura e altura da janela
- `useOrientation()`: Retorna orientação da tela

### 2. Componentes Base Responsivos

#### `ResponsiveContainer`
Container que se adapta automaticamente ao breakpoint:

```typescript
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

<ResponsiveContainer
  variant="dashboard" // 'default' | 'dashboard' | 'card' | 'fluid'
  maxWidth="xl"        // 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding="md"         // 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className="custom-class"
>
  Seu conteúdo aqui
</ResponsiveContainer>
```

#### `ResponsiveGrid`
Grid system responsivo com colunas adaptativas:

```typescript
import { ResponsiveGrid, DashboardGrid } from '@/components/ui/ResponsiveGrid';

// Grid básico
<ResponsiveGrid
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap={{ mobile: 4, tablet: 6, desktop: 8 }}
>
  {items.map(item => (
    <div key={item.id}>{item.content}</div>
  ))}
</ResponsiveGrid>

// Grid de dashboard com cards de métricas
<DashboardGrid>
  <MetricCard title="Vendas" value="R$ 10.000" />
  <MetricCard title="Clientes" value="150" />
  <MetricCard title="Taxa" value="5.2%" />
</DashboardGrid>
```

#### `ResponsiveText`
Componentes de texto com tamanhos adaptativos:

```typescript
import { ResponsiveHeading, ResponsiveParagraph } from '@/components/ui/ResponsiveText';

<ResponsiveHeading level={1} size="xl">
  Título Principal
</ResponsiveHeading>

<ResponsiveParagraph size="base" color="gray" align="center">
  Texto adaptativo que muda de tamanho conforme o dispositivo
</ResponsiveParagraph>
```

#### `ResponsiveTable`
Tabela responsiva com rolagem horizontal em telas pequenas:

```typescript
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

<ResponsiveTable
  striped
  bordered
  hover
  responsive
>
  <thead>
    <tr>
      <ResponsiveTableHeaderCell>Nome</ResponsiveTableHeaderCell>
      <ResponsiveTableHeaderCell>Email</ResponsiveTableHeaderCell>
      <ResponsiveTableHeaderCell>Status</ResponsiveTableHeaderCell>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <ResponsiveTableRow key={item.id}>
        <ResponsiveTableCell>{item.name}</ResponsiveTableCell>
        <ResponsiveTableCell>{item.email}</ResponsiveTableCell>
        <ResponsiveTableCell>{item.status}</ResponsiveTableCell>
      </ResponsiveTableRow>
    ))}
  </tbody>
</ResponsiveTable>
```

### 3. Navegação Responsiva

#### `ResponsiveNavigation`
Navegação que se adapta ao tamanho da tela:

```typescript
import { ResponsiveNavigation } from '@/components/ui/ResponsiveNavigation';

const navItems = [
  { id: 'home', label: 'Home', href: '/', icon: <HomeIcon /> },
  { id: 'patients', label: 'Pacientes', href: '/patients', icon: <UsersIcon /> },
  { id: 'appointments', label: 'Consultas', href: '/appointments', icon: <CalendarIcon /> },
];

<ResponsiveNavigation
  items={navItems}
  variant="horizontal" // 'horizontal' | 'vertical' | 'sidebar'
  logo={<Logo />}
  mobileBreakpoint="tablet"
/>
```

### 4. Cards Responsivos

#### `ResponsiveCard`
Card com variações responsivas:

```typescript
import { ResponsiveCard, MetricCard, ActionCard } from '@/components/ui/ResponsiveCard';

// Card básico
<ResponsiveCard
  variant="elevated"
  padding="lg"
  shadow="md"
  borderRadius="lg"
  hover
>
  <h3>Título do Card</h3>
  <p>Conteúdo do card</p>
</ResponsiveCard>

// Card de métrica
<MetricCard
  title="Total de Pacientes"
  value="1.234"
  subtitle="+12% este mês"
  trend={{ value: 12, label: 'este mês', positive: true }}
  icon={<UsersIcon />}
  color="blue"
/>

// Card de ação
<ActionCard
  title="Adicionar Novo Paciente"
  description="Clique aqui para cadastrar um novo paciente"
  actionText="Adicionar Paciente"
  onAction={() => navigate('/patients/new')}
  icon={<PlusIcon />}
  variant="primary"
/>
```

## 🧪 Testes de Responsividade

### 1. Testes Manuais

#### Checklist de Testes por Breakpoint

**Mobile (até 767px):**
- [ ] Layout vertical único
- [ ] Menu hambúrguer funcional
- [ ] Fontes legíveis (mínimo 14px)
- [ ] Botões com tamanho mínimo 44x44px
- [ ] Scroll horizontal ausente
- [ ] Tabelas com scroll horizontal
- [ ] Formulários otimizados para touch
- [ ] Sem zoom obrigatório

**Tablet (768px - 1199px):**
- [ ] Layout de 2 colunas quando apropriado
- [ ] Menu lateral colapsável
- [ ] Fontes ajustadas para leitura
- [ ] Touch targets adequados
- [ ] Imagens otimizadas
- [ ] Espaçamento consistente

**Desktop (1200px+):**
- [ ] Layout multi-coluna
- [ ] Menu expandido
- [ ] Todos os recursos visíveis
- [ ] Hover states funcionando
- [ ] Animações suaves
- [ ] Uso eficiente do espaço

### 2. Ferramentas de Teste

#### Testes Automatizados
```typescript
import { runResponsiveTests } from '@/utils/responsiveTesting';

// Executar testes para todos os breakpoints
const results = await runResponsiveTests(page, 'mobile');
const report = generateTestReport(results);
console.log(report);
```

#### Testes de Performance
```typescript
import { testPerformance } from '@/utils/performance';

const performanceResults = await testPerformance({
  maxLoadTime: 2000,
  maxInteractiveTime: 3000,
  maxFirstPaint: 1000,
});
```

### 3. Testes em Dispositivos Reais

#### Dispositivos Recomendados para Teste
- **Mobile**: iPhone SE, iPhone 12, Samsung Galaxy S21
- **Tablet**: iPad, iPad Pro, Samsung Galaxy Tab
- **Desktop**: Chrome, Firefox, Safari, Edge

#### Emuladores e Simuladores
- Chrome DevTools Device Mode
- BrowserStack
- Responsively App
- Firefox Responsive Design Mode

## 📊 Métricas de Sucesso

### Performance
- Tempo de carregamento < 2s em 3G
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

### Acessibilidade
- Contraste WCAG AA (4.5:1)
- Tamanho mínimo de toque 44x44px
- Navegação por teclado funcional
- Leitores de tela compatíveis

### UX/UI
- Consistência visual entre breakpoints
- Hierarquia visual clara
- Feedback visual adequado
- Navegação intuitiva

## 🔧 Boas Práticas

### 1. Design Mobile-First
```css
/* Mobile-first approach */
.component {
  /* Estilos mobile */
  padding: 1rem;
  font-size: 0.875rem;
}

/* Tablet styles */
@media (min-width: 768px) {
  .component {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

/* Desktop styles */
@media (min-width: 1200px) {
  .component {
    padding: 2rem;
    font-size: 1.125rem;
  }
}
```

### 2. Unidades Relativas
```css
/* Use unidades relativas */
.component {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  padding: clamp(1rem, 3vw, 2rem);
  margin: clamp(0.5rem, 1vw, 1rem);
}
```

### 3. Imagens Responsivas
```html
<img
  src="image-mobile.jpg"
  srcset="image-mobile.jpg 480w,
          image-tablet.jpg 768w,
          image-desktop.jpg 1200w"
  sizes="(max-width: 767px) 100vw,
         (max-width: 1199px) 50vw,
         33vw"
  alt="Descrição da imagem"
  loading="lazy"
/>
```

### 4. Container Queries (quando disponível)
```css
@container (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}
```

## 🚨 Problemas Comuns e Soluções

### 1. Overflow Horizontal
```css
/* Problema */
.container {
  width: 100vw; /* Causa scroll horizontal */
}

/* Solução */
.container {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
```

### 2. Fontes Muito Pequenas
```css
/* Problema */
.text {
  font-size: 12px; /* Muito pequeno para mobile */
}

/* Solução */
.text {
  font-size: clamp(14px, 2vw, 16px);
}
```

### 3. Botões Inacessíveis
```css
/* Problema */
.button {
  padding: 4px 8px; /* Muito pequeno para touch */
}

/* Solução */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}
```

### 4. Tabelas Não Responsivas
```html
<!-- Problema -->
<table>
  <!-- Muitas colunas -->
</table>

<!-- Solução -->
<div class="table-container">
  <table class="responsive-table">
    <!-- Colunas adaptativas -->
  </table>
</div>
```

## 📚 Recursos Adicionais

### Documentação
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Mobile-First](https://developers.google.com/web/fundamentals/design-and-ux/responsive/patterns)
- [W3C Responsive Images](https://www.w3.org/TR/responsive-images/)

### Ferramentas
- [Responsively App](https://responsively.app/)
- [BrowserStack](https://www.browserstack.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Bibliotecas
- [Tailwind CSS](https://tailwindcss.com/docs/responsive-design)
- [Styled Components](https://styled-components.com/docs/basics#responsive)
- [Emotion](https://emotion.sh/docs/media-queries)

## 🔄 Manutenção e Atualização

### Processo de Review
1. **Weekly Review**: Verificar novos componentes
2. **Monthly Audit**: Executar testes completos
3. **Quarterly Update**: Atualizar configurações e breakpoints
4. **Annual Overhaul**: Revisar toda a estratégia de responsividade

### Versionamento
- Manter changelog de mudanças de responsividade
- Documentar breaking changes
- Fornecer migration guides quando necessário
- Manter compatibilidade com versões anteriores quando possível

---

**Nota**: Este guia deve ser atualizado regularmente conforme novos padrões e tecnologias emergem. Consulte sempre as últimas práticas da indústria e mantenha o sistema atualizado.