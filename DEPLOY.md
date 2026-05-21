# Deploy — Supabase + Netlify

Este guia mostra como configurar o banco de dados no Supabase e fazer o deploy no Netlify.

---

## 1. Supabase — Banco de dados

### 1.1 Criar projeto

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **New project**
3. Escolha um nome (ex: `domobianca-erp`), senha forte e região (prefira São Paulo)
4. Aguarde a criação (~1-2 min)

### 1.2 Obter a URL de conexão

No painel do projeto Supabase:
1. Vá em **Project Settings → Database**
2. Role até **Connection string → URI**
3. Selecione o modo **Transaction** (porta 6543) para ambientes serverless
4. Copie a string — ela tem formato:
   ```
   postgresql://postgres.xxxx:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```

### 1.3 Rodar as migrações

Com a string de conexão em mãos, execute localmente:

```bash
SUPABASE_DB_URL="postgresql://postgres.xxxx:SENHA@..." pnpm db:push
```

Isso cria todas as tabelas no banco Supabase.

> **Alternativa:** No painel Supabase, vá em **SQL Editor** e cole o conteúdo
> de cada arquivo em `drizzle/*.sql` (em ordem numérica).

---

## 2. Netlify — Deploy

### 2.1 Conectar repositório

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em **Add new site → Import an existing project**
3. Conecte ao GitHub e selecione `marceloabreujr/domobiancaerp`
4. Netlify detectará o `netlify.toml` automaticamente:
   - **Build command:** `pnpm build:client`
   - **Publish directory:** `dist/public`
   - **Functions directory:** `netlify/functions`

### 2.2 Configurar variáveis de ambiente

No painel Netlify: **Site configuration → Environment variables → Add variable**

| Variável | Valor | Obrigatório |
|---|---|---|
| `SUPABASE_DB_URL` | String de conexão do Supabase (Transaction mode) | ✅ |
| `JWT_SECRET` | String aleatória longa (≥32 chars) | ✅ |
| `VITE_APP_ID` | `domobianca-erp` (ou qualquer string) | ✅ |

> **Gerar JWT_SECRET:** Use `openssl rand -base64 32` ou acesse [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

### 2.3 Deploy

Clique em **Deploy site** — o build leva ~2 minutos.

Após o deploy, o site estará disponível em `https://xxxxx.netlify.app`.

### 2.4 Domínio personalizado (opcional)

Em **Domain management → Add custom domain** configure seu domínio.

---

## 3. Primeiro acesso

Após o deploy, você precisa de um usuário administrador. Execute localmente:

```bash
SUPABASE_DB_URL="postgresql://..." node server/seed-master-user.mjs
```

Ou crie via SQL no painel Supabase — veja o arquivo `server/seed-master-user.mjs` para o formato.

---

## Variáveis de ambiente resumo

```env
# Banco de dados (Supabase Transaction mode)
SUPABASE_DB_URL=postgresql://postgres.xxxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# Autenticação JWT (gere uma string aleatória segura)
JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres

# ID da aplicação (pode ser qualquer string não-vazia)
VITE_APP_ID=domobianca-erp
```
