# PRD - Fodinha (Jogo de Cartas Multiplayer)

## 1. Visão Geral do Produto

### 1.1 Objetivo
Desenvolver um jogo de cartas multiplayer "Fodinha" baseado na mecânica de baralho e manilhas do Truco, mas com sistema único de previsões e vidas, acessível via navegador web.

### 1.2 Público-Alvo
- Jogadores casuais e entusiastas de jogos de cartas
- Grupos de amigos que querem jogar online
- Faixa etária: 16+ anos

### 1.3 Plataforma
- Web (navegadores modernos: Chrome, Firefox, Safari, Edge)
- Responsivo (desktop e mobile)

## 2. Requisitos Funcionais

### 2.1 Sistema de Lobby (Sem Autenticação)
- [ ] Criar sala (gera ID único)
- [ ] Entrar em sala via ID
- [ ] Definir nome do jogador ao entrar
- [ ] Sala suporta 2-6 jogadores (configurável)
- [ ] Host pode iniciar partida quando todos estiverem prontos
- [ ] Indicador visual de jogadores conectados
- [ ] Botão "Copiar ID da sala" para compartilhar

### 2.2 Mecânicas do Jogo - FODINHA

#### 2.2.1 Estrutura Básica
- [ ] 2-6 jogadores (individual, sem duplas)
- [ ] Baralho de 40 cartas (sem 8, 9 e 10)
- [ ] Cada jogador começa com 10 vidas
- [ ] Jogo termina quando sobrar apenas 1 jogador com vidas

#### 2.2.2 Progressão de Cartas
- [ ] Rodada 1: 1 carta por jogador
- [ ] Rodada 2: 2 cartas por jogador
- [ ] Continua até Rodada 9: 9 cartas por jogador
- [ ] Rodada 10: volta para 8 cartas
- [ ] Continua diminuindo até Rodada 17: 1 carta
- [ ] Ciclo se repete se necessário

#### 2.2.3 Fluxo de uma Rodada

**Fase 1: Distribuição**
- [ ] Distribuir cartas para cada jogador
- [ ] Virar uma carta na mesa (define manilha)
- [ ] Na primeira rodada: jogadores NÃO veem suas cartas

**Fase 2: Previsões**
- [ ] Ordem horária, cada jogador faz sua previsão
- [ ] Previsão = quantas rodadas o jogador acha que vai ganhar (0 até número de cartas)
- [ ] REGRA CRÍTICA: Soma total das previsões ≠ número de cartas em jogo
- [ ] Último jogador não pode fazer previsão que iguale a soma
- [ ] Interface mostra soma atual e avisa se previsão é inválida

**Fase 3: Jogadas**
- [ ] Ordem horária, cada jogador joga uma carta
- [ ] Maior carta/manilha vence a rodada
- [ ] Vencedor começa a próxima jogada
- [ ] Repetir até todas as cartas serem jogadas

**Fase 4: Contabilização**
- [ ] Contar quantas rodadas cada jogador ganhou
- [ ] Comparar com previsão
- [ ] Diferença = vidas perdidas
- [ ] Exemplo: previu 2, ganhou 1 = perde 1 vida
- [ ] Exemplo: previu 0, ganhou 2 = perde 2 vidas
- [ ] Atualizar vidas de todos os jogadores

#### 2.2.4 Hierarquia de Cartas (Igual ao Truco)
- [ ] Manilhas (baseadas na carta virada):
  - Carta virada + 1 valor = manilha
  - Ordem: ♣ (Paus) > ♥ (Copas) > ♠ (Espadas) > ♦ (Ouros)
- [ ] Cartas normais (ordem decrescente):
  - 3 > 2 > A > K > J > Q > 7 > 6 > 5 > 4
- [ ] Empate: primeira carta jogada vence

#### 2.2.5 Condições de Vitória/Derrota
- [ ] Jogador com 0 vidas é eliminado
- [ ] Último jogador com vidas > 0 vence
- [ ] Placar mostra ranking de eliminação

### 2.3 Interface do Usuário
- [ ] Mesa de jogo visual
- [ ] Cartas na mão do jogador
- [ ] Cartas jogadas na mesa
- [ ] Placar visível
- [ ] Indicador de turno atual
- [ ] Botões de ação (truco, aceitar, recusar)
- [ ] Timer de turno
- [ ] Histórico de rodadas
- [ ] Animações de cartas

### 2.6 Sistema de Pontuação e Ranking
- [ ] Pontuação por partida
- [ ] Estatísticas do jogador (vitórias, derrotas, taxa de vitória)
- [ ] Sistema de ranking/ELO (opcional)
- [ ] Histórico de partidas

## 3. Requisitos Técnicos

### 3.1 Arquitetura Simplificada
```
Frontend: React + TypeScript + Vite
Backend: Node.js + Express + Socket.io
Real-time: Socket.io (WebSockets)
Estado: Em memória (Redis opcional para escalar)
Hospedagem: Vercel (frontend) + Railway/Render (backend)
```

### 3.2 Componentes Principais
- [ ] Cliente Web (React SPA)
- [ ] Servidor de Jogo (Node.js)
  - Gerenciamento de salas
  - Lógica do jogo e validação
  - Distribuição de cartas
  - Cálculo de vencedores
- [ ] WebSocket Server (Socket.io)
  - Comunicação real-time
  - Sincronização de estado
  - Eventos de jogo

