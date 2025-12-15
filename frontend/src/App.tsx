import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Lobby } from './pages/Lobby'
import { Rules } from './pages/Rules'
import { PublicRooms } from './pages/PublicRooms'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/regras" element={<Rules />} />
        <Route path="/salas" element={<PublicRooms />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
