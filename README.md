# Clube do Livro (Clube de Cinema) 🎬🍿

Site oficial para organização do clube de cinema entre amigos (nome configurável para qualquer identidade do grupo). 

O formato funciona por ciclos (mensal ou quinzenal): o grupo escolhe 1 filme por rodada, cada um assiste no seu próprio tempo até uma data limite, e depois todos se reúnem presencialmente ou por chamada para conversar. O site centraliza:
* **Próxima sessão:** ingresso estilizado com o filme ativo, prazo, sinopse, onde assistir no Brasil e controle de quem já assistiu.
* **Já vimos:** histórico de todos os ciclos concluídos com pôsteres oficiais do TMDB, notas médias e destaque do ano automático.
* **Tela do filme (`/filmes/:id`):** ficha técnica completa, banner 16:9, plataformas de streaming no Brasil e bloco de críticas expansível por membro (com aviso de spoilers e link para o Letterboxd).
* **Acervo:** sugestões do grupo ordenadas por votação, com busca em tempo real no TMDB (com debounce e bloqueio de duplicatas), trailers do YouTube e onde assistir.
* **Painel Admin (`/admin`):** exclusivo para administradores, permite criar/encerrar ciclos, moderar sugestões, lançar notas manuais para membros que não usam Letterboxd, gerenciar e-mails autorizados e alterar o nome do clube.

---

## 🛠 Stack Tecnológica

