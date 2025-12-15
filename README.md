# 🃏 Fodinha - Jogo de Cartas Multiplayer

Jogo de cartas multiplayer online baseado nas regras tradicionais do Fodinha, totalmente jogável via navegador com comunicação em tempo real.

## ✨ Funcionalidades

### 🎮 Jogo Completo
- **Ciclo infinito de rodadas**: 1→9→1 cartas até sobrar apenas 1 jogador
- **Sistema de vidas**: Cada jogador começa com 10 vidas
- **Manilhas dinâmicas**: Carta virada define a manilha de cada rodada
- **Previsões estratégicas**: Preveja quantas tricks vai ganhar (com restrição de soma)
- **Rodadas às cegas**: Rodadas de 1 e 9 cartas jogadas sem ver as cartas
- **Timer de turno**: 45 segundos para jogar, com barra de progresso colorida (verde→amarelo→vermelho)
- **Jogada automática**: Se o tempo acabar, uma carta aleatória é jogada automaticamente

### 🌐 Multiplayer
- **Salas públicas e privadas**: Crie salas visíveis para todos ou privadas com ID
- **Até 10 jogadores**: Suporte para partidas com 2-10 jogadores
- **Reconexão automática**: Sistema inteligente de reconexão em caso de queda
- **Sincronização em tempo real**: Todas as ações sincronizadas via WebSocket

### 🎨 Interface
- **Design responsivo**: Funciona perfeitamente em desktop e mobile
- **Animações suaves**: Transições e efeitos visuais para melhor experiência
- **Histórico de eventos**: Log de todas as ações do jogo
- **Indicadores visuais**: Turno atual, vidas, previsões e manilhas destacadas
- **Modo mobile otimizado**: Cartas em leque, painéis laterais deslizantes

### 🔧 Sistema
- **Limpeza automática**: Salas abandonadas são removidas após 5 minutos
- **Persistência de sessão**: LocalStorage mantém sua sessão mesmo após fechar o navegador
- **Notificações em tempo real**: Eventos do jogo aparecem instantaneamente para todos

## 🎮 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ instalado ([baixar aqui](https://nodejs.org/))
- npm (vem com Node.js)

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

**Opção A - Scripts automatizados:**

Windows:
```bash
build.bat
```

Linux/Mac:
```bash
chmod +x build.sh
./build.sh
```

**Opção B - Manual:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Servidor rodando em: `http://localhost:3001`

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Frontend rodando em: `http://localhost:5173`

### 4️⃣ Jogar!
1. Abra `http://localhost:5173` no navegador
2. Crie uma sala (pública ou privada)
3. Compartilhe o ID com amigos
4. Amigos entram pelo mesmo endereço usando o ID ou pela lista de salas públicas
5. Host inicia o jogo quando todos estiverem prontos

## 📁 Estrutura do Projeto

```
fodinha/
├── backend/                    # Servidor Node.js + Socket.io
│   ├── src/
│   │   ├── server.ts          # Servidor WebSocket e API REST
│   │   ├── game/
│   │   │   ├── GameManager.ts # Lógica principal do jogo
│   │   │   └── deck.ts        # Baralho e hierarquia de cartas
│   │   ├── rooms/
│   │   │   └── RoomManager.ts # Gerenciamento de salas
│   │   └── types/             # Tipos TypeScript compartilhados
│   └── package.json
│
├── frontend/                   # Cliente React + Vite + TypeScript
│   ├── src/
│   │   ├── App.tsx            # Roteamento principal
│   │   ├── pages/
│   │   │   ├── Lobby.tsx      # Lobby e gerenciamento de salas
│   │   │   ├── Rules.tsx      # Página de regras
│   │   │   └── PublicRooms.tsx # Lista de salas públicas
│   │   ├── components/
│   │   │   ├── GameBoard.tsx  # Tabuleiro principal do jogo
│   │   │   ├── Card.tsx       # Componente de carta
│   │   │   ├── PlayerInfo.tsx # Informações do jogador
│   │   │   └── GameLog.tsx    # Histórico de eventos
│   │   └── types/             # Tipos TypeScript
│   ├── index.html
│   └── package.json
│
├── build.bat                   # Script de build para Windows
├── build.sh                    # Script de build para Linux/Mac
├── PRD.md                      # Documento de requisitos do produto
├── IMPLEMENTACAO.md            # Detalhes de implementação
├── DEPLOY.md                   # Guia de deploy
└── README.md                   # Este arquivo
```

## 🎯 Regras do Jogo

### Objetivo
Ser o último jogador com vidas restantes. Cada jogador começa com 10 vidas.

### Baralho
- 40 cartas (sem 8, 9 e 10)
- Hierarquia: 3 > 2 > A > K > J > Q > 7 > 6 > 5 > 4
- Manilhas: Carta seguinte à virada (ordem de naipes: ♣ > ♥ > ♠ > ♦)

### Rodadas
1. **Subida**: 1 → 2 → 3 → ... → 9 cartas
2. **Descida**: 8 → 7 → 6 → ... → 1 carta
3. **Ciclo infinito**: Repete até sobrar 1 jogador

### Como Jogar
1. **Previsão**: Cada jogador prevê quantas tricks vai ganhar
   - ⚠️ Rodadas de 1 e 9 cartas: previsão às cegas
   - ⚠️ Soma das previsões não pode igualar o número de cartas
2. **Jogadas**: Jogadores jogam cartas em ordem, maior carta/manilha vence
3. **Pontuação**: Diferença entre previsão e resultado = vidas perdidas
4. **Eliminação**: Jogador com 0 vidas é eliminado

### Opções de Deploy
- **Frontend**: Vercel, Netlify, Cloudflare Pages (grátis)
- **Backend**: Railway, Render, Fly.io ($5-7/mês)

## 🛠️ Tecnologias

### Backend
- Node.js + TypeScript
- Express.js
- Socket.io (WebSocket)
- CORS habilitado

### Frontend
- React 18
- TypeScript
- Vite
- Socket.io Client
- React Router

## 📝 Variáveis de Ambiente

### Backend (.env)
```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:3001
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
