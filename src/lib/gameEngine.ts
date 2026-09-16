import { Grid, Cell, Position, Piece, PieceType, Target } from './types'
import { GRID_MASK, PIECE_TYPES, GRID_ROWS, GRID_COLS, POINTS_PER_MATCH, COMBO_MULTIPLIER } from './constants'

let idCounter = 0
function genId(): string {
  return `p${++idCounter}`
}

export function isValidCell(row: number, col: number): boolean {
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return false
  return GRID_MASK[row][col] === 1
}

export function areAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row)
  const dc = Math.abs(a.col - b.col)
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1)
}

function randomType(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
}

function createPiece(type?: PieceType): Piece {
  return { id: genId(), type: type ?? randomType() }
}

function getType(grid: Grid, r: number, c: number): PieceType | null {
  const cell = grid[r]?.[c]
  if (cell === undefined || cell === null) return null
  return (cell as Piece).type
}

// Vérifie si placer `type` en (r,c) créerait un match (utilisé à l'init)
function wouldMatch(grid: Grid, r: number, c: number, type: PieceType): boolean {
  const horiz = c >= 2 && getType(grid, r, c - 1) === type && getType(grid, r, c - 2) === type
  const vert  = r >= 2 && getType(grid, r - 1, c) === type && getType(grid, r - 2, c) === type
  return horiz || vert
}

export function initGrid(): Grid {
  const grid: Grid = Array.from({ length: GRID_ROWS }, (_, r) =>
    Array.from({ length: GRID_COLS }, (_, c) =>
      isValidCell(r, c) ? null : undefined
    )
  )

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!isValidCell(r, c)) continue
      let type = randomType()
      let tries = 0
      while (tries < 10 && wouldMatch(grid, r, c, type)) {
        type = randomType()
        tries++
      }
      grid[r][c] = createPiece(type)
    }
  }

  return grid
}

export function findMatches(grid: Grid): Set<string> {
  const matched = new Set<string>()

  // Horizontal
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS - 2; c++) {
      const a = grid[r][c], b = grid[r][c + 1], d = grid[r][c + 2]
      if (!a || !b || !d) continue
      if ((a as Piece).type === (b as Piece).type && (b as Piece).type === (d as Piece).type) {
        matched.add((a as Piece).id)
        matched.add((b as Piece).id)
        matched.add((d as Piece).id)
        let k = c + 3
        while (k < GRID_COLS && grid[r][k] && (grid[r][k] as Piece).type === (a as Piece).type) {
          matched.add((grid[r][k] as Piece).id)
          k++
        }
      }
    }
  }

  // Vertical
  for (let r = 0; r < GRID_ROWS - 2; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const a = grid[r]?.[c], b = grid[r + 1]?.[c], d = grid[r + 2]?.[c]
      if (!a || !b || !d) continue
      if ((a as Piece).type === (b as Piece).type && (b as Piece).type === (d as Piece).type) {
        matched.add((a as Piece).id)
        matched.add((b as Piece).id)
        matched.add((d as Piece).id)
        let k = r + 3
        while (k < GRID_ROWS && grid[k]?.[c] && (grid[k][c] as Piece).type === (a as Piece).type) {
          matched.add((grid[k][c] as Piece).id)
          k++
        }
      }
    }
  }

  return matched
}

export function removeMatches(
  grid: Grid,
  matchedIds: Set<string>
): { newGrid: Grid; removed: Record<PieceType, number> } {
  const removed: Record<PieceType, number> = {
    crown: 0, shield: 0, leaf: 0, square: 0, stripe: 0,
  }

  const newGrid = grid.map(row =>
    row.map(cell => {
      if (cell === undefined || cell === null) return cell
      if (matchedIds.has((cell as Piece).id)) {
        removed[(cell as Piece).type]++
        return null
      }
      return cell
    })
  )

  return { newGrid, removed }
}

// Gravité : les pièces tombent vers le bas dans chaque colonne
export function applyGravity(grid: Grid): Grid {
  const newGrid: Grid = grid.map(row => [...row])

  for (let c = 0; c < GRID_COLS; c++) {
    const validRows: number[] = []
    const pieces: Cell[] = []

    for (let r = 0; r < GRID_ROWS; r++) {
      if (newGrid[r][c] === undefined) continue
      validRows.push(r)
      if (newGrid[r][c] !== null && newGrid[r][c] !== undefined) pieces.push(newGrid[r][c] as Cell)
    }

    let pieceIdx = pieces.length - 1
    for (let i = validRows.length - 1; i >= 0; i--) {
      newGrid[validRows[i]][c] = pieceIdx >= 0 ? pieces[pieceIdx--] : null
    }
  }

  return newGrid
}

// Remplit les cases vides avec de nouvelles pièces
export function refillGrid(grid: Grid): Grid {
  return grid.map(row =>
    row.map(cell => {
      if (cell === undefined) return undefined
      if (cell === null) return createPiece()
      return cell
    })
  )
}

export function swapPieces(grid: Grid, a: Position, b: Position): Grid {
  const newGrid = grid.map(row => [...row])
  ;[newGrid[a.row][a.col], newGrid[b.row][b.col]] = [newGrid[b.row][b.col], newGrid[a.row][a.col]]
  return newGrid
}

export function updateTargets(
  targets: Target[],
  removed: Record<PieceType, number>
): Target[] {
  return targets.map(t => ({
    ...t,
    collected: Math.min(t.required, t.collected + (removed[t.type] ?? 0)),
  }))
}

export function checkWin(targets: Target[]): boolean {
  return targets.every(t => t.collected >= t.required)
}

export function calcScore(matchCount: number, combo: number): number {
  const multiplier = 1 + combo * COMBO_MULTIPLIER
  return Math.round(matchCount * POINTS_PER_MATCH * multiplier)
}

// Supprime une pièce unique (power-up marteau)
export function removePieceAt(grid: Grid, pos: Position): { newGrid: Grid; removed: Record<PieceType, number> } {
  const removed: Record<PieceType, number> = {
    crown: 0, shield: 0, leaf: 0, square: 0, stripe: 0,
  }
  const newGrid = grid.map(row => [...row])
  const cell = newGrid[pos.row][pos.col]
  if (cell && cell !== undefined) {
    removed[(cell as Piece).type]++
    newGrid[pos.row][pos.col] = null
  }
  return { newGrid, removed }
}
