import { Grid, Cell, Position, Piece, PieceType, Target, Obstacle, ObstacleGrid, ObstacleKind } from './types'
import { GRID_MASK, PIECE_TYPES, GRID_ROWS, GRID_COLS, INITIAL_OBSTACLES, POINTS_PER_MATCH, COMBO_MULTIPLIER } from './constants'

let idCounter = 0
function genId(): string { return `p${++idCounter}` }

export function isValidCell(row: number, col: number): boolean {
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return false
  return GRID_MASK[row][col] === 1
}

export function areAdjacent(a: Position, b: Position): boolean {
  return (Math.abs(a.row - b.row) === 1 && a.col === b.col) ||
         (Math.abs(a.col - b.col) === 1 && a.row === b.row)
}

function randomType(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
}

function createPiece(type?: PieceType): Piece {
  return { id: genId(), type: type ?? randomType() }
}

function getType(grid: Grid, r: number, c: number): PieceType | null {
  const cell = grid[r]?.[c]
  if (!cell || cell === undefined) return null
  return (cell as Piece).type
}

function wouldMatch(grid: Grid, r: number, c: number, type: PieceType): boolean {
  return (c >= 2 && getType(grid, r, c-1) === type && getType(grid, r, c-2) === type) ||
         (r >= 2 && getType(grid, r-1, c) === type && getType(grid, r-2, c) === type)
}

// ─── Initialisation ───────────────────────────────────────────────────────────

export function initGrid(): Grid {
  const grid: Grid = Array.from({ length: GRID_ROWS }, (_, r) =>
    Array.from({ length: GRID_COLS }, (_, c) => isValidCell(r, c) ? null : undefined)
  )

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!isValidCell(r, c)) continue
      let type = randomType(), tries = 0
      while (tries++ < 10 && wouldMatch(grid, r, c, type)) type = randomType()
      grid[r][c] = createPiece(type)
    }
  }

  return grid
}

export function initObstacleGrid(): ObstacleGrid {
  const obs: ObstacleGrid = Array.from({ length: GRID_ROWS }, (_, r) =>
    Array.from({ length: GRID_COLS }, (_, c) => isValidCell(r, c) ? null : undefined)
  )
  for (const { row, col, kind, hp } of INITIAL_OBSTACLES) {
    obs[row][col] = { kind, hp, maxHp: hp }
  }
  return obs
}

// ─── Match detection ──────────────────────────────────────────────────────────

export function findMatches(grid: Grid): Set<string> {
  const matched = new Set<string>()

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS - 2; c++) {
      const a = grid[r][c], b = grid[r][c+1], d = grid[r][c+2]
      if (!a || !b || !d) continue
      if ((a as Piece).type === (b as Piece).type && (b as Piece).type === (d as Piece).type) {
        matched.add((a as Piece).id); matched.add((b as Piece).id); matched.add((d as Piece).id)
        let k = c + 3
        while (k < GRID_COLS && grid[r][k] && (grid[r][k] as Piece).type === (a as Piece).type) {
          matched.add((grid[r][k] as Piece).id); k++
        }
      }
    }
  }

  for (let r = 0; r < GRID_ROWS - 2; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const a = grid[r]?.[c], b = grid[r+1]?.[c], d = grid[r+2]?.[c]
      if (!a || !b || !d) continue
      if ((a as Piece).type === (b as Piece).type && (b as Piece).type === (d as Piece).type) {
        matched.add((a as Piece).id); matched.add((b as Piece).id); matched.add((d as Piece).id)
        let k = r + 3
        while (k < GRID_ROWS && grid[k]?.[c] && (grid[k][c] as Piece).type === (a as Piece).type) {
          matched.add((grid[k][c] as Piece).id); k++
        }
      }
    }
  }

  return matched
}

// ─── Opérations sur la grille ─────────────────────────────────────────────────

export function removeMatches(
  grid: Grid,
  matchedIds: Set<string>
): { newGrid: Grid; removed: Record<string, number> } {
  const removed: Record<string, number> = {}
  const newGrid = grid.map(row =>
    row.map(cell => {
      if (cell === undefined || cell === null) return cell
      if (matchedIds.has((cell as Piece).id)) {
        const t = (cell as Piece).type
        removed[t] = (removed[t] ?? 0) + 1
        return null
      }
      return cell
    })
  )
  return { newGrid, removed }
}

export function applyGravity(grid: Grid): Grid {
  const newGrid: Grid = grid.map(row => [...row])
  for (let c = 0; c < GRID_COLS; c++) {
    const validRows: number[] = []
    const pieces: Cell[] = []
    for (let r = 0; r < GRID_ROWS; r++) {
      if (newGrid[r][c] === undefined) continue
      validRows.push(r)
      if (newGrid[r][c] !== null) pieces.push(newGrid[r][c] as Cell)
    }
    let pieceIdx = pieces.length - 1
    for (let i = validRows.length - 1; i >= 0; i--) {
      newGrid[validRows[i]][c] = pieceIdx >= 0 ? pieces[pieceIdx--] : null
    }
  }
  return newGrid
}

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

// ─── Obstacles ────────────────────────────────────────────────────────────────