* **Frontend:** React 19, Vite, TypeScript, React Router 7.
* **Estilização:** CSS próprio com tokens e variáveis customizadas (sem dependências de UI genéricas como MUI, Chakra ou Tailwind). Suporte nativo a **tema escuro** (padrão), **tema claro** (via `prefers-color-scheme` e seletor manual), tipografia Google Fonts (*Bricolage Grotesque* + *Instrument Sans*), e acessibilidade para teclado (`:focus-visible`) e safe-area do iOS.
* **Backend:** [Supabase](https://supabase.com/) (Postgres, Auth por Magic Link, Row Level Security em 100% das tabelas, Edge Functions em Deno e agendamento via `pg_cron`).
* **Catálogo de Filmes:** API do [The Movie Database (TMDB)](https://www.themoviedb.org/) e dados de streaming via [JustWatch](https://www.justwatch.com/).
* **Sincronização:** Leitura periódica dos feeds RSS públicos do [Letterboxd](https://letterboxd.com/).
* **Deploy:** [Vercel](https://vercel.com/) (Frontend) + Supabase (Backend & Edge Functions).

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Pré-requisitos
* Node.js v18 ou superior instalado.
* Git.

### 2. Instalação e Execução
```bash
# Clone ou acesse a pasta do repositório
cd "Site Clube do Livro"

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```
Acesse a aplicação no navegador em `http://localhost:5173`.

> **Nota para desenvolvimento offline/local:** O projeto possui fallback gracioso. Mesmo sem credenciais do Supabase configuradas no `.env`, a interface carrega dados de catálogo realistas e permite alternar entre papéis (Admin, Membro, Visitante) diretamente no topo para testar todos os fluxos.

---

## 🔒 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Conteúdo necessário para o Frontend:
```env
# URL do seu projeto Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave Anônima Pública (Anon Key) do Supabase
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

> ⚠️ **REGRA DE SEGURANÇA CRÍTICA:**
> A chave `SUPABASE_SERVICE_ROLE_KEY` e a chave da API do TMDB (`TMDB_API_KEY`) **NUNCA** devem ser colocadas no arquivo `.env` do frontend. Elas são configuradas exclusivamente como **Secrets** nas Edge Functions do Supabase.

---

## 🗄️ Configuração do Supabase (Passo a Passo)

### 1. Criar o Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com/) e crie uma conta gratuita.
2. Clique em **"New project"**, defina o nome (ex: `clube-do-livro`) e a senha do banco de dados. Escolha a região mais próxima (ex: `São Paulo - sa-east-1`).

### 2. Aplicar o Esquema e Migrações SQL
No painel do seu projeto no Supabase, abra o menu **SQL Editor** e execute os scripts na seguinte ordem:

1. **Estrutura de tabelas, triggers e RLS:**
   Copie e cole o conteúdo de [`supabase/migrations/20261113000000_initial_schema.sql`](./supabase/migrations/20261113000000_initial_schema.sql) e clique em **Run**.
2. **E-mails permitidos iniciais (Seed):**
   Edite o arquivo [`supabase/seed.sql`](./supabase/seed.sql) colocando os e-mails reais de Samuel, Luara, Filipe e Tamires, cole no SQL Editor e execute.
3. **Agendamento automático do Letterboxd (opcional):**
   Execute [`supabase/migrations/20261113000002_letterboxd_cron.sql`](./supabase/migrations/20261113000002_letterboxd_cron.sql).

### 3. Como Criar o Primeiro Administrador
O banco possui uma trigger de segurança (`handle_new_user`) configurada:
1. Certifique-se de que o seu e-mail pessoal está na tabela `allowed_emails`.
2. Abra a aplicação web e clique em **"Entrar"**.
3. Digite o seu e-mail cadastrado e acesse pelo link mágico enviado.
4. **O primeiro usuário a se cadastrar no banco recebe automaticamente a role `admin`!**
5. A partir desse momento, a aba **Admin** ficará disponível no menu para você.

### 4. Como Adicionar Novos Membros
Apenas pessoas com e-mails previamente cadastrados em `allowed_emails` conseguem entrar no clube:
* **Via Painel Admin no site:** Vá em `/admin` -> aba **Membros e E-mails** -> digite o e-mail do amigo e clique em *"Adicionar e-mail"*.
* **Primeiro acesso do membro:** O amigo clica em *"Entrar"*, digita o e-mail e clica no link recebido. Na primeira tela, o site solicita o **nome de exibição** e o **usuário do Letterboxd** (sem `@`).

---

## 🎬 Configuração da API do TMDB

1. Crie uma conta gratuita no [themoviedb.org](https://www.themoviedb.org/).
2. Vá em **Configurações da Conta** -> **API** e solicite uma chave de API (para uso pessoal/educacional a aprovação é imediata).
3. Copie a sua **Chave de API (API Key v3)**.
4. No Supabase, configure a chave como secret para as Edge Functions:
   * **Via Supabase Dashboard:** Vá em **Project Settings** -> **Edge Functions** -> **Add new secret**:
     * Nome: `TMDB_API_KEY`
     * Valor: `sua_chave_do_tmdb`
   * **Ou via Supabase CLI:**
     ```bash
     npx supabase secrets set TMDB_API_KEY=sua_chave_aqui
     ```

### Deploy das Edge Functions no Supabase
Com o Supabase CLI instalado e autenticado (`npx supabase login` e `npx supabase link --project-ref seu-ref`):
```bash
# Deploy da função de integração com TMDB
npx supabase functions deploy tmdb --no-verify-jwt

# Deploy da função de sincronização do Letterboxd
npx supabase functions deploy letterboxd-sync
```

---

## 🌐 Deploy do Frontend na Vercel

1. Suba o repositório para o seu GitHub.
2. Acesse [vercel.com](https://vercel.com/) e clique em **"Add New Project"**.
3. Importe o repositório do `Site Clube do Livro`.
4. Em **Environment Variables**, adicione:
   * `VITE_SUPABASE_URL`: `https://seu-projeto.supabase.co`
   * `VITE_SUPABASE_ANON_KEY`: `sua_anon_key_publica`
5. Clique em **Deploy**. O arquivo [`vercel.json`](./vercel.json) já configurado garante que rotas como `/filmes/:id` e `/admin` funcionem perfeitamente sem erros 404 de recarregamento.

---

## 🛡️ Checklist Final de Segurança

- [x] **Row Level Security (RLS) Ativo:** Habilitado em 100% das tabelas (`allowed_emails`, `profiles`, `movies`, `suggestions`, `votes`, `cycles`, `watched_marks`, `reviews`, `sync_log`, `settings`).
- [x] **Proteção contra Invasores:** A trigger `check_allowed_email` bloqueia na raiz qualquer tentativa de login/cadastro de e-mails ausentes em `allowed_emails`.
- [x] **Bloqueio de Auto-Elevação de Privilégios:** A trigger `protect_profile_role` impede que qualquer usuário comum consiga alterar seu próprio papel para `admin`.
- [x] **Segurança de Chaves:** Nenhuma chave com privilégios de escrita geral (Service Role Key) ou chave da API do TMDB foi incluída no código do cliente React.
- [x] **Proteção contra XSS:** Textos de críticas e sinopses são sempre sanitizados e renderizados estritamente como texto puro no DOM, nunca via `dangerouslySetInnerHTML`.
- [x] **Integridade do Diário (Letterboxd):** A trigger `protect_manual_review` garante que notas e críticas inseridas manualmente por membros no site nunca sejam sobrescritas pela rotina de sincronização RSS.
- [x] **Privacidade:** A rotina do Letterboxd filtra estritamente filmes associados aos ciclos ou ao acervo do clube, descartando o restante do diário dos usuários.
- [x] **Prevenção de Inatividade:** Job leve agendado via `pg_cron` para manter o banco ativo e evitar a pausa automática do plano gratuito do Supabase.

---

**Clube do Livro** — Feito sob medida para curtir bons filmes e boas conversas com os amigos.
