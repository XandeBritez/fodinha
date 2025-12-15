import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './rooms/RoomManager';

const app = express();
const httpServer = createServer(app);

// Configurar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Socket.io com CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Gerenciador de salas
const roomManager = new RoomManager();

// Mapa de socket.id para roomId
const socketToRoom = new Map<string, string>();

// Timers de turno por sala
const turnTimers = new Map<string, NodeJS.Timeout>();
const TURN_TIME_LIMIT = 45000; // 45 segundos

// Função para iniciar timer de turno
function startTurnTimer(roomId: string) {
  // Limpar timer anterior se existir
  clearTurnTimer(roomId);

  const room = roomManager.getRoom(roomId);
  if (!room || !room.gameState || room.gameState.phase !== 'playing') return;

  const activePlayers = room.players.filter(p => !p.isEliminated);
  const currentPlayer = activePlayers[room.gameState.currentPlayerIndex];
  if (!currentPlayer) return;

  // Enviar evento de início do timer
  io.to(roomId).emit('turn-timer-start', { 
    playerId: currentPlayer.id,
    timeLimit: TURN_TIME_LIMIT 
  });

  // Criar timer
  const timer = setTimeout(() => {
    const currentRoom = roomManager.getRoom(roomId);
    if (!currentRoom || !currentRoom.gameState || currentRoom.gameState.phase !== 'playing') return;

    const currentActivePlayers = currentRoom.players.filter(p => !p.isEliminated);
    const playerToPlay = currentActivePlayers[currentRoom.gameState.currentPlayerIndex];
    
    if (!playerToPlay || playerToPlay.cards.length === 0) return;

    // Escolher carta aleatória
    const randomIndex = Math.floor(Math.random() * playerToPlay.cards.length);
    const randomCard = playerToPlay.cards[randomIndex];

    console.log(`⏰ Tempo esgotado! ${playerToPlay.name} jogou carta aleatória: ${randomCard.value}${getSuitSymbol(randomCard.suit)}`);

    // Enviar evento de timeout
    io.to(roomId).emit('game-event', { 
      type: 'timeout', 
      message: `⏰ Tempo esgotado! ${playerToPlay.name} jogou carta aleatória` 
    });

    // Jogar a carta
    try {
      const livesBefore: Record<string, number> = {};
      currentRoom.players.forEach(p => {
        livesBefore[p.id] = p.lives;
      });

      roomManager.playCard(roomId, playerToPlay.id, randomCard.id);

      io.to(roomId).emit('game-event', { 
        type: 'card-played', 
        message: `🃏 ${playerToPlay.name} jogou ${randomCard.value}${getSuitSymbol(randomCard.suit)}` 
      });

      const updatedRoom = roomManager.getRoom(roomId);
      
      if (updatedRoom?.gameState?.phase === 'trick-complete') {
        const winner = updatedRoom.players.find(p => p.id === updatedRoom.gameState?.currentTrickWinner);
        if (winner) {
          io.to(roomId).emit('game-event', { 
            type: 'trick-winner', 
            message: `🏆 ${winner.name} ganhou a trick!` 
          });
        }

        io.to(roomId).emit('game-updated', updatedRoom);

        setTimeout(() => {
          roomManager.continueTrick(roomId);
          const nextRoom = roomManager.getRoom(roomId);
          if (nextRoom) {
            io.to(roomId).emit('game-updated', nextRoom);
            // Iniciar timer para próximo turno
            if (nextRoom.gameState?.phase === 'playing') {
              startTurnTimer(roomId);
            }
          }
        }, 3000);
        
        return;
      }

      if (updatedRoom?.gameState?.phase === 'prediction' || updatedRoom?.gameState?.phase === 'scoring') {
        updatedRoom.players.forEach(p => {
          const livesLost = (livesBefore[p.id] || 0) - p.lives;
          if (livesLost > 0) {
            io.to(roomId).emit('game-event', { 
              type: 'lives-lost', 
              message: `💔 ${p.name} perdeu ${livesLost} vida${livesLost > 1 ? 's' : ''} (${p.lives} restante${p.lives !== 1 ? 's' : ''})` 
            });
          } else if (livesLost === 0 && livesBefore[p.id] !== undefined) {
            io.to(roomId).emit('game-event', { 
              type: 'prediction-correct', 
              message: `✅ ${p.name} acertou a previsão!` 
            });
          }
          
          if (p.isEliminated && livesBefore[p.id] > 0) {
            io.to(roomId).emit('game-event', { 
              type: 'eliminated', 
              message: `☠️ ${p.name} foi eliminado!` 
            });
          }
        });
      }

      io.to(roomId).emit('game-updated', updatedRoom);

      // Iniciar timer para próximo turno
      if (updatedRoom?.gameState?.phase === 'playing') {
        startTurnTimer(roomId);
      }
    } catch (error: any) {
      console.error('Erro ao jogar carta automática:', error.message);
    }
  }, TURN_TIME_LIMIT);

  turnTimers.set(roomId, timer);
}

