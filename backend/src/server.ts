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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: roomManager.getAllRooms().length,
    connections: io.sockets.sockets.size
  });
});

// Socket.io eventos
io.on('connection', (socket: Socket) => {
  console.log('✅ Cliente conectado:', socket.id);

  // Criar sala
  socket.on('create-room', (data: { playerName: string; maxPlayers?: number }) => {
    try {
      const roomId = roomManager.createRoom(socket.id, data.playerName, data.maxPlayers || 10);
      socket.join(roomId);
      socketToRoom.set(socket.id, roomId);

      console.log(`🎮 Sala criada: ${roomId} por ${data.playerName}`);

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
      roomManager.joinRoom(data.roomId, socket.id, data.playerName);
      socket.join(data.roomId);
      socketToRoom.set(socket.id, data.roomId);

      console.log(`👤 ${data.playerName} entrou na sala ${data.roomId}`);

      socket.emit('room-joined', { success: true, roomId: data.roomId });
      
      const room = roomManager.getRoom(data.roomId);
      io.to(data.roomId).emit('room-updated', room);
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
      
      // Verificar se houve vencedor de trick
      if (updatedRoom?.gameState?.currentTrickWinner && updatedRoom.gameState.playedCards.length === 0) {
        const winner = updatedRoom.players.find(p => p.id === updatedRoom.gameState?.currentTrickWinner);
        if (winner) {
          io.to(roomId).emit('game-event', { 
            type: 'trick-winner', 
            message: `🏆 ${winner.name} ganhou a trick!` 
          });
        }
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
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });

  function getSuitSymbol(suit: string): string {
    const symbols: Record<string, string> = {
      'ouros': '♦',
      'espadas': '♠',
      'copas': '♥',
      'paus': '♣'
    };
    return symbols[suit] || '';
  }

  // Desconectar
  socket.on('disconnect', () => {
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      roomManager.leaveRoom(roomId, socket.id);
      socketToRoom.delete(socket.id);

      const room = roomManager.getRoom(roomId);
      if (room) {
        io.to(roomId).emit('room-updated', room);
      }
    }
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Limpar salas antigas a cada hora
setInterval(() => {
  roomManager.cleanupOldRooms();
  console.log('🧹 Limpeza de salas antigas executada');
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🎮 WebSocket pronto para conexões`);
  console.log(`📦 Gerenciador de salas inicializado`);
});
