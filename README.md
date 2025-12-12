# Fodinha - Jogo de Cartas Multiplayer

Jogo de cartas multiplayer baseado nas regras do Fodinha, jogável via navegador.

## 🎮 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ instalado ([baixar aqui](https://nodejs.org/))
- npm ou yarn

### 1️⃣ Clonar o projeto
```bash
git clone <seu-repositorio>
cd fodinha
```

### 2️⃣ Instalar dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3️⃣ Rodar o projeto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Servidor rodando em: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend rodando em: `http://localhost:5173`

### 4️⃣ Jogar!
1. Abra `http://localhost:5173` no navegador
2. Crie uma sala
3. Compartilhe o ID com amigos
4. Amigos entram pelo mesmo endereço com o ID

## 📁 Estrutura do Projeto

```
fodinha/
├── backend/          # Servidor Node.js + Socket.io
│   ├── src/
│   │   ├── server.ts       # Servidor principal
│   │   ├── game/           # Lógica do jogo
│   │   ├── rooms/          # Gerenciamento de salas
│   │   └── types/          # Tipos TypeScript
│   └── package.json
│
├── frontend/         # Cliente React + Vite
│   ├── src/
│   │   ├── App.tsx         # Componente principal
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Custom hooks
│   │   └── types/          # Tipos TypeScript
│   └── package.json
│
├── PRD.md           # Documento de requisitos
└── README.md        # Este arquivo
```

## 🚀 Deploy (Futuro)

Quando estiver pronto para colocar online:
- **Frontend:** Vercel (grátis)
- **Backend:** Railway ou Render ($5-7/mês)

## 🎯 Próximos Passos

- [ ] Implementar lógica do jogo
- [ ] Criar interface do usuário
- [ ] Testar com múltiplos jogadores
- [ ] Adicionar animações
- [ ] Deploy em produção
