'use client'

import { useEffect, useState, useCallback } from 'react'
import { useGame } from '@/hooks/useGame'
import { GameBoard } from './GameBoard'
import { HUD } from './HUD'
import { PowerUps } from './PowerUps'
import { GameOverlay } from './GameOverlay'
import { POWER_UPS, GRID_ROWS, GRID_COLS } from '@/lib/constants'
import { PowerUp, Position } from '@/lib/types'

// ─── Taille de cellule ────────────────────────────────────────────────────────
// Le cadre irrégulier est dessiné sur canvas, qui déborde de ~15px de chaque côté.
//   horizontal : 16×2 (screen) + 15×2 (canvas overhang) = 62 px
//   vertical   : HUD ~95px + PowerUps ~80px + marges ~80px = 255 px

const H_PAD = 62
const V_PAD = 255
const GAP_R = 0.065

function boardFactor(n: number) { return n + (n - 1) * GAP_R }

function useCellSize(): number {
  const [size, setSize] = useState(40)
  useEffect(() => {
    function compute() {
      const vw = window.innerWidth, vh = window.innerHeight
      const byCol = Math.floor((vw - H_PAD) / boardFactor(GRID_COLS))
      const byRow = Math.floor((vh - V_PAD) / boardFactor(GRID_ROWS))
      setSize(Math.max(30, Math.min(52, byCol, byRow)))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])
  return size
}

// ─── Fond de salle ────────────────────────────────────────────────────────────

const ROOM_BG = `
  linear-gradient(
    to bottom,
    #F5EAD4 0%,
    #EDD9B4 28%,
    #E0C99A 38%,
    #C8956C 42%,
    #C8956C 100%
  )
`

// ─── Écran principal ──────────────────────────────────────────────────────────

export function GameScreen() {
  const { state, selectCell, swapDirect, useHammer, restart } = useGame()
  const cellSize = useCellSize()

  const [powerUps, setPowerUps] = useState<PowerUp[]>(POWER_UPS)
  const [activeHammer, setActiveHammer] = useState(false)

  const handleTap = useCallback((pos: Position) => {
    if (activeHammer) {
      useHammer(pos)
      setActiveHammer(false)
      setPowerUps(prev => prev.map(pu =>
        pu.type === 'hammer' ? { ...pu, count: Math.max(0, pu.count - 1) } : pu
      ))
      return
    }
    selectCell(pos)
  }, [activeHammer, selectCell, useHammer])

  const handleSwipe = useCallback((from: Position, to: Position) => {
    if (activeHammer) return
    swapDirect(from, to)
  }, [activeHammer, swapDirect])

  const handlePowerUp = useCallback((type: PowerUp['type']) => {
    if (type === 'hammer') setActiveHammer(prev => !prev)
  }, [])

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: ROOM_BG,
      paddingTop: 'max(env(safe-area-inset-top), 10px)',
      paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
      paddingLeft: 16, paddingRight: 16,
      gap: 10,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Motif carrelage au sol (partie basse) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '45%',
        backgroundImage: `
          repeating-conic-gradient(
            #B8855A 0deg 90deg,
            #D4A578 90deg 180deg,
            #B8855A 180deg 270deg,
            #D4A578 270deg 360deg
          )
        `,
        backgroundSize: '48px 48px',
        opacity: 0.45,
        pointerEvents: 'none',
      }} />

      {/* Plinthe (séparation mur/sol) */}
      <div style={{
        position: 'absolute', top: '55%', left: 0, right: 0,
        height: 6,
        background: 'linear-gradient(to bottom, #C4A882, #A08060)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        pointerEvents: 'none',
      }} />

      {/* Motif décoratif du mur (coins) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '55%',
        backgroundImage: `
          radial-gradient(ellipse at 0% 0%, rgba(212,167,90,0.25) 0%, transparent 50%),
          radial-gradient(ellipse at 100% 0%, rgba(212,167,90,0.25) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      {/* HUD */}
      <div style={{ width: '100%', zIndex: 10, position: 'relative' }}>
        <HUD targets={state.targets} movesLeft={state.movesLeft} score={state.score} />
      </div>

      {/* Plateau — le cadre irrégulier est dessiné dans GameBoard via canvas */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', zIndex: 10, position: 'relative' }}>
        <div style={{ position: 'relative', overflow: 'visible' }}>
          <GameBoard
            grid={state.grid}
            obstacles={state.obstacles}
            selected={state.selected}
            matchedIds={state.matchedIds}
            onTap={handleTap}
            onSwipe={handleSwipe}
            cellSize={cellSize}
          />

          <GameOverlay phase={state.phase} score={state.score} onRestart={restart} />

          {activeHammer && (
            <div style={{
              position: 'absolute', top: -38, left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.72)',
              color: '#FDE68A', fontSize: 11, fontWeight: 700,
              padding: '4px 14px', borderRadius: 999,
              whiteSpace: 'nowrap', zIndex: 30,
            }}>
              Touche une pièce à détruire
            </div>
          )}
        </div>
      </div>

      {/* Power-ups */}
      <div style={{ width: '100%', zIndex: 10, position: 'relative' }}>
        <PowerUps
          powerUps={powerUps}
          onUse={handlePowerUp}
          disabled={state.phase !== 'idle'}
        />
      </div>
    </div>
  )
}
