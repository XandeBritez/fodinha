# 🚀 Deploy Rápido - Fodinha na Hostinger

## ⚡ Passos Rápidos

### 1️⃣ Preparar (no seu PC)

```bash
# Execute o script de build
build.bat

# OU manualmente:
cd backend && npm run build
cd ../frontend && npm run build
```

### 2️⃣ Configurar Backend

**Edite `frontend/src/pages/Lobby.tsx` linha 9:**
```typescript
const BACKEND_URL = 'https://api.seudominio.com'
```

**Edite `backend/.env.production`:**
```
CORS_ORIGIN=https://seudominio.com
```

### 3️⃣ Deploy Frontend (Hostinger)

1. Acesse FTP da Hostinger (FileZilla ou painel)
2. Vá para `public_html/`
3. Envie TODO conteúdo de `frontend/dist/`
4. Crie arquivo `.htaccess`:

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

### 4️⃣ Deploy Backend (VPS/Cloud)

**Você precisa de um servidor separado para o backend!**

Opções:
- **Railway** (Grátis): https://railway.app
- **Render** (Grátis): https://render.com
- **Hostinger VPS** (Pago)

#### Opção Fácil: Railway

1. Crie conta em https://railway.app
2. New Project → Deploy from GitHub
3. Conecte seu repositório
4. Configure variáveis:
   - `PORT=3001`
   - `CORS_ORIGIN=https://seudominio.com`
5. Railway vai gerar uma URL tipo: `fodinha-backend.up.railway.app`
6. Use essa URL no frontend!

### 5️⃣ Atualizar Frontend com URL do Backend

**Edite `frontend/src/pages/Lobby.tsx`:**
```typescript
const BACKEND_URL = 'https://fodinha-backend.up.railway.app'
```

**Rebuild e reenvie:**
```bash
cd frontend
npm run build
# Enviar dist/ via FTP novamente
```

---

## 🎯 Checklist Final

- [ ] Backend rodando (teste: abra a URL no navegador)
- [ ] Frontend com URL correta do backend
- [ ] CORS configurado corretamente
- [ ] .htaccess criado no frontend
- [ ] Teste: criar sala e jogar

---

## 🆘 Problemas Comuns

**"Failed to connect to server"**
- Verifique se o backend está rodando
- Verifique a URL no `BACKEND_URL`
- Abra o console (F12) e veja o erro exato

**"CORS Error"**
- Verifique `CORS_ORIGIN` no backend
- Deve ser exatamente igual ao domínio (sem / no final)

**Página em branco**
- Verifique se o `.htaccess` foi criado
- Limpe cache do navegador (Ctrl+Shift+Del)

---

## 💡 Dica: Teste Local Primeiro

Antes de fazer deploy, teste localmente:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Acesse `http://localhost:5173` e teste tudo!
