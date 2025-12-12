import { Player } from '../types';
import './PlayerInfo.css';

interface PlayerInfoProps {
  player: Player;
  isCurrentTurn: boolean;
  isYou: boolean;
}

export function PlayerInfo({ player, isCurrentTurn, isYou }: PlayerInfoProps) {
  return (
    <div className={`player-info ${isCurrentTurn ? 'current-turn' : ''} ${isYou ? 'you' : ''} ${player.isEliminated ? 'eliminated' : ''}`}>
      <div className="player-name">
        {player.name} {isYou && '(Você)'}
        {!player.isConnected && ' 🔌'}
      </div>
      
      <div className="player-lives">
        {'❤️'.repeat(player.lives)}
        {player.lives === 0 && '💀'}
      </div>
      
      {player.prediction !== null && (
        <div className="player-prediction">
          Previu: {player.prediction} | Ganhou: {player.roundsWon}
        </div>
      )}
      
      <div className="player-cards-count">
        🃏 {player.cards.length} carta(s)
      </div>
    </div>
  );
}
