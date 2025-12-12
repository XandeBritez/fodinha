# 🚀 Deploy: Hostinger (Frontend) + Coolify (Backend)

## 📋 O que vamos fazer:
- ✅ Frontend → Hostinger (seu domínio)
- ✅ Backend → Coolify (sua VPS)

---

## 🎯 PARTE 1: Deploy do Backend no Coolify

### 1.1 Preparar o Repositório

**Opção A: GitHub (Recomendado)**
1. Suba seu código para o GitHub
2. Certifique-se que está tudo commitado

**Opção B: Git Local**
- Coolify pode fazer deploy de repositórios locais também

### 1.2 Criar Projeto no Coolify

1. Acesse seu Coolify: `https://coolify.seudominio.com`
2. Vá em "Projects" → "+ New Project"
3. Nome: `Fodinha Backend`

### 1.3 Adicionar Aplicação

1. Dentro do projeto, clique em "+ New Resource"
2. Selecione "Application"
3. Escolha "Public Repository" (se estiver no GitHub)
4. Cole a URL do repositório

### 1.4 Configurar Build

No Coolify, configure:

**Build Pack:** `nixpacks` (detecta Node.js automaticamente)

**Build Command:**
```bash
cd backend && npm install && npm run build
```

**Start Command:**
```bash
cd backend && node dist/server.js
```

**Port:** `3001`

**Base Directory:** `/` (raiz do projeto)

### 1.5 Configurar Variáveis de Ambiente

No Coolify, vá em "Environment Variables" e adicione:

```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://seudominio.com
```

⚠️ **Importante:** Substitua `seudominio.com` pelo seu domínio real da Hostinger!

### 1.6 Configurar Domínio

1. No Coolify, vá em "Domains"
2. Adicione um domínio: `api.seudominio.com`
3. Coolify vai gerar o certificado SSL automaticamente

**Configurar DNS:**
No painel do seu domínio, adicione:
- **Tipo:** A
- **Nome:** api
- **Valor:** IP da sua VPS
- **TTL:** 3600

### 1.7 Deploy!

1. Clique em "Deploy"
2. Aguarde o build (1-3 minutos)
3. Verifique os logs se der erro

### 1.8 Testar Backend

Acesse: `https://api.seudominio.com`

Deve aparecer algo (mesmo que seja erro 404, significa que está rodando!)

---

## 🎨 PARTE 2: Preparar o Frontend

### 2.1 Configurar URL do Backend

Edite o arquivo `frontend/src/pages/Lobby.tsx` na **linha 9**:

```typescript
// ANTES:
const BACKEND_URL = 'http://localhost:3001'

// DEPOIS:
const BACKEND_URL = 'https://api.seudominio.com'
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

**Via Gerenciador de Arquivos (mais fácil):**
1. Painel Hostinger → "Arquivos" → "Gerenciador de Arquivos"
2. Navegue até `public_html/`

**Via FileZilla:**
1. Baixe FileZilla: https://filezilla-project.org
2. Use as credenciais FTP da Hostinger

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

---

## ✅ PARTE 4: Testar!

1. Acesse seu domínio: `https://seudominio.com`
2. Tente criar uma sala
3. Convide alguém para testar multiplayer

### Se der erro:

**Abra o Console (F12):**
- Chrome/Edge: F12 → Console
- Veja se tem erro de conexão

**Erros comuns:**

❌ **"Failed to connect"**
- Verifique se `api.seudominio.com` está acessível
- Teste no navegador: `https://api.seudominio.com`
- Verifique DNS (pode levar até 24h para propagar)

❌ **"CORS Error"**
- Verifique se `CORS_ORIGIN` no Coolify está correto
- Deve ser `https://seudominio.com` (sem / no final)
- Faça redeploy no Coolify após mudar

❌ **"502 Bad Gateway"**
- Backend não está rodando
- Veja os logs no Coolify: "Logs" → "Application Logs"

❌ **Página em branco**
- Verifique se o `.htaccess` foi criado
- Limpe cache: Ctrl+Shift+Del

---

## 🔄 Como Atualizar Depois

### Atualizar Backend:
1. Faça commit e push no GitHub
2. No Coolify, clique em "Redeploy"
3. Ou configure "Auto Deploy" no Coolify (deploy automático)

### Atualizar Frontend:
```bash
cd frontend
npm run build
# Enviar conteúdo de dist/ via FTP novamente
```

---

## 🔧 Configurações Avançadas do Coolify

### Auto Deploy (Deploy Automático)
1. No Coolify, vá em "General"
2. Ative "Auto Deploy"
3. Agora todo push no GitHub faz deploy automático!

### Webhooks
Coolify gera um webhook automaticamente para GitHub.

### Logs
- "Logs" → "Application Logs" (logs do Node.js)
- "Logs" → "Build Logs" (logs do build)

### Recursos
- "Resources" → Veja CPU, RAM, etc.

---

## 💰 Custos

- **Coolify:** GRATUITO (você já tem a VPS)
- **Hostinger:** Você já tem o domínio
- **Total:** R$ 0,00/mês 🎉

---

## 🎯 Vantagens do Coolify

✅ Controle total da VPS
✅ Deploy automático via GitHub
✅ SSL automático (Let's Encrypt)
✅ Logs em tempo real
✅ Suporta WebSocket nativamente
✅ Pode hospedar múltiplos projetos
✅ Interface amigável

---

## 📞 Troubleshooting

### Backend não inicia no Coolify

**Veja os logs:**
1. Coolify → Seu projeto → "Logs"
2. Procure por erros

**Comandos comuns:**
- Build falhou? Verifique `package.json`
- Port já em uso? Mude a porta no Coolify

### DNS não propaga

**Teste o DNS:**
```bash
nslookup api.seudominio.com
```

Deve retornar o IP da sua VPS.

**Demora:**
- Pode levar de 5 minutos a 24 horas
- Use https://dnschecker.org para verificar

### WebSocket não conecta

Coolify suporta WebSocket automaticamente, mas verifique:
1. SSL está ativo? (deve ser HTTPS)
2. Porta 3001 está aberta no firewall?

---

## 🎯 Checklist Final

- [ ] Backend no Coolify configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Domínio `api.seudominio.com` configurado
- [ ] DNS configurado (A record)
- [ ] Backend deployado e rodando
- [ ] `Lobby.tsx` atualizado com URL do backend
- [ ] Frontend buildado (`npm run build`)
- [ ] Arquivos enviados para `public_html/`
- [ ] `.htaccess` criado
- [ ] Testado no navegador
- [ ] Testado multiplayer

---

## 🚀 Pronto!

Seu jogo está no ar! Compartilhe o link: `https://seudominio.com`

### Próximos passos:
- Configure Auto Deploy no Coolify
- Monitore os recursos da VPS
- Adicione mais jogadores!

---

## 💡 Dicas Extras

**Monitorar recursos:**
- Coolify mostra uso de CPU/RAM em tempo real
- Node.js é leve, não vai consumir muito

**Backup:**
- Coolify tem backup automático
- Configure em "Settings" → "Backup"

**Múltiplos ambientes:**
- Pode criar "staging" e "production" no Coolify
- Útil para testar antes de publicar
