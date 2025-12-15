import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { Room } from '../types'
import { GameBoard } from '../components/GameBoard'
import '../App.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

type AppState = 'disconnected' | 'lobby' | 'waiting' | 'playing'

export function Lobby() {
  const navigate = useNavigate()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [roomIdInput, setRoomIdInput] = useState('')
  const [room, setRoom] = useState<Room | null>(null)
  const [appState, setAppState] = useState<AppState>('disconnected')
  const [error, setError] = useState<string>('')
  const [lobbyMode, setLobbyMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [showToast, setShowToast] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)

  // Conectar ao servidor automaticamente
  useEffect(() => {
    // Verificar se há um roomId na URL
    const urlParams = new URLSearchParams(window.location.search)
    const joinRoomId = urlParams.get('join')
    if (joinRoomId) {
      setRoomIdInput(joinRoomId)
      setLobbyMode('join')
    }

    const newSocket = io(BACKEND_URL)
    
    newSocket.on('connect', () => {
      console.log('✅ Conectado ao servidor!')
      setAppState('lobby')
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Desconectado do servidor')
      setAppState('disconnected')
    })

    // Eventos do jogo
    newSocket.on('room-created', (data: { roomId: string }) => {
      console.log('🎮 Sala criada:', data.roomId)
    })

    newSocket.on('room-joined', (data: { success: boolean; roomId: string }) => {
      console.log('👤 Entrou na sala:', data.roomId)
    })

    newSocket.on('room-updated', (updatedRoom: Room) => {
      console.log('🔄 Sala atualizada')
      setRoom(updatedRoom)
      if (updatedRoom.gameState?.phase === 'waiting' || !updatedRoom.gameState) {
        setAppState('waiting')
      }
    })

    newSocket.on('game-started', (updatedRoom: Room) => {
      console.log('🎲 Jogo iniciado!')
      setRoom(updatedRoom)
      setAppState('playing')
    })

    newSocket.on('game-updated', (updatedRoom: Room) => {
      console.log('🔄 Jogo atualizado')
      setRoom(updatedRoom)
    })

    newSocket.on('game-event', (event: { type: string; message: string }) => {
      console.log('📋 Evento:', event.message)
      window.dispatchEvent(new CustomEvent('game-log-event', { detail: event.message }))
    })

    newSocket.on('error', (data: { message: string }) => {
      console.error('❌ Erro:', data.message)
      setError(data.message)
      setTimeout(() => setError(''), 5000)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const createRoom = () => {
    if (!socket || !playerName.trim()) return
    
    socket.emit('create-room', { 
      playerName: playerName.trim(), 
      maxPlayers: 10,
      isPrivate 
    })
  }

  const joinRoom = () => {
    if (!socket || !playerName.trim() || !roomIdInput.trim()) return
    
    socket.emit('join-room', { 
      roomId: roomIdInput.trim().toUpperCase(), 
      playerName: playerName.trim() 
    })
  }

  const startGame = () => {
    if (!socket) return
    socket.emit('start-game')
  }

  const playCard = (cardId: string) => {
    if (!socket) return
    socket.emit('play-card', { cardId })
  }

  const makePrediction = (prediction: number) => {
    if (!socket) return
    socket.emit('make-prediction', { prediction })
  }

  const restartGame = () => {
    if (!socket) return
    socket.emit('restart-game')
  }

  const copyRoomId = () => {
    if (room) {
      navigator.clipboard.writeText(room.id)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  // Tela de desconectado
  if (appState === 'disconnected') {
    return (
      <div className="app">
        <div className="lobby-container">
          <h1>🃏 Fodinha</h1>
          <div className="lobby">
            <p>Conectando ao servidor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Tela de lobby (criar/entrar)
  if (appState === 'lobby') {
    return (
      <div className="app">
        <div className="lobby-container">
          <h1>🃏 Fodinha</h1>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="lobby">
            {/* Menu inicial */}
            {lobbyMode === 'menu' && (
              <>
                <div className="menu-buttons">
                  <button className="menu-btn" onClick={() => setLobbyMode('create')}>
                    ➕ Criar Sala
                  </button>
                  <button className="menu-btn" onClick={() => setLobbyMode('join')}>
                    🚪 Entrar em Sala
                  </button>
                  <button className="menu-btn" onClick={() => navigate('/salas')}>
                    🌐 Salas Públicas
                  </button>
                </div>
                <button className="rules-link" onClick={() => navigate('/regras')}>
                  📖 Como Jogar
                </button>
              </>
            )}

            {/* Criar sala */}
            {lobbyMode === 'create' && (
              <>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={20}
                  />
                </div>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                    <span>🔒 Sala Privada (não aparece na lista pública)</span>
                  </label>
                </div>
                <div className="button-row">
                  <button className="back-btn" onClick={() => setLobbyMode('menu')}>
                    ← Voltar
                  </button>
                  <button className="action-btn" onClick={createRoom} disabled={!playerName.trim()}>
                    Criar Sala
                  </button>
                </div>
              </>
            )}

            {/* Entrar em sala */}
            {lobbyMode === 'join' && (
              <>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={20}
                  />
                  <input
                    type="text"
                    placeholder="ID da Sala"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                </div>
                <div className="button-row">
                  <button className="back-btn" onClick={() => setLobbyMode('menu')}>
                    ← Voltar
                  </button>
                  <button className="action-btn" onClick={joinRoom} disabled={!playerName.trim() || !roomIdInput.trim()}>
                    Entrar na Sala
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Tela de espera (aguardando jogadores)
  if (appState === 'waiting' && room) {
    const isHost = room.hostId === socket?.id
    const canStart = room.players.length >= 2

    return (
      <div className="app">
        <div className="lobby-container">
          <h1>🃏 Fodinha</h1>
          
          {error && <div className="error-message">{error}</div>}
          {showToast && <div className="toast">✅ ID copiado!</div>}
          
          <div className="waiting-room">
            <div className="room-header">
              <h2>Sala: {room.id}</h2>
              <button onClick={copyRoomId} className="copy-btn">
                📋 Copiar ID
              </button>
            </div>

            <div className="players-list">
              <h3>Jogadores ({room.players.length}/{room.maxPlayers})</h3>
              {room.players.map((player) => (
                <div key={player.id} className="player-item">
                  {player.name} {player.id === room.hostId && '👑'}
                </div>
              ))}
            </div>

            {isHost && (
              <button 
                onClick={startGame} 
                disabled={!canStart}
                className="start-btn"
              >
                {canStart ? 'Iniciar Jogo' : 'Aguardando jogadores (mín. 2)'}
              </button>
            )}

            {!isHost && (
              <p className="waiting-text">Aguardando o host iniciar o jogo...</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Tela de jogo
  if (appState === 'playing' && room && socket && socket.id) {
    return (
      <GameBoard
        room={room}
        myPlayerId={socket.id}
        onPlayCard={playCard}
        onMakePrediction={makePrediction}
        onRestartGame={restartGame}
      />
    )
  }

  return null
}