### 3.3 Segurança
- [ ] Validação server-side de todas as jogadas
- [ ] Proteção contra trapaça (cartas ocultas no servidor)
- [ ] Rate limiting básico
- [ ] Sanitização de nomes de jogadores
- [ ] IDs de sala únicos e aleatórios

### 3.4 Performance
- [ ] Latência < 200ms para ações
- [ ] Suporte para 50+ salas simultâneas (MVP)
- [ ] Reconexão automática em caso de queda
- [ ] Estado de jogo em memória (volátil)

## 4. Configurações Opcionais (Futuro)

### 4.1 Configurações da Sala
- [ ] Número de jogadores (2-6)
- [ ] Vidas iniciais (5, 10, 15)
- [ ] Tempo limite por turno (30s, 60s, sem limite)
- [ ] Permitir reconexão de jogadores desconectados

## 5. Fases de Desenvolvimento

### Fase 1 - MVP (Minimum Viable Product) ⭐
**Objetivo: Jogo funcional e jogável**
- [ ] Sistema de lobby (criar/entrar sala)
- [ ] Lógica completa do Fodinha (17 rodadas)
- [ ] Interface básica mas funcional
- [ ] Sistema de previsões com validação
- [ ] Hierarquia de cartas e manilhas
- [ ] Sistema de vidas e eliminação
- [ ] Sincronização real-time via Socket.io
- [ ] Responsivo (desktop e mobile básico)

### Fase 2 - Polish e UX
**Objetivo: Melhorar experiência visual**
- [ ] Animações de cartas
- [ ] Feedback visual de ações
- [ ] Sons e efeitos sonoros
- [ ] Melhorar UI/UX mobile
- [ ] Histórico visual de rodadas
- [ ] Indicadores mais claros de turno
- [ ] Loading states e transições

### Fase 3 - Recursos Extras
**Objetivo: Funcionalidades adicionais**
- [ ] Chat de texto na sala
- [ ] Emojis/reações rápidas
- [ ] Configurações de sala (vidas, tempo)
- [ ] Estatísticas da partida
- [ ] Modo espectador
- [ ] Compartilhamento de sala via link
- [ ] Tutorial interativo

## 6. Métricas de Sucesso
- Tempo médio de partida (~20-30 minutos)
- Taxa de conclusão de partidas (>80%)
- Número de salas ativas simultâneas
- Taxa de reconexão bem-sucedida (>90%)
- Latência média de ações (<200ms)

## 7. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Latência alta | Alto | Otimizar WebSockets, servidor próximo aos usuários |
| Trapaça (ver cartas alheias) | Alto | Validação server-side, cartas ocultas no servidor |
| Desconexão de jogadores | Alto | Sistema de reconexão automática, pausar jogo |
| Complexidade da regra de previsões | Médio | UI clara com validação em tempo real |
| Abandono de partidas | Médio | Timer de inatividade, substituir por bot (futuro) |
| Estado volátil (servidor reinicia) | Médio | Implementar Redis para persistência (Fase 2) |

## 8. Modelo de Dados

### 8.1 Sala (Room)
```typescript
{
  id: string,
  hostId: string,
  players: Player[],
  gameState: GameState | null,
  createdAt: Date,
  maxPlayers: number
}
```

### 8.2 Jogador (Player)
```typescript
{
  id: string,
  name: string,
  lives: number,
  cards: Card[],
  prediction: number | null,
  roundsWon: number,
  isEliminated: boolean,
  isConnected: boolean
}
```

### 8.3 Estado do Jogo (GameState)
```typescript
{
  currentRound: number, // 1-17
  cardsPerPlayer: number, // 1-9
  phase: 'prediction' | 'playing' | 'scoring',
  manilhaCard: Card,
  currentPlayerIndex: number,
  playedCards: PlayedCard[],
  roundWinner: string | null,
  predictions: Map<playerId, number>,
  roundsWonThisRound: Map<playerId, number>
}
```

### 8.4 Carta (Card)
```typescript
{
  suit: 'ouros' | 'espadas' | 'copas' | 'paus',
  value: '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K' | 'A' | '2' | '3',
  isManilha: boolean
}
```

## 9. Próximos Passos

### ✅ Concluído
1. ✅ Definir regras específicas do Fodinha
2. ✅ Escolher stack tecnológico (React + Node.js + Socket.io)
3. ✅ Definir modelo de dados

### 🎯 Próximo
4. **Criar estrutura do projeto**
   - Setup frontend (React + Vite + TypeScript)
   - Setup backend (Node.js + Express + Socket.io)
   - Configurar comunicação WebSocket

5. **Implementar lógica do jogo (backend)**
   - Sistema de salas
   - Distribuição de cartas
   - Validação de previsões
   - Cálculo de vencedores de rodada
   - Sistema de vidas

6. **Implementar interface (frontend)**
   - Tela de lobby
   - Tela de jogo
   - Componentes de carta
   - Sistema de previsões

7. **Testes e refinamento**
   - Testar com múltiplos jogadores
   - Ajustar UX
   - Corrigir bugs

---

## Perguntas Finais

1. **Quantos jogadores por padrão?** (sugestão: 4 jogadores)
2. **Desktop ou mobile prioritário?** (sugestão: desktop primeiro)
3. **Quer começar a implementar agora?** Posso criar a estrutura do projeto!
