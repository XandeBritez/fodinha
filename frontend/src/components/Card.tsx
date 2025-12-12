import { Card as CardType } from '../types';
import './Card.css';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isPlayable?: boolean;
  isManilha?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SUIT_SYMBOLS: Record<string, string> = {
  'ouros': '♦',
  'espadas': '♠',
  'copas': '♥',
  'paus': '♣'
};

const SUIT_COLORS: Record<string, string> = {
  'ouros': '#ff6b6b',
  'espadas': '#000',
  'copas': '#ff6b6b',
  'paus': '#000'
};

export function Card({ card, onClick, isPlayable = false, isManilha = false, size = 'medium' }: CardProps) {
  const symbol = SUIT_SYMBOLS[card.suit];
  const color = SUIT_COLORS[card.suit];

  return (
    <div
      className={`card ${size} ${isPlayable ? 'playable' : ''} ${isManilha ? 'manilha' : ''}`}
      onClick={isPlayable ? onClick : undefined}
      style={{ borderColor: isManilha ? '#ffd700' : undefined }}
    >
      <div className="card-corner top-left" style={{ color }}>
        <div className="card-value">{card.value}</div>
        <div className="card-suit">{symbol}</div>
      </div>
      
      <div className="card-center" style={{ color }}>
        {symbol}
      </div>
      
      <div className="card-corner bottom-right" style={{ color }}>
        <div className="card-value">{card.value}</div>
        <div className="card-suit">{symbol}</div>
      </div>
    </div>
  );
}
