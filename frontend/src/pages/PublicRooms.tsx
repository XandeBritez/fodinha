import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

interface PublicRoom {
  id: string
  hostName: string
  playerCount: number
  maxPlayers: number
  isPlaying: boolean
  createdAt: string
}

export function PublicRooms() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<PublicRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPublicRooms()
    const interval = setInterval(loadPublicRooms, 3000) // Atualizar a cada 3 segundos
    return () => clearInterval(interval)
  }, [])

  const loadPublicRooms = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/rooms/public`)
      if (!response.ok) throw new Error('Erro ao carregar salas')
      const data = await response.json()
      setRooms(data)
      setError('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = (roomId: string) => {
    navigate(`/?join=${roomId}`)
  }

  return (
    <div className="app">
      <div className="lobby-container">
        <h1>🎮 Salas Públicas</h1>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Carregando salas...</div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <p>😔 Nenhuma sala pública disponível no momento</p>
            <button 
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Criar Nova Sala
            </button>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map(room => (
              <div key={room.id} className="room-card">
                <div className="room-header">
                  <h3>Sala {room.id}</h3>
                  {room.isPlaying && <span className="badge-playing">Em jogo</span>}
                </div>
                <div className="room-info">
                  <p>👤 Host: {room.hostName}</p>
                  <p>👥 Jogadores: {room.playerCount}/{room.maxPlayers}</p>
                </div>
                <button
                  onClick={() => joinRoom(room.id)}
                  disabled={room.playerCount >= room.maxPlayers || room.isPlaying}
                  className={room.playerCount >= room.maxPlayers || room.isPlaying ? 'btn-disabled' : 'btn-primary'}
                >
                  {room.playerCount >= room.maxPlayers ? 'Sala Cheia' : room.isPlaying ? 'Em Jogo' : 'Entrar'}
                </button>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={() => navigate('/')}
          className="back-btn-full"
        >
          ← Voltar
        </button>
      </div>
    </div>
  )
}
