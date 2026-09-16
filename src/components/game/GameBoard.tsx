'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid, ObstacleGrid, Position, Piece } from '@/lib/types'
import { GRID_ROWS, GRID_COLS, GRID_MASK } from '@/lib/constants'
import { isValidCell } from '@/lib/gameEngine'
import { PieceCell } from './Piece'
import { ObstacleTile } from './ObstacleTile'

interface Props {
  grid: Grid
  obstacles: ObstacleGrid
  selected: Position | null
  matchedIds: Set<string>
  onTap: (pos: Position) => void
  onSwipe: (from: Position, to: Position) => void
  cellSize: number
}

const FRAME_W    = 8                                 // épaisseur du cadre doré
const CANVAS_PAD = Math.ceil(FRAME_W / 2) + 8       // débordement du canvas (12 px)

// ─────────────────────────────────────────────────────────────────────────────
// drawFrame
//
// Dessin du cadre irrégulier sur Canvas.
// Algorithme :
//   1. Remplissage bois des cases valides + leurs interstices
//   2. Collecte des segments de bordure (bord externe des cases valides)
//   3. Ajout de "connecteurs" qui ferment les micro-gaps entre segments voisins
//   4. Rendu en 5 passes superposées (ombre, contour sombre, dorure, creux, reflet)
//   5. Rivets aux coins convexes extérieurs
//
// lineCap='round' → tous les coins sont naturellement arrondis, y compris
// les encoches de la grille irrégulière.
// ─────────────────────────────────────────────────────────────────────────────

