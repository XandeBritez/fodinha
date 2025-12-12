import { Card, Suit, CardValue } from '../types';

// Valores das cartas em ordem crescente (sem 8, 9, 10)
const CARD_VALUES: CardValue[] = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
const SUITS: Suit[] = ['ouros', 'espadas', 'copas', 'paus'];

// Hierarquia de força das cartas (índice = força)
const CARD_STRENGTH: Record<CardValue, number> = {
  '4': 0,
  '5': 1,
  '6': 2,
  '7': 3,
  'Q': 4,
  'J': 5,
  'K': 6,
  'A': 7,
  '2': 8,
  '3': 9
};

// Hierarquia de naipes para manilhas (paus > copas > espadas > ouros)
const SUIT_STRENGTH: Record<Suit, number> = {
  'ouros': 0,
  'espadas': 1,
  'copas': 2,
  'paus': 3
};

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.createDeck();
  }

  // Criar baralho de 40 cartas
  private createDeck(): void {
    this.cards = [];
    for (const suit of SUITS) {
      for (const value of CARD_VALUES) {
        this.cards.push({
          suit,
          value,
          id: `${value}-${suit}`
        });
      }
    }
  }

  // Embaralhar
  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  // Distribuir cartas
  deal(count: number): Card[] {
    return this.cards.splice(0, count);
  }

  // Pegar uma carta (para virar a manilha)
  drawOne(): Card | null {
    return this.cards.shift() || null;
  }

  // Resetar baralho
  reset(): void {
    this.createDeck();
    this.shuffle();
  }

  // Calcular qual carta é a manilha baseada na carta virada
  static getManilhaValue(viradaCard: Card): CardValue {
    const currentIndex = CARD_VALUES.indexOf(viradaCard.value);
    const nextIndex = (currentIndex + 1) % CARD_VALUES.length;
    return CARD_VALUES[nextIndex];
  }

  // Verificar se uma carta é manilha
  static isManilha(card: Card, manilhaValue: CardValue): boolean {
    return card.value === manilhaValue;
  }

  // Comparar duas cartas (retorna 1 se card1 vence, -1 se card2 vence, 0 se empate)
  static compareCards(
    card1: Card, 
    card2: Card, 
    manilhaValue: CardValue,
    firstPlayedWins: boolean = true
  ): number {
    const isCard1Manilha = this.isManilha(card1, manilhaValue);
    const isCard2Manilha = this.isManilha(card2, manilhaValue);

    // Se ambas são manilhas, compara por naipe
    if (isCard1Manilha && isCard2Manilha) {
      const suit1Strength = SUIT_STRENGTH[card1.suit];
      const suit2Strength = SUIT_STRENGTH[card2.suit];
      return suit1Strength > suit2Strength ? 1 : -1;
    }

    // Se apenas uma é manilha, ela vence
    if (isCard1Manilha) return 1;
    if (isCard2Manilha) return -1;

    // Comparar cartas normais
    const strength1 = CARD_STRENGTH[card1.value];
    const strength2 = CARD_STRENGTH[card2.value];

    if (strength1 > strength2) return 1;
    if (strength1 < strength2) return -1;

    // Empate: primeira carta jogada vence
    return firstPlayedWins ? 1 : -1;
  }

  // Encontrar vencedor de uma rodada
  static findTrickWinner(
    playedCards: Array<{ playerId: string; card: Card; order: number }>,
    manilhaValue: CardValue
  ): string {
    if (playedCards.length === 0) throw new Error('Nenhuma carta jogada');

    let winner = playedCards[0];

    for (let i = 1; i < playedCards.length; i++) {
      const comparison = this.compareCards(
        playedCards[i].card,
        winner.card,
        manilhaValue,
        false // Em caso de empate, primeira carta jogada vence
      );

      if (comparison > 0) {
        winner = playedCards[i];
      }
    }

    return winner.playerId;
  }
}
