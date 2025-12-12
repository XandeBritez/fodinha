import { Room, Player } from '../types';
import { GameManager } from '../game/GameManager';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private gameManagers: Map<string, GameManager> = new Map();

  // Criar sala
  createRoom(hostId: string, hostName: string, maxPlayers: number = 10): string {
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
      maxPlayers
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

    if (room.players.length >= room.maxPlayers) {
      throw new Error('Sala cheia');
    }

    if (room.gameState && room.gameState.phase !== 'waiting') {
      throw new Error('Jogo já começou');
    }

    // Verificar se jogador já está na sala
    const existingPlayer = room.players.find(p => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.isConnected = true;
      return true;
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

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    // Se o jogo não começou, remover jogador
    if (!room.gameState || room.gameState.phase === 'waiting') {
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
      room.players[playerIndex].isConnected = false;
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

  // Obter sala
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  // Obter todas as salas
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
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

    this.rooms.forEach((room, roomId) => {
      const age = now.getTime() - room.createdAt.getTime();
      const hasConnectedPlayers = room.players.some(p => p.isConnected);

      if (age > maxAge || (!hasConnectedPlayers && room.players.length === 0)) {
        this.rooms.delete(roomId);
        this.gameManagers.delete(roomId);
      }
    });
  }
}
