import { Room, Player } from '../types';
import { GameManager } from '../game/GameManager';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private gameManagers: Map<string, GameManager> = new Map();

  // Criar sala
  createRoom(hostId: string, hostName: string, maxPlayers: number = 10, isPrivate: boolean = false): string {
    const roomId = this.generateRoomId();

    const host: Player = {
      id: hostId,
      name: hostName,
      lives: 10,
      cards: [],
      prediction: null,
      roundsWon: 0,
      isEliminated: false,
      isConnected: true
    };

    const room: Room = {
      id: roomId,
      hostId,
      players: [host],
      gameState: null,
      createdAt: new Date(),
      maxPlayers,
      isPrivate
    };

    this.rooms.set(roomId, room);
    this.gameManagers.set(roomId, new GameManager(room));

    return roomId;
  }

  // Entrar na sala
  joinRoom(roomId: string, playerId: string, playerName: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Sala não encontrada');
    }

    // Verificar se jogador já está na sala (reconexão)
    const existingPlayer = room.players.find(p => p.name === playerName);
    if (existingPlayer) {
      // Permitir reconexão mesmo durante o jogo
      existingPlayer.id = playerId; // Atualizar ID do socket
      existingPlayer.isConnected = true;
      console.log(`🔄 ${playerName} reconectou à sala ${roomId}`);
      return true;
    }

    // Novo jogador tentando entrar
    if (room.players.length >= room.maxPlayers) {
      throw new Error('Sala cheia');
    }

    if (room.gameState && room.gameState.phase !== 'waiting') {
      throw new Error('Jogo já começou');
    }

    const player: Player = {
      id: playerId,
      name: playerName,
      lives: 10,
      cards: [],
      prediction: null,
      roundsWon: 0,
      isEliminated: false,
      isConnected: true
    };

    room.players.push(player);
    return true;
  }

  // Sair da sala
  leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    // Se o jogo não começou, remover jogador
    if (!room.gameState || room.gameState.phase === 'waiting') {
      const playerIndex = room.players.findIndex(p => p.id === playerId);
      room.players.splice(playerIndex, 1);

      // Se era o host, passar para próximo jogador
      if (room.hostId === playerId && room.players.length > 0) {
        room.hostId = room.players[0].id;
      }

      // Se sala ficou vazia, deletar
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
        this.gameManagers.delete(roomId);
      }
    } else {
      // Se jogo começou, apenas marcar como desconectado
      player.isConnected = false;
      console.log(`⚠️ ${player.name} desconectou (jogo em andamento)`);
    }
  }

  // Iniciar jogo
  startGame(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Sala não encontrada');
    }

    if (room.hostId !== playerId) {
      throw new Error('Apenas o host pode iniciar o jogo');
    }

    if (room.players.length < 2) {
      throw new Error('Mínimo 2 jogadores para começar');
    }

    const gameManager = this.gameManagers.get(roomId);
    if (!gameManager) {
      throw new Error('Game manager não encontrado');
    }

    gameManager.startGame();
  }

  // Fazer previsão
  makePrediction(roomId: string, playerId: string, prediction: number): void {
    const gameManager = this.gameManagers.get(roomId);
    if (!gameManager) {
      throw new Error('Sala não encontrada');
    }

    gameManager.makePrediction(playerId, prediction);
  }

  // Jogar carta
  playCard(roomId: string, playerId: string, cardId: string): void {
    const gameManager = this.gameManagers.get(roomId);
    if (!gameManager) {
      throw new Error('Sala não encontrada');
    }

    gameManager.playCard(playerId, cardId);
  }

  // Reiniciar jogo
  restartGame(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Sala não encontrada');
    }

    const gameManager = this.gameManagers.get(roomId);
    if (!gameManager) {
      throw new Error('Game manager não encontrado');
    }

    gameManager.startGame();
  }

  // Continuar para próxima trick (após delay)
  continueTrick(roomId: string): void {
    const gameManager = this.gameManagers.get(roomId);
    if (!gameManager) {
      throw new Error('Sala não encontrada');
    }

    gameManager.continueTrick();
  }

  // Obter sala
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  // Obter todas as salas
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  // Obter apenas salas públicas
  getPublicRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(room => !room.isPrivate);
  }

  // Gerar ID único para sala
  private generateRoomId(): string {
    let id: string;
    do {
      id = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(id));
    return id;
  }

  // Limpar salas vazias antigas (executar periodicamente)
  cleanupOldRooms(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    const abandonedAge = 5 * 60 * 1000; // 5 minutos sem jogadores conectados

    this.rooms.forEach((room, roomId) => {
      const age = now.getTime() - room.createdAt.getTime();
      const hasConnectedPlayers = room.players.some(p => p.isConnected);

      // Deletar se:
      // 1. Sala tem mais de 24 horas
      // 2. Sala está vazia
      // 3. Nenhum jogador conectado por mais de 5 minutos
      if (age > maxAge || room.players.length === 0 || (!hasConnectedPlayers && age > abandonedAge)) {
        console.log(`🧹 Removendo sala abandonada: ${roomId}`);
        this.rooms.delete(roomId);
        this.gameManagers.delete(roomId);
      }
    });
  }

  // Deletar uma sala específica
  deleteRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    console.log(`🗑️ Sala ${roomId} deletada manualmente`);
    this.rooms.delete(roomId);
    this.gameManagers.delete(roomId);
    return true;
  }
}
