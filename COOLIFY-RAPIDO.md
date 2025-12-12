# ⚡ Deploy Rápido com Coolify

## 🎯 3 Passos Simples

---

## 1️⃣ Backend no Coolify (5 min)

### Criar Aplicação
1. Coolify → "+ New Project" → "Fodinha Backend"
2. "+ New Resource" → "Application"
3. Cole URL do GitHub (ou repositório local)

### Configurar
**Build Command:**
```bash
cd backend && npm install && npm run build
```

**Start Command:**
```bash
cd backend && node dist/server.js
```

**Port:** `3001`

### Variáveis
```
PORT=3001
CORS_ORIGIN=https://seudominio.com
NODE_ENV=production
```

### Domínio
- Adicione: `api.seudominio.com`
- Configure DNS: A record → IP da VPS

### Deploy
- Clique em "Deploy"
- Aguarde 2-3 minutos

---

## 2️⃣ Frontend (2 min)

### Editar URL
`frontend/src/pages/Lobby.tsx` linha 9:
```typescript
const BACKEND_URL = 'https://api.seudominio.com'
```

### Build
```bash
cd frontend
npm run build
```

---

## 3️⃣ Hostinger (3 min)

### Enviar arquivos
1. Limpe `public_html/`
2. Envie TODO conteúdo de `frontend/dist/`

### Criar .htaccess
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

## ✅ Pronto!

Acesse: `https://seudominio.com`

---

## 🔄 Atualizar

**Backend:**
- Push no GitHub
- Coolify → "Redeploy"

**Frontend:**
```bash
cd frontend && npm run build
# Enviar dist/ via FTP
```

---

## 🆘 Problemas?

**Backend não conecta:**
- Veja logs no Coolify
- Teste: `https://api.seudominio.com`

**DNS não funciona:**
- Aguarde 5-30 minutos
- Verifique: https://dnschecker.org

**CORS Error:**
- `CORS_ORIGIN` deve ser `https://seudominio.com`
- Redeploy no Coolify

---

## 💡 Dica

Ative "Auto Deploy" no Coolify para deploy automático!
