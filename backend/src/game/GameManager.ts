import { Room, Player, GameState, Card, PlayedCard } from '../types';
import { Deck } from './deck';

export class GameManager {
  private room: Room;
  private deck: Deck;

  constructor(room: Room) {
    this.room = room;
    this.deck = new Deck();
  }

  // Iniciar novo jogo
  startGame(): void {
    if (this.room.players.length < 2) {
      throw new Error('Mínimo 2 jogadores para começar');
    }

    // Resetar jogadores
    this.room.players.forEach(player => {
      player.lives = 10;
      player.cards = [];
      player.prediction = null;
      player.roundsWon = 0;
      player.isEliminated = false;
    });

    // Iniciar primeira rodada
    this.startRound(1);
  }

  // Iniciar uma rodada
  startRound(roundNumber: number): void {
    const cardsPerPlayer = this.getCardsForRound(roundNumber);

    // Resetar e embaralhar baralho
    this.deck.reset();

    // Distribuir cartas
    this.room.players.forEach(player => {
      if (!player.isEliminated) {
        player.cards = this.deck.deal(cardsPerPlayer);
        player.prediction = null;
        player.roundsWon = 0;
      }
    });

    // Virar carta para definir manilha
    const manilhaCard = this.deck.drawOne();
    if (!manilhaCard) throw new Error('Erro ao virar carta da manilha');

    // Rotacionar jogador inicial a cada rodada
    const activePlayers = this.room.players.filter(p => !p.isEliminated);
    const startingPlayerIndex = (roundNumber - 1) % activePlayers.length;

    // Criar estado do jogo
    this.room.gameState = {
      currentRound: roundNumber,
      cardsPerPlayer,
      phase: 'prediction',
      manilhaCard,
      currentPlayerIndex: startingPlayerIndex,
      playedCards: [],
      currentTrickWinner: null,
      predictions: {},
      roundsWonThisRound: {},
      trickNumber: 0
    };
  }

  // Calcular quantas cartas por rodada (1-9-1)
  private getCardsForRound(roundNumber: number): number {
    if (roundNumber <= 9) {
      return roundNumber; // 1, 2, 3, ..., 9
    } else {
      return 19 - roundNumber; // 8, 7, 6, ..., 1
    }
  }

  // Fazer previsão
  makePrediction(playerId: string, prediction: number): boolean {
    const gameState = this.room.gameState;
    if (!gameState || gameState.phase !== 'prediction') {
      throw new Error('Não é fase de previsão');
    }

    const player = this.room.players.find(p => p.id === playerId);
    if (!player || player.isEliminated) {
      throw new Error('Jogador não encontrado ou eliminado');
    }

    // Verificar se é a vez do jogador fazer previsão
    const activePlayers = this.room.players.filter(p => !p.isEliminated);
    const predictionsCount = Object.keys(gameState.predictions).length;
    // Calcular o índice do jogador que deve fazer a previsão, começando do currentPlayerIndex
    const currentPredictingIndex = (gameState.currentPlayerIndex + predictionsCount) % activePlayers.length;
    const currentPredictingPlayer = activePlayers[currentPredictingIndex];
    
    if (currentPredictingPlayer.id !== playerId) {
      throw new Error('Não é sua vez de fazer a previsão');
    }

    // Validar previsão
    if (prediction < 0 || prediction > gameState.cardsPerPlayer) {
      throw new Error('Previsão inválida');
    }

    // Verificar se é o último jogador e se a soma daria igual ao total
    
    if (predictionsCount === activePlayers.length - 1) {
      // É o último jogador
      const currentSum = Object.values(gameState.predictions).reduce((a, b) => a + b, 0);
      if (currentSum + prediction === gameState.cardsPerPlayer) {
        throw new Error('Soma das previsões não pode ser igual ao número de cartas');
      }
    }

    // Salvar previsão
    player.prediction = prediction;
    gameState.predictions[playerId] = prediction;

    // Se todos fizeram previsão, iniciar fase de jogo
    if (Object.keys(gameState.predictions).length === activePlayers.length) {
      gameState.phase = 'playing';
      gameState.trickNumber = 1;
    }

    return true;
  }

