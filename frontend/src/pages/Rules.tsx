import { useNavigate } from 'react-router-dom'
import '../App.css'

export function Rules() {
  const navigate = useNavigate()

  return (
    <div className="rules-page">
      <div className="rules-container">
        <h1>📖 Regras do Fodinha</h1>
        
        <div className="rules-content">
          <section>
            <h2>🎯 Objetivo</h2>
            <p>Ser o último jogador com vidas restantes. Cada jogador começa com 10 vidas.</p>
          </section>

          <section>
            <h2>🃏 Baralho</h2>
            <p>Usa-se um baralho de 40 cartas (sem 8, 9 e 10), igual ao truco.</p>
            <p><strong>Hierarquia:</strong> 3 &gt; 2 &gt; A &gt; K &gt; J &gt; Q &gt; 7 &gt; 6 &gt; 5 &gt; 4</p>
          </section>

          <section>
            <h2>⭐ Manilhas</h2>
            <p>Uma carta é virada na mesa. A carta seguinte na hierarquia vira manilha.</p>
            <p><strong>Ordem de naipes:</strong> ♣ Paus &gt; ♥ Copas &gt; ♠ Espadas &gt; ♦ Ouros</p>
          </section>

          <section>
            <h2>🔄 Rodadas (Ciclo Infinito)</h2>
            <p>O jogo funciona em ciclos contínuos até sobrar apenas 1 jogador:</p>
            <ul>
              <li><strong>Subida:</strong> 1 → 2 → 3 → ... → 9 cartas</li>
              <li><strong>Descida:</strong> 8 → 7 → 6 → ... → 1 carta</li>
              <li><strong>Repete:</strong> O ciclo recomeça (1 → 9 → 1...) até restar 1 jogador</li>
            </ul>
            <p>⚠️ O jogo NÃO tem limite de rodadas, continua até haver um vencedor!</p>
          </section>

          <section>
            <h2>🎲 Como Jogar</h2>
            <ol>
              <li><strong>Distribuição:</strong> Cada jogador recebe as cartas da rodada</li>
              <li><strong>Previsão:</strong> Em ordem, cada jogador prevê quantas "tricks" vai ganhar
                <ul>
                  <li>⚠️ Rodadas de 1 e 9 cartas: previsão às cegas (sem ver as cartas)</li>
                  <li>⚠️ A soma das previsões NÃO pode ser igual ao número de cartas</li>
                  <li>O último jogador não pode fazer a previsão que iguale a soma</li>
                </ul>
              </li>
              <li><strong>Jogadas:</strong> Em ordem, cada jogador joga uma carta. A maior carta/manilha vence</li>
              <li><strong>Pontuação:</strong> Diferença entre previsão e resultado = vidas perdidas
                <ul>
                  <li>Previu 2, ganhou 1 = perde 1 vida</li>
                  <li>Previu 0, ganhou 2 = perde 2 vidas</li>
                  <li>Acertou a previsão = não perde vidas</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2>🏆 Vitória</h2>
            <p>O último jogador com vidas restantes vence o jogo!</p>
          </section>
        </div>

        <button className="back-btn-full" onClick={() => navigate('/')}>
          ← Voltar
        </button>
      </div>
    </div>
  )
}
