# 📝 Passo a Passo Simples - Deploy Fodinha

## 🎯 Resumo: 3 Passos Principais

1. **Backend no Railway** (5 minutos)
2. **Configurar Frontend** (2 minutos)
3. **Enviar para Hostinger** (5 minutos)

---

## 📦 PASSO 1: Backend no Railway

### 1️⃣ Criar conta
- Acesse: https://railway.app
- Login com GitHub

### 2️⃣ Criar projeto
- "Start a New Project"
- "Deploy from GitHub repo" (ou "Empty Project")

### 3️⃣ Configurar variáveis
Vá em "Variables" e adicione:
```
PORT=3001
CORS_ORIGIN=https://seudominio.com
NODE_ENV=production
```

### 4️⃣ Configurar comandos
Vá em "Settings":
- **Build:** `cd backend && npm install && npm run build`
- **Start:** `cd backend && node dist/server.js`

### 5️⃣ Gerar domínio
- "Settings" → "Networking" → "Generate Domain"
- **COPIE A URL!** Ex: `fodinha-backend.up.railway.app`

---

## ⚙️ PASSO 2: Configurar Frontend

### 1️⃣ Editar URL do backend
Abra `frontend/src/pages/Lobby.tsx` linha 9:

```typescript
const BACKEND_URL = 'https://fodinha-backend.up.railway.app'
```
👆 Cole a URL que o Railway gerou!

### 2️⃣ Fazer build
```bash
cd frontend
npm run build
```

Pronto! Pasta `frontend/dist/` está pronta.

---

## 🌐 PASSO 3: Enviar para Hostinger

### 1️⃣ Acessar FTP
- Painel Hostinger → "Gerenciador de Arquivos"
- Ou use FileZilla

### 2️⃣ Limpar public_html
- Delete tudo que estiver em `public_html/`

### 3️⃣ Enviar arquivos
- Envie **TODO** conteúdo de `frontend/dist/` para `public_html/`

### 4️⃣ Criar .htaccess
Crie arquivo `.htaccess` em `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## ✅ TESTAR

Acesse: `https://seudominio.com`

**Funcionou?** 🎉 Compartilhe com os amigos!

**Não funcionou?** 
- Abra F12 (Console) e veja o erro
- Verifique se a URL do Railway está correta
- Verifique se o `.htaccess` foi criado

---

## 🔄 Atualizar Depois

**Backend:**
- Faça push no GitHub
- Railway atualiza sozinho!

**Frontend:**
```bash
cd frontend
npm run build
# Enviar dist/ via FTP novamente
```

---

## 💡 Dicas

✅ Railway é GRATUITO (500h/mês)
✅ Suporta WebSocket automaticamente
✅ Deploy automático via GitHub
✅ SSL (HTTPS) incluído

---

## 🆘 Problemas?

**"Failed to connect"**
→ URL do Railway está errada no `Lobby.tsx`

**"CORS Error"**
→ `CORS_ORIGIN` no Railway deve ser `https://seudominio.com`

**Página em branco**
→ Falta o `.htaccess` ou arquivos não foram enviados

---

## 📞 Comandos Úteis

```bash
# Build tudo de uma vez
cd backend && npm run build
cd ../frontend && npm run build

# Ver se backend está rodando localmente
cd backend && npm run dev

# Ver se frontend está rodando localmente
cd frontend && npm run dev
```

---

## 🎯 Checklist Rápido

- [ ] Railway: projeto criado
- [ ] Railway: variáveis configuradas
- [ ] Railway: domínio gerado
- [ ] Frontend: URL atualizada
- [ ] Frontend: build feito
- [ ] Hostinger: arquivos enviados
- [ ] Hostinger: .htaccess criado
- [ ] Testado no navegador

**Tudo OK?** Seu jogo está no ar! 🚀
