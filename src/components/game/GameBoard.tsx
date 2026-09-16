'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid, Position, Piece } from '@/lib/types'
import { GRID_ROWS, GRID_COLS, GRID_MASK } from '@/lib/constants'
import { isValidCell } from '@/lib/gameEngine'
import { PieceCell } from './Piece'

interface Props {
  grid: Grid
  selected: Position | null
  matchedIds: Set<string>
  onTap: (pos: Position) => void
  onSwipe: (from: Position, to: Position) => void
  cellSize: number
}

export function GameBoard({ grid, selected, matchedIds, onTap, onSwipe, cellSize }: Props) {
  const boardRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; y: number; row: number; col: number } | null>(null)

  const gap  = Math.max(3, Math.round(cellSize * 0.07))
  const step = cellSize + gap
  const boardWidth  = GRID_COLS * step - gap
  const boardHeight = GRID_ROWS * step - gap

  // ── Toutes les pièces dans une liste plate ─────────────────────────────────
  // Clé stable = piece.id → React réutilise le même nœud DOM quand une pièce
  // change de position. Framer Motion `layout` détecte le déplacement et anime.
  const pieces: Array<{ piece: Piece; row: number; col: number }> = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!isValidCell(r, c)) continue
      const cell = grid[r][c]
      if (cell) pieces.push({ piece: cell as Piece, row: r, col: c })
    }
  }

  // ── Pointer events (tap + swipe) ───────────────────────────────────────────

  function cellAt(cx: number, cy: number): Position | null {
    if (!boardRef.current) return null
    const rect = boardRef.current.getBoundingClientRect()
    const col = Math.floor((cx - rect.left) / step)
    const row = Math.floor((cy - rect.top)  / step)
    return isValidCell(row, col) ? { row, col } : null
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const cell = cellAt(e.clientX, e.clientY)
    if (!cell) return
    dragStart.current = { x: e.clientX, y: e.clientY, ...cell }
  }

  function handlePointerUp(e: React.PointerEvent) {
    const start = dragStart.current
    dragStart.current = null
    if (!start) return

    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const dist = Math.hypot(dx, dy)

    if (dist < cellSize * 0.25) {
      onTap({ row: start.row, col: start.col })
      return
    }

    // Direction dominante
    let tr = start.row, tc = start.col
    if (Math.abs(dx) >= Math.abs(dy)) tc += dx > 0 ? 1 : -1
    else tr += dy > 0 ? 1 : -1

    if (isValidCell(tr, tc)) {
      onSwipe({ row: start.row, col: start.col }, { row: tr, col: tc })
    }
  }

  return (
    <div
      ref={boardRef}
      style={{ position: 'relative', width: boardWidth, height: boardHeight, touchAction: 'none', cursor: 'pointer' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragStart.current = null }}
      role="grid"
      aria-label="plateau de jeu"
    >
      {/* ── Fonds de case (toujours visibles) ── */}
      {Array.from({ length: GRID_ROWS }, (_, r) =>
        Array.from({ length: GRID_COLS }, (_, c) => {
          if (GRID_MASK[r][c] !== 1) return null
          return (
            <div
              key={`slot-${r}-${c}`}
              style={{
                position: 'absolute',
                left: c * step,
                top: r * step,
                width: cellSize,
                height: cellSize,
                borderRadius: Math.round(cellSize * 0.25),
                background: 'rgba(93,64,30,0.28)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35)',
              }}
            />
          )
        })
      )}

      {/* ── Pièces : liste plate avec layout + AnimatePresence ── */}
      <AnimatePresence>
        {pieces.map(({ piece, row, col }) => {
          const isSelected = selected?.row === row && selected?.col === col
          const isMatched  = matchedIds.has(piece.id)

          return (
            <motion.div
              key={piece.id}
              layout                       // anime le déplacement quand left/top changent
              layoutId={piece.id}          // identité partagée pour les transitions
              style={{
                position: 'absolute',
                left: col * step,
                top: row * step,
                width: cellSize,
                height: cellSize,
                zIndex: isSelected ? 10 : isMatched ? 8 : 1,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isMatched ? 1.18 : isSelected ? 1.12 : 1,
                opacity: 1,
              }}
              exit={{
                scale: 0,
                opacity: 0,
                transition: { duration: 0.22, ease: 'easeIn' },
              }}
              transition={{
                layout: { type: 'spring', stiffness: 420, damping: 30, duration: 0.30 },
                scale:  { type: 'spring', stiffness: 380, damping: 22 },
                opacity: { duration: 0.18 },
              }}
            >
              <PieceCell
                piece={piece}
                isSelected={isSelected}
                isMatched={isMatched}
                cellSize={cellSize}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
