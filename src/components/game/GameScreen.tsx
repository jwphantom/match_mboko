'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/hooks/useGame'
import { GameBoard } from './GameBoard'
import { HUD } from './HUD'
import { PowerUps } from './PowerUps'
import { GameOverlay } from './GameOverlay'
import { POWER_UPS, GRID_ROWS, GRID_COLS } from '@/lib/constants'
import { PowerUp, Position, PieceType } from '@/lib/types'

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

interface PUEffect { type: PowerUp['type']; pos: Position; id: number }

const PU_GLOW: Record<PowerUp['type'], string> = {
  hammer: '#F59E0B',
  arrow:  '#38BDF8',
  bomb:   '#EF4444',
  joker:  '#E879F9',
}

export function GameScreen() {
  const { state, selectCell, swapDirect, useHammer, useArrow, useBomb, useJoker, restart } = useGame()
  const cellSize = useCellSize()

  const [powerUps, setPowerUps] = useState<PowerUp[]>(POWER_UPS)
  const [activePU, setActivePU] = useState<PowerUp['type'] | null>(null)
  const [puEffect, setPuEffect] = useState<PUEffect | null>(null)
  const effectIdRef             = useRef(0)

  const consumePU = useCallback((type: PowerUp['type'], pos: Position) => {
    setActivePU(null)
    setPuEffect({ type, pos, id: ++effectIdRef.current })
    setPowerUps(prev => prev.map(pu =>
      pu.type === type ? { ...pu, count: Math.max(0, pu.count - 1) } : pu
    ))
  }, [])

  const handleTap = useCallback((pos: Position) => {
    if (activePU === 'hammer') { useHammer(pos); consumePU('hammer', pos); return }
    if (activePU === 'arrow')  { useArrow(pos);  consumePU('arrow',  pos); return }
    if (activePU === 'bomb')   { useBomb(pos);   consumePU('bomb',   pos); return }
    if (activePU === 'joker')  { useJoker(pos);  consumePU('joker',  pos); return }
    selectCell(pos)
  }, [activePU, selectCell, useHammer, useArrow, useBomb, useJoker, consumePU])

  const handleSwipe = useCallback((from: Position, to: Position) => {
    if (activePU) return
    swapDirect(from, to)
  }, [activePU, swapDirect])

  const handlePowerUp = useCallback((type: PowerUp['type']) => {
    setActivePU(prev => prev === type ? null : type)
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
            activePU={activePU}
            puEffect={puEffect}
            onEffectDone={() => setPuEffect(null)}
          />

          <GameOverlay phase={state.phase} score={state.score} onRestart={restart} />

          {/* Icône flottante quand un power-up est sélectionné */}
          <AnimatePresence>
            {activePU && (() => {
              const pu = powerUps.find(p => p.type === activePU)
              const glowColor = PU_GLOW[activePU]
              return (
                <motion.div
                  key={activePU}
                  initial={{ opacity: 0, scale: 0.4, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
                  exit={{ opacity: 0, scale: 0.3, y: -20 }}
                  transition={{
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.25, ease: 'backOut' },
                    y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.25 },
                  }}
                  style={{
                    position: 'absolute', top: -56, left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 36, lineHeight: 1,
                    filter: `drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 22px ${glowColor}88)`,
                    pointerEvents: 'none', zIndex: 40,
                    userSelect: 'none',
                  }}
                >
                  {pu?.icon ?? '✨'}
                </motion.div>
              )
            })()}
          </AnimatePresence>
        </div>
      </div>

      {/* Power-ups */}
      <div style={{ width: '100%', zIndex: 10, position: 'relative' }}>
        <PowerUps
          powerUps={powerUps}
          onUse={handlePowerUp}
          activePU={activePU}
          disabled={state.phase !== 'idle'}
        />
      </div>
    </div>
  )
}
