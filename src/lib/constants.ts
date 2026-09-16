import { PieceType, Target, PowerUp, ObstacleKind } from './types'

export const GRID_ROWS = 8
export const GRID_COLS = 8

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
  crown:  { bg: '#FBBF24', shadow: '#B45309', border: '#FEF3C7' },
  shield: { bg: '#3B82F6', shadow: '#1D4ED8', border: '#DBEAFE' },
  leaf:   { bg: '#22C55E', shadow: '#15803D', border: '#DCFCE7' },
  square: { bg: '#EF4444', shadow: '#B91C1C', border: '#FEE2E2' },
  stripe: { bg: '#A855F7', shadow: '#7E22CE', border: '#F3E8FF' },
}

// ─── Obstacles initiaux ───────────────────────────────────────────────────────

export const INITIAL_OBSTACLES: Array<{
  row: number; col: number; kind: ObstacleKind; hp: number
}> = [
  // Herbe (hp=1) aux quatre coins valides
  { row: 0, col: 0, kind: 'grass', hp: 1 },
  { row: 0, col: 7, kind: 'grass', hp: 1 },
  { row: 7, col: 0, kind: 'grass', hp: 1 },
  { row: 7, col: 7, kind: 'grass', hp: 1 },
  // Caisses (hp=2) au centre
  { row: 2, col: 3, kind: 'box',   hp: 2 },
  { row: 2, col: 4, kind: 'box',   hp: 2 },
]

// ─── Objectifs ────────────────────────────────────────────────────────────────

export const INITIAL_TARGETS: Target[] = [
  { type: 'grass', required: 4, collected: 0 },
  { type: 'box',   required: 2, collected: 0 },
]

// ─── Config ───────────────────────────────────────────────────────────────────

export const INITIAL_MOVES = 20

export const POWER_UPS: PowerUp[] = [
  { type: 'hammer', count: 1, icon: '🔨' },
  { type: 'arrow',  count: 6, icon: '🏹' },
  { type: 'bomb',   count: 5, icon: '💣' },
  { type: 'joker',  count: 5, icon: '🃏' },
]

export const POINTS_PER_MATCH = 50
export const COMBO_MULTIPLIER = 0.5
