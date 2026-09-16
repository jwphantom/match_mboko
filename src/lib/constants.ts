import { PieceType, Target, PowerUp } from './types'

export const GRID_ROWS = 8
export const GRID_COLS = 8

// 1 = case valide, 0 = hors grille (forme irrégulière comme dans l'image)
export const GRID_MASK: number[][] = [
  [1, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
]

export const PIECE_TYPES: PieceType[] = ['crown', 'shield', 'leaf', 'square', 'stripe']

export const PIECE_COLORS: Record<PieceType, { bg: string; shadow: string; border: string }> = {
  crown:  { bg: '#FBBF24', shadow: '#B45309', border: '#FDE68A' },
  shield: { bg: '#3B82F6', shadow: '#1D4ED8', border: '#BFDBFE' },
  leaf:   { bg: '#22C55E', shadow: '#15803D', border: '#BBF7D0' },
  square: { bg: '#EF4444', shadow: '#B91C1C', border: '#FECACA' },
  stripe: { bg: '#A855F7', shadow: '#7E22CE', border: '#E9D5FF' },
}

export const INITIAL_MOVES = 20

export const INITIAL_TARGETS: Target[] = [
  { type: 'crown',  required: 15, collected: 0 },
  { type: 'shield', required: 10, collected: 0 },
]

export const POWER_UPS: PowerUp[] = [
  { type: 'hammer', count: 2, icon: '🔨' },
  { type: 'arrow',  count: 5, icon: '🏹' },
  { type: 'bomb',   count: 4, icon: '💣' },
  { type: 'joker',  count: 5, icon: '🃏' },
]

export const POINTS_PER_MATCH = 50
export const COMBO_MULTIPLIER = 0.5
