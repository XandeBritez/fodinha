# 🚀 Deploy: Hostinger (Frontend) + Railway (Backend)

## 📋 O que vamos fazer:
- ✅ Frontend → Hostinger (seu domínio)
- ✅ Backend → Railway (gratuito)

---

## 🎯 PARTE 1: Deploy do Backend no Railway (GRATUITO)

### 1.1 Criar conta no Railway
1. Acesse: https://railway.app
2. Clique em "Start a New Project"
3. Faça login com GitHub

### 1.2 Fazer Deploy do Backend

**Opção A: Deploy Direto (Sem Git)**

1. No Railway, clique em "Deploy from GitHub repo"
2. Se não tiver Git, use "Empty Project"
3. Clique em "+ New" → "Empty Service"
4. Vá em "Settings" → "Source" → "Deploy from local directory"

**Opção B: Via GitHub (Recomendado)**

1. Suba seu código para o GitHub
2. No Railway: "Deploy from GitHub repo"
3. Selecione seu repositório
4. Railway detecta automaticamente que é Node.js

### 1.3 Configurar Variáveis de Ambiente

No Railway, vá em "Variables" e adicione:

```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://seudominio.com
```

⚠️ **Importante:** Substitua `seudominio.com` pelo seu domínio real da Hostinger!

### 1.4 Configurar Build

No Railway, vá em "Settings":
- **Build Command:** `cd backend && npm install && npm run build`
- **Start Command:** `cd backend && node dist/server.js`
- **Root Directory:** `/`

### 1.5 Obter URL do Backend

Após o deploy:
1. Vá em "Settings" → "Networking"
2. Clique em "Generate Domain"
3. Railway vai gerar algo como: `fodinha-backend.up.railway.app`
4. **COPIE ESSA URL!** Você vai precisar dela.

---

## 🎨 PARTE 2: Preparar o Frontend

### 2.1 Configurar URL do Backend

Edite o arquivo `frontend/src/pages/Lobby.tsx` na **linha 9**:

```typescript
// ANTES:
const BACKEND_URL = 'http://localhost:3001'

// DEPOIS (use a URL que o Railway gerou):
const BACKEND_URL = 'https://fodinha-backend.up.railway.app'
```

### 2.2 Fazer Build do Frontend

No terminal:

```bash
cd frontend
npm install
npm run build
```

Isso cria a pasta `frontend/dist/` com os arquivos prontos.

---

## 🌐 PARTE 3: Deploy do Frontend na Hostinger

### 3.1 Acessar FTP da Hostinger

**Via FileZilla:**
1. Baixe FileZilla: https://filezilla-project.org
2. No painel da Hostinger, vá em "Arquivos" → "FTP Accounts"
3. Copie as credenciais:
   - Host: `ftp.seudominio.com`
   - Usuário: `u123456789`
   - Senha: (sua senha)
   - Porta: `21`

**Via Gerenciador de Arquivos (mais fácil):**
1. Painel Hostinger → "Arquivos" → "Gerenciador de Arquivos"
2. Navegue até `public_html/`

### 3.2 Enviar Arquivos do Frontend

1. **Limpe a pasta `public_html/`** (delete tudo que estiver lá)
2. **Envie TODO o conteúdo** da pasta `frontend/dist/`:
   - `index.html`
   - pasta `assets/`
   - `vite.svg`
   - etc.

**Estrutura final em `public_html/`:**
```
public_html/
├── index.html
├── assets/
│   ├── index-abc123.js
│   └── index-abc123.css
└── vite.svg
```

### 3.3 Criar arquivo .htaccess

Na pasta `public_html/`, crie um arquivo chamado `.htaccess` com este conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

**Como criar via Gerenciador de Arquivos:**
1. Clique em "+ Novo Arquivo"
2. Nome: `.htaccess`
3. Cole o conteúdo acima
4. Salve

---

## 🔧 PARTE 4: Atualizar CORS no Backend

### 4.1 Voltar no Railway

1. Vá em "Variables"
2. Edite `CORS_ORIGIN`
3. Coloque seu domínio: `https://seudominio.com`
4. Salve (Railway vai fazer redeploy automático)

---

## ✅ PARTE 5: Testar!

1. Acesse seu domínio: `https://seudominio.com`
2. Tente criar uma sala
3. Convide alguém para testar multiplayer

### Se der erro:

**Abra o Console (F12):**
- Chrome/Edge: F12 → Console
- Veja se tem erro de conexão

**Erros comuns:**

❌ **"Failed to connect"**
- Verifique se a URL do Railway está correta no `Lobby.tsx`
- Teste a URL do backend no navegador (deve mostrar algo)

❌ **"CORS Error"**
- Verifique se `CORS_ORIGIN` no Railway está correto
- Deve ser `https://seudominio.com` (sem / no final)

❌ **Página em branco**
- Verifique se o `.htaccess` foi criado
- Limpe cache: Ctrl+Shift+Del

---

## 🔄 Como Atualizar Depois

### Atualizar Backend:
1. Faça as mudanças no código
2. Commit e push para GitHub
3. Railway faz deploy automático!

### Atualizar Frontend:
```bash
cd frontend
npm run build
# Enviar conteúdo de dist/ via FTP novamente
```

---

## 💰 Custos

- **Railway:** GRATUITO (500 horas/mês - suficiente!)
- **Hostinger:** Você já tem o domínio
- **Total:** R$ 0,00/mês 🎉

---

## 📞 Precisa de Ajuda?

**Railway não está funcionando?**
- Veja os logs: Railway → "Deployments" → Clique no deploy → "View Logs"

**Frontend não carrega?**
- Verifique se todos os arquivos de `dist/` foram enviados
- Verifique se o `.htaccess` existe

**WebSocket não conecta?**
- Railway suporta WebSocket automaticamente
- Verifique se a URL está correta (https, não http)

---

## 🎯 Checklist Final

- [ ] Backend no Railway rodando
- [ ] URL do Railway copiada
- [ ] `Lobby.tsx` atualizado com URL do Railway
- [ ] Frontend buildado (`npm run build`)
- [ ] Arquivos enviados para `public_html/`
- [ ] `.htaccess` criado
- [ ] `CORS_ORIGIN` configurado no Railway
- [ ] Testado no navegador
- [ ] Testado multiplayer com outra pessoa

---

## 🚀 Pronto!

Seu jogo está no ar! Compartilhe o link: `https://seudominio.com`