function drawFrame(
  canvas: HTMLCanvasElement,
  step: number,
  cellSize: number,
  gap: number,
) {
  const dpr = window.devicePixelRatio || 1
  const CW  = canvas.width  / dpr
  const CH  = canvas.height / dpr
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, CW, CH)

  const O = CANVAS_PAD   // (O, O) canvas = (0, 0) plateau
  const mask = GRID_MASK

  // ── 1. Fond bois sous toutes les cases valides + interstices ──────────────
  // Visible dans les gaps entre cells ; les divs bleues le recouvrent au centre.
  const woodGrad = ctx.createLinearGradient(O, O, O + GRID_COLS * step, O + GRID_ROWS * step)
  woodGrad.addColorStop(0.0, '#6B2E0A')
  woodGrad.addColorStop(0.4, '#7C3410')
  woodGrad.addColorStop(0.7, '#5A2506')
  woodGrad.addColorStop(1.0, '#6B2E0A')
  ctx.fillStyle = woodGrad

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (mask[r][c] !== 1) continue
      const x = O + c * step, y = O + r * step
      // Case elle-même
      ctx.fillRect(x, y, cellSize, cellSize)
      // Gap horizontal vers la droite
      if (c < GRID_COLS - 1 && mask[r][c + 1] === 1)
        ctx.fillRect(x + cellSize, y, gap, cellSize)
      // Gap vertical vers le bas
      if (r < GRID_ROWS - 1 && mask[r + 1][c] === 1)
        ctx.fillRect(x, y + cellSize, cellSize, gap)
      // Coin (gap×gap entre 4 cases valides)
      if (c < GRID_COLS - 1 && r < GRID_ROWS - 1 &&
          mask[r][c + 1] === 1 && mask[r + 1][c] === 1 && mask[r + 1][c + 1] === 1)
        ctx.fillRect(x + cellSize, y + cellSize, gap, gap)
    }
  }

  // ── 2. Segments de bordure : bord d'une case valide face à une invalide ───
  type Seg = [number, number, number, number]
  const segs: Seg[] = []

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (mask[r][c] !== 1) continue
      const x  = O + c * step,     y  = O + r * step
      const x2 = x + cellSize,     y2 = y + cellSize

      if (r === 0             || mask[r - 1]?.[c] !== 1) segs.push([x,  y,  x2, y ])   // haut
      if (r === GRID_ROWS - 1 || mask[r + 1]?.[c] !== 1) segs.push([x,  y2, x2, y2])  // bas
      if (c === 0             || mask[r]?.[c - 1] !== 1) segs.push([x,  y,  x,  y2])  // gauche
      if (c === GRID_COLS - 1 || mask[r]?.[c + 1] !== 1) segs.push([x2, y,  x2, y2]) // droite
    }
  }

  // ── 3. Connecteurs : ferme les micro-gaps entre segments adjacents ─────────
  // Sans eux, les coins concaves de l'encoche auraient un espace de `gap` px.
  // Avec lineCap='round', les caps arrondis se chevauchent déjà pour gap≤FRAME_W/2,
  // mais les connecteurs rendent la jonction propre à toutes tailles.

  // Connecteurs VERTICAUX (même colonne, deux lignes consécutives)
  for (let r = 0; r < GRID_ROWS - 1; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (mask[r][c] !== 1 || mask[r + 1][c] !== 1) continue
      // Bordure droite : les deux lignes ont un bord droit au même x ?
      if ((c === GRID_COLS - 1 || mask[r][c + 1] !== 1) &&
          (c === GRID_COLS - 1 || mask[r + 1][c + 1] !== 1)) {
        const x = O + c * step + cellSize
        segs.push([x, O + r * step + cellSize, x, O + (r + 1) * step])
      }
      // Bordure gauche : les deux lignes ont un bord gauche au même x ?
      if ((c === 0 || mask[r][c - 1] !== 1) &&
          (c === 0 || mask[r + 1][c - 1] !== 1)) {
        const x = O + c * step
        segs.push([x, O + r * step + cellSize, x, O + (r + 1) * step])
      }
    }
  }

  // Connecteurs HORIZONTAUX (même ligne, deux colonnes consécutives)
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS - 1; c++) {
      if (mask[r][c] !== 1 || mask[r][c + 1] !== 1) continue
      // Bordure haute : les deux colonnes ont un bord haut au même y ?
      if ((r === 0 || mask[r - 1]?.[c] !== 1) &&
          (r === 0 || mask[r - 1]?.[c + 1] !== 1)) {
        const y = O + r * step
        segs.push([O + c * step + cellSize, y, O + (c + 1) * step, y])
      }
      // Bordure basse : les deux colonnes ont un bord bas au même y ?
      if ((r === GRID_ROWS - 1 || mask[r + 1]?.[c] !== 1) &&
          (r === GRID_ROWS - 1 || mask[r + 1]?.[c + 1] !== 1)) {
        const y = O + r * step + cellSize
        segs.push([O + c * step + cellSize, y, O + (c + 1) * step, y])
      }
    }
  }

  // ── 4. Passes de rendu ─────────────────────────────────────────────────────
  const draw = (style: string | CanvasGradient, lw: number) => {
    ctx.strokeStyle = style
    ctx.lineWidth   = lw
    ctx.lineCap     = 'round'   // coins arrondis naturellement
    ctx.lineJoin    = 'round'
    for (const [x1, y1, x2, y2] of segs) {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    }
  }

  // Passe A : grande ombre portée
  ctx.shadowColor   = 'rgba(0,0,0,0.7)'
  ctx.shadowBlur    = 10
  ctx.shadowOffsetX = 4
  ctx.shadowOffsetY = 6
  draw('#3B0F00', FRAME_W + 8)
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0

  // Passe B : contour extérieur brun foncé (donne l'épaisseur au cadre)
  draw('#5A1F00', FRAME_W + 4)

  // Passe C : dorure principale — gradient vertical pour relief 3D
  const gold = ctx.createLinearGradient(0, O, 0, CH - O)
  gold.addColorStop(0.00, '#FFF0A0')
  gold.addColorStop(0.15, '#F5D060')
  gold.addColorStop(0.40, '#C8860A')
  gold.addColorStop(0.55, '#E8A020')
  gold.addColorStop(0.75, '#F5D060')
  gold.addColorStop(1.00, '#FFF0A0')
  draw(gold, FRAME_W)

  // Passe D : creux central (ligne sombre fine simulant la profondeur)
  ctx.globalAlpha = 0.45
  draw('#7C3410', 3)
  ctx.globalAlpha = 1

  // Passe E : reflet lumineux (haut du cadre)
  ctx.globalAlpha = 0.6
  draw('rgba(255,255,220,0.8)', 1.5)
  ctx.globalAlpha = 1

}

// ─────────────────────────────────────────────────────────────────────────────

