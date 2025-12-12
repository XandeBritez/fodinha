import { useEffect, useRef } from 'react';
import './GameLog.css';

interface GameLogProps {
  messages: string[];
}

export function GameLog({ messages }: GameLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="game-log">
      <div className="game-log-header">
        📋 Histórico
      </div>
      <div className="game-log-content" ref={logRef}>
        {messages.length === 0 ? (
          <div className="game-log-empty">Aguardando eventos...</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="game-log-message">
              {msg}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
