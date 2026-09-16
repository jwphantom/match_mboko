'use client'

import { useEffect, useState, useCallback } from 'react'
import { useGame } from '@/hooks/useGame'
import { GameBoard } from './GameBoard'
import { HUD } from './HUD'
import { PowerUps } from './PowerUps'
import { GameOverlay } from './GameOverlay'
import { POWER_UPS, GRID_ROWS, GRID_COLS } from '@/lib/constants'
import { PowerUp, Position } from '@/lib/types'

// ─── Taille de cellule adaptative ─────────────────────────────────────────────
// Tient compte de TOUS les paddings pour ne jamais coller les bords :
//   • screen padding : 2 × 16 px  = 32 px
//   • board card p-2 : 2 × 8 px   = 16 px
//   • marge de sécurité           = 8 px
//   → soustrait = 56 px horizontal total
//
// Pour la hauteur :
//   • HUD ~90 px  • PowerUps ~80 px  • marges ~70 px
//   → soustrait = 240 px vertical

const SCREEN_H_PAD = 56   // px horizontal total à retrancher
const SCREEN_V_PAD = 240  // px vertical total à retrancher
const GAP_RATIO    = 0.07 // gap = cellSize × GAP_RATIO

function boardFactor(count: number) {
  // Largeur totale = count × cell + (count-1) × gap = cell × (count + (count-1) × GAP_RATIO)
  return count + (count - 1) * GAP_RATIO
}

function useCellSize(): number {
  const [size, setSize] = useState(40)

  useEffect(() => {
    function compute() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const horizAvail = vw - SCREEN_H_PAD
      const vertAvail  = vh - SCREEN_V_PAD
      const byCol = Math.floor(horizAvail / boardFactor(GRID_COLS))
      const byRow = Math.floor(vertAvail  / boardFactor(GRID_ROWS))
      setSize(Math.max(32, Math.min(54, byCol, byRow)))
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  return size
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export function GameScreen() {
  const { state, selectCell, swapDirect, useHammer, restart } = useGame()
  const cellSize = useCellSize()

  const [powerUps, setPowerUps] = useState<PowerUp[]>(POWER_UPS)
  const [activeHammer, setActiveHammer] = useState(false)

  const isIdle = state.phase === 'idle'

  const handleTap = useCallback((pos: Position) => {
    if (activeHammer) {
      useHammer(pos)
      setActiveHammer(false)
      setPowerUps(prev =>
        prev.map(pu => pu.type === 'hammer' ? { ...pu, count: Math.max(0, pu.count - 1) } : pu)
      )
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
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(160deg, #7C2D12 0%, #92400E 50%, #78350F 100%)',
        padding: `max(env(safe-area-inset-top), 12px) 16px max(env(safe-area-inset-bottom), 12px) 16px`,
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blobs décoratifs */}
      <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 240, height: 240, borderRadius: '50%', background: '#FBBF24', opacity: 0.18, filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: '#EC4899', opacity: 0.13, filter: 'blur(50px)' }} />
      </div>

      {/* HUD */}
      <div style={{ width: '100%', zIndex: 10 }}>
        <HUD targets={state.targets} movesLeft={state.movesLeft} score={state.score} />
      </div>

      {/* Plateau de jeu */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', zIndex: 10 }}>
        <div style={{ position: 'relative' }}>
          {/* Cadre décoratif autour du plateau */}
          <div
            style={{
              borderRadius: 24,
              padding: 8,
              background: 'rgba(0,0,0,0.28)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
              outline: activeHammer ? '3px solid #FBBF24' : 'none',
              outlineOffset: 2,
            }}
          >
            <GameBoard
              grid={state.grid}
              selected={state.selected}
              matchedIds={state.matchedIds}
              onTap={handleTap}
              onSwipe={handleSwipe}
              cellSize={cellSize}
            />
          </div>

          <GameOverlay phase={state.phase} score={state.score} onRestart={restart} />

          {activeHammer && (
            <div
              style={{
                position: 'absolute',
                top: -36,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.7)',
                color: '#FDE68A',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999,
                whiteSpace: 'nowrap',
                zIndex: 20,
              }}
            >
              Touche une pièce à détruire
            </div>
          )}
        </div>
      </div>

      {/* Power-ups */}
      <div style={{ width: '100%', zIndex: 10 }}>
        <PowerUps powerUps={powerUps} onUse={handlePowerUp} disabled={!isIdle} />
      </div>
    </div>
  )
}
