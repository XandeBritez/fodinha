# 🚀 Guia de Deploy - Fodinha

## 📋 Pré-requisitos

- Domínio na Hostinger
- Acesso SSH ao servidor (VPS ou Cloud Hosting)
- Node.js 18+ instalado no servidor

---

## 🎯 Parte 1: Deploy do Backend

### 1.1 Preparar o Backend

No seu computador, configure as variáveis de ambiente:

```bash
# Edite backend/.env.production
PORT=3001
CORS_ORIGIN=https://seudominio.com
NODE_ENV=production
```

### 1.2 Fazer Build do Backend

```bash
cd backend
npm install
npm run build
```

Isso vai criar a pasta `backend/dist` com o código compilado.

### 1.3 Subir Backend para o Servidor

**Opção A: Via FTP/SFTP (FileZilla)**
1. Conecte no servidor via SFTP
2. Crie uma pasta `/home/usuario/fodinha-backend`
3. Envie os arquivos:
   - `dist/` (pasta compilada)
   - `package.json`
   - `package-lock.json`
   - `.env.production` (renomeie para `.env`)

**Opção B: Via Git (Recomendado)**
```bash
# No servidor via SSH
cd /home/usuario
git clone seu-repositorio.git fodinha-backend
cd fodinha-backend/backend
npm install --production
npm run build
```

### 1.4 Instalar PM2 (Gerenciador de Processos)

No servidor via SSH:

```bash
npm install -g pm2
```

### 1.5 Iniciar o Backend

```bash
cd /home/usuario/fodinha-backend/backend
pm2 start dist/server.js --name fodinha-backend
pm2 save
pm2 startup
```

### 1.6 Configurar Nginx como Proxy Reverso

Crie o arquivo `/etc/nginx/sites-available/fodinha-backend`:

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site:
```bash
sudo ln -s /etc/nginx/sites-available/fodinha-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 1.7 Configurar SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.seudominio.com
```

---

## 🎨 Parte 2: Deploy do Frontend

### 2.1 Configurar URL do Backend

Edite `frontend/src/pages/Lobby.tsx`:

```typescript
// Linha 9 - Mudar de:
const BACKEND_URL = 'http://localhost:3001'

// Para:
const BACKEND_URL = 'https://api.seudominio.com'
```

### 2.2 Fazer Build do Frontend

```bash
cd frontend
npm install
npm run build
```

Isso vai criar a pasta `frontend/dist` com os arquivos estáticos.

### 2.3 Subir Frontend para Hostinger

**Via FTP/SFTP:**
1. Conecte no servidor da Hostinger via FTP
2. Navegue até a pasta `public_html` do seu domínio
3. Envie TODO o conteúdo da pasta `frontend/dist` para `public_html`

**Estrutura final:**
```
public_html/
├── index.html
├── assets/
│   ├── index-xxx.js
│   └── index-xxx.css
└── vite.svg
```

### 2.4 Configurar .htaccess (para React Router)

Crie o arquivo `public_html/.htaccess`:

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

## 🔧 Parte 3: Configuração de DNS

No painel da Hostinger, configure os registros DNS:

1. **Para o frontend (seudominio.com):**
   - Tipo: A
   - Nome: @
   - Valor: IP do servidor Hostinger

2. **Para o backend (api.seudominio.com):**
   - Tipo: A
   - Nome: api
   - Valor: IP do servidor VPS/Cloud

---

## ✅ Verificação

1. Acesse `https://seudominio.com` - deve carregar o jogo
2. Teste criar uma sala
3. Verifique o console do navegador (F12) para erros

---

## 🐛 Troubleshooting

### Backend não conecta:
```bash
# Ver logs do PM2
pm2 logs fodinha-backend

# Verificar se está rodando
pm2 status

# Reiniciar
pm2 restart fodinha-backend
```

### CORS Error:
- Verifique se `CORS_ORIGIN` no `.env` está correto
- Deve ser `https://seudominio.com` (sem barra no final)

### WebSocket não conecta:
- Verifique configuração do Nginx
- Certifique-se que a seção `/socket.io/` está configurada

---

## 📝 Comandos Úteis

```bash
# Ver logs do backend
pm2 logs fodinha-backend

# Reiniciar backend
pm2 restart fodinha-backend

# Parar backend
pm2 stop fodinha-backend

# Ver status
pm2 status

# Monitorar recursos
pm2 monit
```

---

## 🔄 Atualizações Futuras

Quando fizer mudanças no código:

**Backend:**
```bash
cd backend
npm run build
pm2 restart fodinha-backend
```

**Frontend:**
```bash
cd frontend
npm run build
# Enviar conteúdo de dist/ via FTP para public_html
```