  // Jogar carta
  playCard(playerId: string, cardId: string): boolean {
    const gameState = this.room.gameState;
    if (!gameState || gameState.phase !== 'playing') {
      throw new Error('Não é fase de jogo');
    }

    const player = this.room.players.find(p => p.id === playerId);
    if (!player || player.isEliminated) {
      throw new Error('Jogador não encontrado ou eliminado');
    }

    // Verificar se é o turno do jogador
    const activePlayers = this.room.players.filter(p => !p.isEliminated);
    const currentPlayer = activePlayers[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      throw new Error('Não é seu turno');
    }

    // Encontrar e remover carta da mão
    const cardIndex = player.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Carta não encontrada na mão');
    }

    const card = player.cards.splice(cardIndex, 1)[0];

    // Adicionar carta jogada
    gameState.playedCards.push({
      playerId,
      card,
      order: gameState.playedCards.length
    });

    // Próximo jogador
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % activePlayers.length;

    // Se todos jogaram, resolver a rodada
    if (gameState.playedCards.length === activePlayers.length) {
      this.resolveTrick();
    }

    return true;
  }

  // Resolver uma "trick" (rodada de cartas)
  private resolveTrick(): void {
    const gameState = this.room.gameState;
    if (!gameState) return;

    const manilhaValue = Deck.getManilhaValue(gameState.manilhaCard!);
    const winnerId = Deck.findTrickWinner(gameState.playedCards, manilhaValue);

    // Incrementar rodadas ganhas
    const currentWins = gameState.roundsWonThisRound[winnerId] || 0;
    gameState.roundsWonThisRound[winnerId] = currentWins + 1;

    const winner = this.room.players.find(p => p.id === winnerId);
    if (winner) {
      winner.roundsWon++;
    }

    gameState.currentTrickWinner = winnerId;

    // Vencedor começa próxima trick
    const activePlayers = this.room.players.filter(p => !p.isEliminated);
    gameState.currentPlayerIndex = activePlayers.findIndex(p => p.id === winnerId);

    // Verificar se a rodada acabou
    const allCardsPlayed = activePlayers.every(p => p.cards.length === 0);
    
    // Mudar para fase trick-complete para dar tempo de visualizar
    gameState.phase = 'trick-complete';
    
    // Guardar se é a última trick
    if (allCardsPlayed) {
      (gameState as any).isLastTrick = true;
    } else {
      (gameState as any).isLastTrick = false;
    }
  }

  // Continuar para próxima trick (chamado após o delay)
  continueTrick(): void {
    const gameState = this.room.gameState;
    if (!gameState || gameState.phase !== 'trick-complete') return;

    // Limpar cartas jogadas
    gameState.playedCards = [];

    // Verificar se era a última trick
    if ((gameState as any).isLastTrick) {
      gameState.phase = 'scoring';
      this.scoreRound();
    } else {
      gameState.phase = 'playing';
      gameState.trickNumber++;
    }
  }

  // Pontuar rodada
  private scoreRound(): void {
    const gameState = this.room.gameState;
    if (!gameState) return;

    const activePlayers = this.room.players.filter(p => !p.isEliminated);

    // Calcular diferença entre previsão e resultado
    activePlayers.forEach(player => {
      const prediction = player.prediction || 0;
      const actual = player.roundsWon;
      const difference = Math.abs(prediction - actual);

      // Perder vidas
      player.lives -= difference;

      // Eliminar se chegou a 0 ou menos
      if (player.lives <= 0) {
        player.lives = 0;
        player.isEliminated = true;
      }
    });

    // Verificar se o jogo acabou
    const remainingPlayers = this.room.players.filter(p => !p.isEliminated);
    
    if (remainingPlayers.length <= 1) {
      gameState.phase = 'finished';
    } else {
      // Próxima rodada (ciclo infinito)
      const nextRound = gameState.currentRound + 1;
      this.startRound(nextRound);
    }
  }

  // Obter estado atual do jogo
  getGameState(): GameState | null {
    return this.room.gameState;
  }

  // Obter jogadores
  getPlayers(): Player[] {
    return this.room.players;
  }

  // Obter vencedor
  getWinner(): Player | null {
    const remainingPlayers = this.room.players.filter(p => !p.isEliminated);
    return remainingPlayers.length === 1 ? remainingPlayers[0] : null;
  }
}
