import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Lobby } from './pages/Lobby'
import { Rules } from './pages/Rules'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/regras" element={<Rules />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
