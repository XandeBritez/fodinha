import { useState, useEffect } from 'react';
import { Room, Card as CardType } from '../types';
import { Card } from './Card';
import { CardBack } from './CardBack';
import { PlayerInfo } from './PlayerInfo';
import { GameLog } from './GameLog';
import './GameBoard.css';

interface GameBoardProps {
  room: Room;
  myPlayerId: string;
  onPlayCard: (cardId: string) => void;
  onMakePrediction: (prediction: number) => void;
  onRestartGame: () => void;
}

export function GameBoard({ room, myPlayerId, onPlayCard, onMakePrediction, onRestartGame }: GameBoardProps) {
  const { gameState, players } = room;
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [lastRound, setLastRound] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [trickWinnerName, setTrickWinnerName] = useState<string | null>(null);
  const [showPlayersSheet, setShowPlayersSheet] = useState(false);
  const [showHistorySheet, setShowHistorySheet] = useState(false);

  // Escutar eventos do servidor via window event
  useEffect(() => {
    const handleGameEvent = (e: CustomEvent<string>) => {
      setGameLog(prev => {
        const newLog = [...prev, e.detail];
        return newLog.length > 50 ? newLog.slice(-50) : newLog;
      });
    };

    window.addEventListener('game-log-event', handleGameEvent as EventListener);
    return () => {
      window.removeEventListener('game-log-event', handleGameEvent as EventListener);
    };
  }, []);

  // Log de início de rodada
  useEffect(() => {
    if (!gameState) return;

    if (gameState.currentRound !== lastRound) {
      setGameLog(prev => {
        const msg = `🔄 Rodada ${gameState.currentRound} iniciada (${gameState.cardsPerPlayer} carta${gameState.cardsPerPlayer > 1 ? 's' : ''})`;
        const newLog = [...prev, msg];
        return newLog.length > 50 ? newLog.slice(-50) : newLog;
      });
      setLastRound(gameState.currentRound);
    }
  }, [gameState?.currentRound, lastRound]);

  // Countdown quando trick completa
  useEffect(() => {
    if (!gameState) return;

    if (gameState.phase === 'trick-complete') {
      // Encontrar o vencedor da trick
      const winner = players.find(p => p.id === gameState.currentTrickWinner);
      setTrickWinnerName(winner?.name || null);

      // Aguardar 1.5 segundos antes de iniciar countdown
      setTimeout(() => {
        setCountdown(3);
        const interval = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }, 1500);

      return () => {
        setCountdown(null);
        setTrickWinnerName(null);
      };
    } else {
      setCountdown(null);
      setTrickWinnerName(null);
    }
  }, [gameState?.phase, gameState?.currentTrickWinner, players]);
  
  if (!gameState) return null;

  const me = players.find(p => p.id === myPlayerId);
  const activePlayers = players.filter(p => !p.isEliminated);
  const currentPlayer = activePlayers[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === myPlayerId;

  // Calcular valor da manilha
  const getManilhaValue = (card: CardType): string => {
    const values = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
    const currentIndex = values.indexOf(card.value);
    const nextIndex = (currentIndex + 1) % values.length;
    return values[nextIndex];
  };

  const manilhaValue = gameState.manilhaCard ? getManilhaValue(gameState.manilhaCard) : null;

  // Verificar se carta é manilha
  const isManilha = (card: CardType): boolean => {
    return card.value === manilhaValue;
  };

  // Calcular soma das previsões
  const predictionsSum = Object.values(gameState.predictions).reduce((a, b) => a + b, 0);
  const predictionsCount = Object.keys(gameState.predictions).length;
  const myPrediction = me && gameState.predictions[me.id] !== undefined ? gameState.predictions[me.id] : null;
  const hasMadePrediction = me ? gameState.predictions[me.id] !== undefined : false;

  // Verificar se é a vez do jogador fazer previsão (ordem rotativa)
  const currentPredictingIndex = (gameState.currentPlayerIndex + predictionsCount) % activePlayers.length;
  const currentPredictingPlayer = activePlayers[currentPredictingIndex];
  const isMyTurnToPredict = currentPredictingPlayer?.id === myPlayerId;

  // Verificar se previsão é válida (último jogador não pode igualar)
  const isLastToPredict = predictionsCount === activePlayers.length - 1 && !hasMadePrediction;
  const invalidPrediction = (pred: number) => {
    if (!isLastToPredict) return false;
    return predictionsSum + pred === gameState.cardsPerPlayer;
  };

  return (
    <div className="game-board">
      {/* Trick Winner + Countdown Overlay */}
      {gameState.phase === 'trick-complete' && (
        <div className="countdown-overlay">
          {trickWinnerName && countdown === null ? (
            <>
              <div className="trick-winner-announcement">
                <div className="winner-trophy">🏆</div>
                <div className="winner-name">{trickWinnerName}</div>
                <div className="winner-text">ganhou a trick!</div>
              </div>
            </>
          ) : countdown !== null ? (
            <>
              <div className="countdown-number">{countdown}</div>
              <div className="countdown-text">Próxima trick...</div>
            </>
          ) : null}
        </div>
      )}

      {/* Header */}
      <div className="game-header">
        <div className="round-info">
          Rodada {gameState.currentRound} | {gameState.cardsPerPlayer} carta(s)
        </div>
        {gameState.phase === 'playing' && (
          <div className="trick-info">
            Trick {gameState.trickNumber}/{gameState.cardsPerPlayer}
          </div>
        )}
      </div>

      {/* Mesa de jogo */}
      <div className="game-table">
        {/* Centro da mesa */}
        <div className="game-center">
          {/* Manilha */}
          {gameState.manilhaCard && (
            <div className="manilha-area">
              <div className="manilha-label">Vira (Manilha: {manilhaValue})</div>
              <Card card={gameState.manilhaCard} size="small" />
            </div>
          )}

          {/* Cartas jogadas */}
          <div className="played-cards">
            {gameState.playedCards.map((pc) => {
              const player = players.find(p => p.id === pc.playerId);
              return (
                <div key={pc.playerId} className="played-card-container">
                  <Card card={pc.card} isManilha={isManilha(pc.card)} />
                  <div className="played-by">{player?.name}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Área de Ação - FORA DA MESA - Só aparece quando tem conteúdo */}
      {(
        (gameState.phase === 'prediction' && me && !hasMadePrediction && isMyTurnToPredict) ||
        (gameState.phase === 'prediction' && me && !hasMadePrediction && !isMyTurnToPredict) ||
        (gameState.phase === 'prediction' && hasMadePrediction) ||
        (gameState.phase === 'scoring') ||
        (gameState.phase === 'finished')
      ) && (
        <div className="action-area">
          {/* Fase de Previsão - Minha vez */}
          {gameState.phase === 'prediction' && me && !hasMadePrediction && isMyTurnToPredict && (
          <div className="prediction-panel">
            <h3>Faça sua previsão</h3>
            <p>Quantas rodadas você vai ganhar?</p>
            
            {/* Mostrar cartas ANTES da previsão (exceto rodadas às cegas) */}
            {gameState.cardsPerPlayer !== 1 && gameState.cardsPerPlayer !== 9 && me.cards.length > 0 && (
              <div className="preview-cards">
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                  Suas cartas:
                </p>
                <div className="cards-hand" style={{ marginBottom: '20px' }}>
                  {me.cards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      isManilha={isManilha(card)}
                      size="small"
                    />
                  ))}
                </div>
              </div>
            )}

            {(gameState.cardsPerPlayer === 1 || gameState.cardsPerPlayer === 9) && (
              <p style={{ fontSize: '0.9rem', color: '#ff6b6b', fontWeight: 'bold', marginBottom: '10px' }}>
                ⚠️ Rodada às cegas! ({gameState.cardsPerPlayer} carta{gameState.cardsPerPlayer > 1 ? 's' : ''})
              </p>
            )}

            <p className="predictions-sum">
              Soma atual: {predictionsSum} / {gameState.cardsPerPlayer}
              {isLastToPredict && ` (não pode ser ${gameState.cardsPerPlayer})`}
            </p>
            <div className="prediction-buttons">
              {Array.from({ length: gameState.cardsPerPlayer + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => onMakePrediction(i)}
                  disabled={invalidPrediction(i)}
                  className={invalidPrediction(i) ? 'invalid' : ''}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fase de Previsão - Aguardando minha vez */}
        {gameState.phase === 'prediction' && me && !hasMadePrediction && !isMyTurnToPredict && (
          <div className="waiting-panel">
            <p>Aguardando <strong>{currentPredictingPlayer?.name}</strong> fazer a previsão...</p>
            <p className="predictions-sum">
              Previsões feitas: {predictionsCount} / {activePlayers.length}
            </p>
            
            {/* Mostrar suas cartas enquanto espera (exceto rodadas às cegas) */}
            {gameState.cardsPerPlayer !== 1 && gameState.cardsPerPlayer !== 9 && me.cards.length > 0 && (
              <div className="preview-cards" style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                  Suas cartas:
                </p>
                <div className="cards-hand">
                  {me.cards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      isManilha={isManilha(card)}
                      size="small"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aguardando previsões */}
        {gameState.phase === 'prediction' && hasMadePrediction && (
          <div className="waiting-panel">
            <p>Aguardando outros jogadores fazerem suas previsões...</p>
            <p>Sua previsão: {myPrediction}</p>
          </div>
        )}

        {/* Fase de Pontuação */}
        {gameState.phase === 'scoring' && (
          <div className="scoring-panel">
            <h3>Fim da rodada!</h3>
            <p>Calculando pontuação...</p>
          </div>
        )}

          {/* Jogo Finalizado */}
          {gameState.phase === 'finished' && (
            <div className="finished-panel">
              <h2>🎉 Jogo Finalizado!</h2>
              {activePlayers.length > 0 && (
                <h3>🏆 Vencedor: {activePlayers[0].name}</h3>
              )}
              <button className="restart-btn" onClick={onRestartGame}>
                🔄 Jogar Novamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toggle Buttons - Mobile Only */}
      <button 
        className="mobile-toggle mobile-toggle-left"
        onClick={() => setShowPlayersSheet(true)}
        aria-label="Ver jogadores"
      >
        👥
      </button>
      <button 
        className="mobile-toggle mobile-toggle-right"
        onClick={() => setShowHistorySheet(true)}
        aria-label="Ver histórico"
      >
        📋
      </button>

      {/* Players Sheet - Mobile */}
      {showPlayersSheet && (
        <>
          <div className="sheet-overlay" onClick={() => setShowPlayersSheet(false)} />
          <div className="sheet sheet-left">
            <div className="sheet-header">
              <h3>👥 Jogadores</h3>
              <button className="sheet-close" onClick={() => setShowPlayersSheet(false)}>✕</button>
            </div>
            <div className="sheet-content">
              {players.map((player) => (
                <PlayerInfo
                  key={player.id}
                  player={player}
                  isCurrentTurn={currentPlayer?.id === player.id}
                  isYou={player.id === myPlayerId}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* History Sheet - Mobile */}
      {showHistorySheet && (
        <>
          <div className="sheet-overlay" onClick={() => setShowHistorySheet(false)} />
          <div className="sheet sheet-right">
            <div className="sheet-header">
              <h3>📋 Histórico</h3>
              <button className="sheet-close" onClick={() => setShowHistorySheet(false)}>✕</button>
            </div>
            <div className="sheet-content">
              <GameLog messages={gameLog} />
            </div>
          </div>
        </>
      )}

      {/* Sidebar com jogadores - FORA DA MESA - Desktop Only */}
      <div className="players-sidebar">
        {players.map((player) => (
          <PlayerInfo
            key={player.id}
            player={player}
            isCurrentTurn={currentPlayer?.id === player.id}
            isYou={player.id === myPlayerId}
          />
        ))}
      </div>

      {/* Game Log - Chat do Sistema - Desktop Only */}
      <GameLog messages={gameLog} />

      {/* Footer com as cartas do jogador - FORA DA MESA */}
      {gameState.phase === 'playing' && me && me.cards.length > 0 && (
        <div className="cards-footer">
          <div className="cards-hand">
            {me.cards.map((card) => (
              (gameState.cardsPerPlayer === 1 || gameState.cardsPerPlayer === 9) ? (
                // Rodadas de 1 e 9 cartas: às cegas (verso)
                <div
                  key={card.id}
                  onClick={() => isMyTurn && onPlayCard(card.id)}
                  style={{ cursor: isMyTurn ? 'pointer' : 'not-allowed' }}
                >
                  <CardBack size="large" />
                </div>
              ) : (
                // Outras rodadas: cartas normais
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => isMyTurn && onPlayCard(card.id)}
                  isPlayable={isMyTurn}
                  isManilha={isManilha(card)}
                  size="large"
                />
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
