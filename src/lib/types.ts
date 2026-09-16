export type PieceType = 'crown' | 'shield' | 'leaf' | 'square' | 'stripe'

export interface Piece {
  id: string
  type: PieceType
}

export type Cell = Piece | null

// undefined = hors grille, null = case vide in-bounds, Piece = pièce présente
export type Grid = (Cell | undefined)[][]

export interface Position {
  row: number
  col: number
}

export interface Target {
  type: PieceType
  required: number
  collected: number
}

// Phases distinctes pour piloter la machine à états côté useEffect
export type GamePhase =
  | 'idle'
  | 'swapping'   // animation de swap en cours
  | 'reverting'  // pas de match, retour arrière
  | 'matching'   // highlight des pièces matchées
  | 'falling'    // gravité
  | 'refilling'  // remplissage
  | 'win'
  | 'lose'

export interface GameState {
  grid: Grid
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
