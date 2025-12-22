# 🏥 Doutorizze

Bem-vindo ao repositório oficial do projeto **Doutorizze**.

Este é um sistema moderno de gestão e agendamento e solicitação de crédito para clínicas Odontológicas, desenvolvido com as tecnologias mais recentes do mercado para garantir alta performance, escalabilidade e uma excelente experiência de usuário.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando uma stack robusta e moderna:

*   **Frontend**: [React](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/) - para um ambiente de desenvolvimento ultra-rápido
*   **Estilização**: [Tailwind CSS](https://tailwindcss.com/) - para estilização utilitária e responsiva
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (baseado em [Radix UI](https://www.radix-ui.com/)) - para componentes acessíveis e customizáveis
*   **Gerenciamento de Estado**: [Zustand](https://zustand-demo.pmnd.rs/) e [TanStack Query](https://tanstack.com/query/latest)
*   **Backend / BaaS**: [Supabase](https://supabase.com/) - para autenticação, banco de dados (PostgreSQL) e armazenamento
*   **Pagamentos**: Integração com [Stripe](https://stripe.com/)
*   **Roteamento**: [React Router](https://reactrouter.com/)

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

*   [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
*   [npm](https://www.npmjs.com/) (geralmente vem instalado com o Node.js) ou um gerenciador de pacotes alternativo como `pnpm` ou `yarn`.

## 🛠️ Como Instalar e Rodar o Projeto

Siga os passos abaixo para configurar o ambiente de desenvolvimento localmente:

### 1. Clone o repositório

```bash
git clone https://github.com/doutorizzeapp/doutorizze.git
cd doutorizze
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto, baseando-se no arquivo `.env.example` (se disponível). Você precisará configurar as chaves de API do Supabase e Stripe.

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais.

### 4. Execute o servidor de desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).

## 📜 Scripts Disponíveis

No diretório do projeto, você pode rodar os seguintes comandos:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Cria a versão de produção otimizada na pasta `dist`. |
| `npm run preview` | Visualiza a versão de produção localmente. |
| `npm run lint` | Excecuta o linter para verificar problemas no código (ESLint). |

## 📂 Estrutura do Projeto

A estrutura de pastas segue as melhores práticas de desenvolvimento React:

*   `src/components`: Componentes reutilizáveis da UI.
*   `src/pages`: Componentes que representam páginas inteiras.
*   `src/hooks`: Custom Hooks do React.
*   `src/lib`: Utilitários e configurações de bibliotecas (ex: cliente do Supabase).
*   `src/services`: Lógica de integração com APIs externas.
*   `src/types`: Definições de tipos TypeScript.

## 🤝 Contribuição

1.  Faça um Fork do projeto
2.  Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`)
3.  Faça o Commit de suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4.  Faça o Push para a Branch (`git push origin feature/MinhaFeature`)
5.  Abra um Pull Request

---

Desenvolvido para **Doutorizze**.