/** Positions des pièces matchées dans le grid */
export function getMatchedPositions(grid: Grid, matchedIds: Set<string>): Position[] {
  const positions: Position[] = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = grid[r][c]
      if (cell !== undefined && cell !== null && matchedIds.has((cell as Piece).id)) {
        positions.push({ row: r, col: c })
      }
    }
  }
  return positions
}

const DIRS = [[-1,0],[1,0],[0,-1],[0,1]] as const

/**
 * Frappe les obstacles adjacents (et directs pour grass) aux cellules matchées.
 * Grass : frappée si la case correspondante est matchée (match direct).
 * Box   : frappée si une case adjacente est matchée.
 */
export function hitAdjacentObstacles(
  obstacles: ObstacleGrid,
  matchedPositions: Position[]
): { newObstacles: ObstacleGrid; clearedByKind: Record<string, number> } {
  const newObs = obstacles.map(row => row.map(o => o ? { ...o } : o))
  const clearedByKind: Record<string, number> = {}
  const hit = new Set<string>()

  for (const { row, col } of matchedPositions) {
    // Grass : frappée directement par le match sur sa case
    const selfObs = newObs[row]?.[col]
    if (selfObs && selfObs.kind === 'grass') {
      const key = `${row},${col}`
      if (!hit.has(key)) {
        hit.add(key)
        selfObs.hp--
        if (selfObs.hp <= 0) {
          newObs[row][col] = null
          clearedByKind[selfObs.kind] = (clearedByKind[selfObs.kind] ?? 0) + 1
        }
      }
    }

    // Tous types : frappés par adjacence
    for (const [dr, dc] of DIRS) {
      const nr = row + dr, nc = col + dc
      const key = `${nr},${nc}`
      if (hit.has(key) || !isValidCell(nr, nc)) continue
      const obs = newObs[nr]?.[nc]
      if (!obs) continue
      hit.add(key)
      obs.hp--
      if (obs.hp <= 0) {
        newObs[nr][nc] = null
        clearedByKind[obs.kind] = (clearedByKind[obs.kind] ?? 0) + 1
      }
    }
  }

  return { newObstacles: newObs, clearedByKind }
}

// ─── Objectifs & score ────────────────────────────────────────────────────────

export function updateTargets(targets: Target[], removed: Record<string, number>): Target[] {
  return targets.map(t => ({
    ...t,
    collected: Math.min(t.required, t.collected + (removed[t.type] ?? 0)),
  }))
}

export function checkWin(targets: Target[]): boolean {
  return targets.every(t => t.collected >= t.required)
}

export function calcScore(matchCount: number, combo: number): number {
  const multiplier = 1 + Math.max(0, combo - 1) * COMBO_MULTIPLIER
  return Math.round(matchCount * POINTS_PER_MATCH * multiplier)
}

export function removePieceAt(
  grid: Grid,
  pos: Position
): { newGrid: Grid; removed: Record<string, number> } {
  const removed: Record<string, number> = {}
  const newGrid = grid.map(row => [...row])
  const cell = newGrid[pos.row][pos.col]
  if (cell && cell !== undefined) {
    removed[(cell as Piece).type] = 1
    newGrid[pos.row][pos.col] = null
  }
  return { newGrid, removed }
}

// ─── Power-ups ────────────────────────────────────────────────────────────────

/** Flèche : efface toute la ligne */
export function clearRow(
  grid: Grid, row: number
): { newGrid: Grid; removed: Record<string, number>; positions: Position[] } {
  const newGrid = grid.map(r => [...r])
  const removed: Record<string, number> = {}
  const positions: Position[] = []
  for (let c = 0; c < GRID_COLS; c++) {
    if (!isValidCell(row, c)) continue
    const cell = newGrid[row][c]
    if (cell) {
      removed[(cell as Piece).type] = (removed[(cell as Piece).type] ?? 0) + 1
      positions.push({ row, col: c })
      newGrid[row][c] = null
    }
  }
  return { newGrid, removed, positions }
}

/** Bombe : efface un carré radius×radius autour de la cellule */
export function clearArea(
  grid: Grid, row: number, col: number, radius = 1
): { newGrid: Grid; removed: Record<string, number>; positions: Position[] } {
  const newGrid = grid.map(r => [...r])
  const removed: Record<string, number> = {}
  const positions: Position[] = []
  for (let r = row - radius; r <= row + radius; r++) {
    for (let c = col - radius; c <= col + radius; c++) {
      if (!isValidCell(r, c)) continue
      const cell = newGrid[r][c]
      if (cell) {
        removed[(cell as Piece).type] = (removed[(cell as Piece).type] ?? 0) + 1
        positions.push({ row: r, col: c })
        newGrid[r][c] = null
      }
    }
  }
  return { newGrid, removed, positions }
}

/** Joker : efface toutes les pièces du même type que la cellule cible */
export function clearAllOfType(
  grid: Grid, pieceType: PieceType
): { newGrid: Grid; removed: Record<string, number>; positions: Position[] } {
  const newGrid = grid.map(r => [...r])
  const removed: Record<string, number> = {}
  const positions: Position[] = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!isValidCell(r, c)) continue
      const cell = newGrid[r][c]
      if (cell && (cell as Piece).type === pieceType) {
        removed[(cell as Piece).type] = (removed[(cell as Piece).type] ?? 0) + 1
        positions.push({ row: r, col: c })
        newGrid[r][c] = null
      }
    }
  }
  return { newGrid, removed, positions }
}
