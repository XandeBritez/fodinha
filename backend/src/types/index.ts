export type Suit = 'ouros' | 'espadas' | 'copas' | 'paus';
export type CardValue = '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K' | 'A' | '2' | '3';

export interface Card {
  suit: Suit;
  value: CardValue;
  id: string;
}

export interface Player {
  id: string;
  name: string;
  lives: number;
  cards: Card[];
  prediction: number | null;
  roundsWon: number;
  isEliminated: boolean;
  isConnected: boolean;
}

export interface PlayedCard {
  playerId: string;
  card: Card;
  order: number;
}

export type GamePhase = 'waiting' | 'prediction' | 'playing' | 'trick-complete' | 'scoring' | 'finished';

export interface GameState {
  currentRound: number;
  cardsPerPlayer: number;
  phase: GamePhase;
  manilhaCard: Card | null;
  currentPlayerIndex: number;
  playedCards: PlayedCard[];
  currentTrickWinner: string | null;
  predictions: Record<string, number>;
  roundsWonThisRound: Record<string, number>;
  trickNumber: number;
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  gameState: GameState | null;
  createdAt: Date;
  maxPlayers: number;
  isPrivate: boolean;
}