export function GameBoard({ grid, obstacles, selected, matchedIds, onTap, onSwipe, cellSize }: Props) {
  const boardRef  = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragStart = useRef<{ x: number; y: number; row: number; col: number } | null>(null)

  const gap  = Math.max(3, Math.round(cellSize * 0.065))
  const step = cellSize + gap
  const W    = GRID_COLS * step - gap
  const H    = GRID_ROWS * step - gap

  const CW = W + CANVAS_PAD * 2
  const CH = H + CANVAS_PAD * 2

  // Re-dessin du cadre à chaque changement de taille
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width  = CW * dpr
    canvas.height = CH * dpr
    drawFrame(canvas, step, cellSize, gap)
  }, [CW, CH, step, cellSize, gap])

  // ── Listes plates pour AnimatePresence ─────────────────────────────────────
  const pieces: Array<{ piece: Piece; row: number; col: number }> = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!isValidCell(r, c)) continue
      const cell = grid[r][c]
      if (cell) pieces.push({ piece: cell as Piece, row: r, col: c })
    }
  }

  const obsList: Array<{ obs: import('@/lib/types').Obstacle; row: number; col: number }> = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!isValidCell(r, c)) continue
      const obs = obstacles[r]?.[c]
      if (obs) obsList.push({ obs, row: r, col: c })
    }
  }

  // ── Pointer events ─────────────────────────────────────────────────────────

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
    const dx = e.clientX - start.x, dy = e.clientY - start.y
    if (Math.hypot(dx, dy) < cellSize * 0.25) {
      onTap({ row: start.row, col: start.col }); return
    }
    let tr = start.row, tc = start.col
    if (Math.abs(dx) >= Math.abs(dy)) tc += dx > 0 ? 1 : -1
    else tr += dy > 0 ? 1 : -1
    if (isValidCell(tr, tc)) onSwipe({ row: start.row, col: start.col }, { row: tr, col: tc })
  }

  return (
    <div
      ref={boardRef}
      style={{
        position: 'relative',
        width: W, height: H,
        touchAction: 'none',
        cursor: 'pointer',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragStart.current = null }}
      role="grid"
      aria-label="plateau de jeu"
    >
      {/* ── Canvas : fond bois + cadre irrégulier (derrière tout) ── */}
      <canvas
        ref={canvasRef}
        style={{
          position:      'absolute',
          left:          -CANVAS_PAD,
          top:           -CANVAS_PAD,
          width:         CW,
          height:        CH,
          zIndex:        0,
          pointerEvents: 'none',
        }}
      />

      {/* ── Fonds de case (cellules valides uniquement) ── */}
      {Array.from({ length: GRID_ROWS }, (_, r) =>
        Array.from({ length: GRID_COLS }, (_, c) => {
          if (GRID_MASK[r][c] !== 1) return null
          const R = Math.round(cellSize * 0.22)
          return (
            <div
              key={`slot-${r}-${c}`}
              style={{
                position: 'absolute',
                left: c * step, top: r * step,
                width: cellSize, height: cellSize,
                borderRadius: R,
                background: 'linear-gradient(150deg, #DBEEFF 0%, #B8D8F8 60%, #9FC8EE 100%)',
                boxShadow: 'inset 0 2px 5px rgba(0,0,100,0.18)',
                zIndex: 1,
              }}
            />
          )
        })
      )}

      {/* ── Pièces ── */}
      <AnimatePresence>
        {pieces.map(({ piece, row, col }) => {
          const isSelected = selected?.row === row && selected?.col === col
          const isMatched  = matchedIds.has(piece.id)
          return (
            <motion.div
              key={piece.id}
              layout
              style={{
                position: 'absolute',
                left:     col * step,
                top:      row * step,
                width:    cellSize,
                height:   cellSize,
                zIndex:   isSelected ? 20 : isMatched ? 15 : 5,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isMatched ? 1.2 : isSelected ? 1.1 : 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
              transition={{
                layout:  { type: 'spring', stiffness: 400, damping: 30 },
                scale:   { type: 'spring', stiffness: 380, damping: 22 },
                opacity: { duration: 0.15 },
              }}
            >
              <PieceCell piece={piece} isSelected={isSelected} isMatched={isMatched} cellSize={cellSize} />
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* ── Obstacles ── */}
      <AnimatePresence>
        {obsList.map(({ obs, row, col }) => (
          <motion.div
            key={`obs-${row}-${col}`}
            style={{ position: 'absolute', left: col * step, top: row * step, width: cellSize, height: cellSize, zIndex: 25 }}
            initial={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.35 } }}
          >
            <ObstacleTile obstacle={obs} cellSize={cellSize} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
