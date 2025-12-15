# 🌐 Sistema de Salas Públicas e Privadas

## Funcionalidades Implementadas

### 1. Criar Sala com Opção Privada/Pública
- Ao criar uma sala, você pode escolher se ela será **privada** ou **pública**
- **Salas Públicas**: Aparecem na lista de salas disponíveis para todos os jogadores
- **Salas Privadas**: Só podem ser acessadas através do código da sala (não aparecem na lista)

### 2. Página de Salas Públicas
- Nova página acessível pelo menu principal
- Mostra todas as salas públicas disponíveis
- Atualiza automaticamente a cada 3 segundos
- Exibe informações:
  - ID da sala
  - Nome do host
  - Número de jogadores (atual/máximo)
  - Status (aguardando/em jogo)

### 3. Entrar em Salas Públicas
- Clique no botão "Entrar" em qualquer sala disponível
- Você será redirecionado para a tela de entrada com o ID já preenchido
- Basta digitar seu nome e entrar

## Como Usar

### Criar uma Sala Pública
1. No menu principal, clique em "➕ Criar Sala"
2. Digite seu nome
3. **Deixe desmarcado** "🔒 Sala Privada"
4. Clique em "Criar Sala"
5. Sua sala aparecerá na lista de salas públicas

### Criar uma Sala Privada
1. No menu principal, clique em "➕ Criar Sala"
2. Digite seu nome
3. **Marque** "🔒 Sala Privada"
4. Clique em "Criar Sala"
5. Compartilhe o código da sala com seus amigos

### Ver Salas Públicas
1. No menu principal, clique em "🌐 Salas Públicas"
2. Veja todas as salas disponíveis
3. Clique em "Entrar" na sala desejada
4. Digite seu nome e entre

### Entrar em Sala Privada
1. No menu principal, clique em "🚪 Entrar em Sala"
2. Digite seu nome
3. Digite o código da sala (6 caracteres)
4. Clique em "Entrar na Sala"

## Arquivos Modificados

### Backend
- `backend/src/types/index.ts` - Adicionado campo `isPrivate` na interface `Room`
- `backend/src/rooms/RoomManager.ts` - Adicionado suporte para salas privadas e método `getPublicRooms()`
- `backend/src/server.ts` - Adicionado endpoint `/rooms/public` e atualizado evento `create-room`

### Frontend
- `frontend/src/types/index.ts` - Adicionado campo `isPrivate` na interface `Room`
- `frontend/src/pages/Lobby.tsx` - Adicionado checkbox para sala privada e botão de salas públicas
- `frontend/src/pages/PublicRooms.tsx` - Nova página para listar salas públicas
- `frontend/src/App.tsx` - Adicionada rota `/salas`
- `frontend/src/App.css` - Adicionados estilos para as novas funcionalidades

## Endpoint da API

### GET /rooms/public
Retorna lista de salas públicas disponíveis

**Resposta:**
```json
[
  {
    "id": "ABC123",
    "hostName": "João",
    "playerCount": 2,
    "maxPlayers": 10,
    "isPlaying": false,
    "createdAt": "2025-12-15T10:30:00.000Z"
  }
]
```

## Próximos Passos

Reinicie o backend e frontend para aplicar as mudanças:

```bash
# Backend
cd backend
npm run dev

# Frontend (em outro terminal)
cd frontend
npm run dev
```
