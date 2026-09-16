export type PieceType = 'crown' | 'shield' | 'leaf' | 'square' | 'stripe'

export interface Piece {
  id: string
  type: PieceType
}

export type Cell = Piece | null
export type Grid = (Cell | undefined)[][]

export interface Position {
  row: number
  col: number
}

// ─── Obstacles ────────────────────────────────────────────────────────────────

export type ObstacleKind = 'grass' | 'box'

export interface Obstacle {
  kind: ObstacleKind
  hp: number
  maxHp: number
}

// Même forme que Grid : undefined = hors grille, null = pas d'obstacle
export type ObstacleGrid = (Obstacle | null | undefined)[][]

// ─── Objectifs (pièces ET obstacles) ─────────────────────────────────────────

export interface Target {
  type: string        // PieceType | ObstacleKind
  required: number
  collected: number
}

// ─── État de jeu ─────────────────────────────────────────────────────────────

export type GamePhase =
  | 'idle'
  | 'swapping'
  | 'reverting'
  | 'matching'
  | 'falling'
  | 'refilling'
  | 'win'
  | 'lose'

export interface GameState {
  grid: Grid
  obstacles: ObstacleGrid
  movesLeft: number
  targets: Target[]
  score: number
  selected: Position | null
  phase: GamePhase
  matchedIds: Set<string>
  combo: number
}

export type PowerUpType = 'hammer' | 'arrow' | 'bomb' | 'joker'

export interface PowerUp {
  type: PowerUpType
  count: number
  icon: string
}
