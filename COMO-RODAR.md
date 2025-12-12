# 🚀 Como Rodar o Fodinha na Sua Máquina

## Passo a Passo Simples

### 1. Verificar se tem Node.js instalado

Abra o terminal/prompt e digite:
```bash
node --version
```

Se aparecer algo como `v18.x.x` ou `v20.x.x`, está ok! ✅

Se não tiver, [baixe aqui](https://nodejs.org/) (versão LTS recomendada)

---

### 2. Instalar as dependências

**Abra 2 terminais** (ou abas do terminal)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```
Aguarde instalar (pode demorar 1-2 minutos)

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```
Aguarde instalar (pode demorar 1-2 minutos)

---

### 3. Rodar o projeto

**Terminal 1 - Backend:**
```bash
npm run dev
```

Você verá:
```
🚀 Servidor rodando em http://localhost:3001
🎮 WebSocket pronto para conexões
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Você verá:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

### 4. Abrir no navegador

Abra: **http://localhost:5173**

Pronto! O jogo está rodando! 🎉

---

## Como Testar Multiplayer Localmente

### Opção 1: Múltiplas abas (mesma máquina)
1. Abra várias abas do navegador
2. Todas em `http://localhost:5173`
3. Crie sala em uma aba
4. Entre com o ID nas outras abas

### Opção 2: Outros dispositivos na mesma rede (WiFi)
1. Descubra seu IP local:
   - Windows: `ipconfig` (procure IPv4)
   - Mac/Linux: `ifconfig` ou `ip addr`
   - Exemplo: `192.168.1.100`

2. No frontend, edite `src/App.tsx`:
   ```typescript
   const BACKEND_URL = 'http://192.168.1.100:3001'
   ```

3. Amigos acessam: `http://192.168.1.100:5173`

### Opção 3: Expor para internet (temporário)
Use **ngrok** (grátis):
```bash
# Instalar ngrok
npm install -g ngrok

# Expor backend
ngrok http 3001
```

Copie a URL gerada (ex: `https://abc123.ngrok.io`) e use no frontend.

---

## Comandos Úteis

### Parar os servidores
Pressione `Ctrl + C` em cada terminal

### Limpar e reinstalar
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
cd frontend
rm -rf node_modules
npm install
```

### Ver logs do servidor
Os logs aparecem automaticamente no terminal do backend

---

## Problemas Comuns

### ❌ "Porta 3001 já está em uso"
Outro programa está usando a porta. Mude no backend:
- Edite `backend/src/server.ts`
- Mude `PORT = 3001` para `PORT = 3002`
- Atualize `BACKEND_URL` no frontend

### ❌ "Cannot connect to server"
1. Certifique-se que o backend está rodando
2. Verifique se a URL está correta no frontend
3. Desative firewall/antivírus temporariamente

### ❌ "Module not found"
Execute `npm install` novamente na pasta correta

---

## Próximos Passos

Agora que está rodando, vamos implementar:
1. ✅ Estrutura básica (FEITO!)
2. 🔄 Lógica do jogo (próximo)
3. 🎨 Interface completa
4. 🃏 Sistema de cartas
5. 🎮 Gameplay completo

Pronto para continuar? 🚀