// Função para limpar timer
function clearTurnTimer(roomId: string) {
  const timer = turnTimers.get(roomId);
  if (timer) {
    clearTimeout(timer);
    turnTimers.delete(roomId);
  }
}

function getSuitSymbol(suit: string): string {
  const symbols: Record<string, string> = {
    'ouros': '♦',
    'espadas': '♠',
    'copas': '♥',
    'paus': '♣'
  };
  return symbols[suit] || '';
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: roomManager.getAllRooms().length,
    connections: io.sockets.sockets.size
  });
});

// Listar salas públicas
app.get('/rooms/public', (req, res) => {
  const publicRooms = roomManager.getPublicRooms().map(room => ({
    id: room.id,
    hostName: room.players.find(p => p.id === room.hostId)?.name || 'Host',
    playerCount: room.players.length,
    maxPlayers: room.maxPlayers,
    isPlaying: room.gameState?.phase !== 'waiting' && room.gameState !== null,
    createdAt: room.createdAt
  }));
  res.json(publicRooms);
});

// Socket.io eventos
io.on('connection', (socket: Socket) => {
  console.log('✅ Cliente conectado:', socket.id);

  // Criar sala
  socket.on('create-room', (data: { playerName: string; maxPlayers?: number; isPrivate?: boolean }) => {
    try {
      const roomId = roomManager.createRoom(socket.id, data.playerName, data.maxPlayers || 10, data.isPrivate || false);
      socket.join(roomId);
      socketToRoom.set(socket.id, roomId);

      console.log(`🎮 Sala criada: ${roomId} por ${data.playerName} (${data.isPrivate ? 'Privada' : 'Pública'})`);

      socket.emit('room-created', { roomId });
      
      const room = roomManager.getRoom(roomId);
      io.to(roomId).emit('room-updated', room);
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });

  // Entrar na sala
  socket.on('join-room', (data: { roomId: string; playerName: string }) => {
    try {
      const room = roomManager.getRoom(data.roomId);
      
      // Verificar se é uma reconexão (jogador com mesmo nome já existe)
      const existingPlayer = room?.players.find(p => p.name === data.playerName);
      const isReconnection = existingPlayer !== undefined;
      
      // Se for reconexão, remover o socket antigo do mapa
      if (isReconnection && existingPlayer) {
        // Encontrar e remover o socket ID antigo do mapa
        for (const [oldSocketId, roomId] of socketToRoom.entries()) {
          if (roomId === data.roomId) {
            const oldPlayer = room?.players.find(p => p.id === oldSocketId && p.name === data.playerName);
            if (oldPlayer) {
              socketToRoom.delete(oldSocketId);
              console.log(`🔄 Removendo socket antigo ${oldSocketId} de ${data.playerName}`);
              break;
            }
          }
        }
      }
      
      roomManager.joinRoom(data.roomId, socket.id, data.playerName);
      socket.join(data.roomId);
      socketToRoom.set(socket.id, data.roomId);

      console.log(`👤 ${data.playerName} ${isReconnection ? 'reconectou na' : 'entrou na'} sala ${data.roomId}`);

      socket.emit('room-joined', { success: true, roomId: data.roomId });
      
      // Se o jogo já começou, enviar game-started para o jogador reconectado
      if (room?.gameState && room.gameState.phase !== 'waiting') {
        socket.emit('game-started', room);
      }
      
      io.to(data.roomId).emit('room-updated', room);
      
      // Notificar outros jogadores sobre a reconexão
      if (isReconnection && room?.gameState) {
        io.to(data.roomId).emit('game-event', { 
          type: 'reconnect', 
          message: `🔄 ${data.playerName} reconectou!` 
        });
      }
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });

  // Iniciar jogo
  socket.on('start-game', () => {
    try {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) throw new Error('Você não está em uma sala');

      roomManager.startGame(roomId, socket.id);

      console.log(`🎲 Jogo iniciado na sala ${roomId}`);

      const room = roomManager.getRoom(roomId);
      io.to(roomId).emit('game-started', room);
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });

  // Fazer previsão
  socket.on('make-prediction', (data: { prediction: number }) => {
    try {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) throw new Error('Você não está em uma sala');

      const room = roomManager.getRoom(roomId);
      const player = room?.players.find(p => p.id === socket.id);
      
      roomManager.makePrediction(roomId, socket.id, data.prediction);

      console.log(`🔮 Previsão feita: ${data.prediction} na sala ${roomId}`);

      // Enviar evento de log
      io.to(roomId).emit('game-event', { 
        type: 'prediction', 
        message: `🔮 ${player?.name} previu ${data.prediction}` 
      });

      const updatedRoom = roomManager.getRoom(roomId);
      io.to(roomId).emit('game-updated', updatedRoom);

      // Se entrou na fase de jogo, iniciar timer
      if (updatedRoom?.gameState?.phase === 'playing') {
        startTurnTimer(roomId);
      }
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });

  // Reiniciar jogo
  socket.on('restart-game', () => {
    try {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) throw new Error('Você não está em uma sala');

      const room = roomManager.getRoom(roomId);
      if (!room) throw new Error('Sala não encontrada');

      // Apenas o host pode reiniciar
      if (room.hostId !== socket.id) {
        throw new Error('Apenas o host pode reiniciar o jogo');
      }

      roomManager.restartGame(roomId);

      console.log(`🔄 Jogo reiniciado na sala ${roomId}`);

      io.to(roomId).emit('game-event', { 
        type: 'restart', 
        message: `🔄 Jogo reiniciado!` 
      });

      const updatedRoom = roomManager.getRoom(roomId);
      io.to(roomId).emit('game-started', updatedRoom);
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });

  // Jogar carta
  socket.on('play-card', (data: { cardId: string }) => {
    try {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) throw new Error('Você não está em uma sala');

      // Limpar timer quando jogador joga
      clearTurnTimer(roomId);

      const room = roomManager.getRoom(roomId);
      const player = room?.players.find(p => p.id === socket.id);
      
      // Pegar info da carta antes de jogar
      const card = player?.cards.find(c => c.id === data.cardId);
      const cardDisplay = card ? `${card.value}${getSuitSymbol(card.suit)}` : data.cardId;
      
      // Salvar vidas antes da jogada
      const livesBefore: Record<string, number> = {};
      room?.players.forEach(p => {
        livesBefore[p.id] = p.lives;
      });

      roomManager.playCard(roomId, socket.id, data.cardId);

      console.log(`🃏 Carta jogada: ${data.cardId} na sala ${roomId}`);

      // Enviar evento de carta jogada
      io.to(roomId).emit('game-event', { 
        type: 'card-played', 
        message: `🃏 ${player?.name} jogou ${cardDisplay}` 
      });

      const updatedRoom = roomManager.getRoom(roomId);
      
      // Verificar se entrou na fase trick-complete
      if (updatedRoom?.gameState?.phase === 'trick-complete') {
        const winner = updatedRoom.players.find(p => p.id === updatedRoom.gameState?.currentTrickWinner);
        if (winner) {
          io.to(roomId).emit('game-event', { 
            type: 'trick-winner', 
            message: `🏆 ${winner.name} ganhou a trick!` 
          });
        }

        // Enviar atualização com as cartas ainda visíveis
        io.to(roomId).emit('game-updated', updatedRoom);

        // Aguardar 3 segundos antes de continuar
        setTimeout(() => {
          roomManager.continueTrick(roomId);
          const nextRoom = roomManager.getRoom(roomId);
          if (nextRoom) {
            io.to(roomId).emit('game-updated', nextRoom);
            // Iniciar timer para próximo turno
            if (nextRoom.gameState?.phase === 'playing') {
              startTurnTimer(roomId);
            }
          }
        }, 3000);
        
        return; // Não enviar game-updated agora
      }

      // Verificar perda de vidas (fim de rodada)
      if (updatedRoom?.gameState?.phase === 'prediction' || updatedRoom?.gameState?.phase === 'scoring') {
        updatedRoom.players.forEach(p => {
          const livesLost = (livesBefore[p.id] || 0) - p.lives;
          if (livesLost > 0) {
            io.to(roomId).emit('game-event', { 
              type: 'lives-lost', 
              message: `💔 ${p.name} perdeu ${livesLost} vida${livesLost > 1 ? 's' : ''} (${p.lives} restante${p.lives !== 1 ? 's' : ''})` 
            });
          } else if (livesLost === 0 && livesBefore[p.id] !== undefined) {
            io.to(roomId).emit('game-event', { 
              type: 'prediction-correct', 
              message: `✅ ${p.name} acertou a previsão!` 
            });
          }
          
          if (p.isEliminated && livesBefore[p.id] > 0) {
            io.to(roomId).emit('game-event', { 
              type: 'eliminated', 
              message: `☠️ ${p.name} foi eliminado!` 
            });
          }
        });
      }

      io.to(roomId).emit('game-updated', updatedRoom);

      // Iniciar timer para próximo turno
      if (updatedRoom?.gameState?.phase === 'playing') {
        startTurnTimer(roomId);
      }
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });

  // Desconectar
  socket.on('disconnect', () => {
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      roomManager.leaveRoom(roomId, socket.id);
      socketToRoom.delete(socket.id);

      const room = roomManager.getRoom(roomId);
      if (room) {
        io.to(roomId).emit('room-updated', room);
      } else {
        // Sala foi deletada, limpar timer
        clearTurnTimer(roomId);
      }
    }
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Limpar salas abandonadas a cada 1 minuto
setInterval(() => {
  roomManager.cleanupOldRooms();
}, 60 * 1000);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🎮 WebSocket pronto para conexões`);
  console.log(`📦 Gerenciador de salas inicializado`);
});
