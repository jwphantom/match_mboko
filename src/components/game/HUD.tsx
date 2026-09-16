'use client'

import { motion } from 'framer-motion'
import { Target } from '@/lib/types'
import { PIECE_COLORS } from '@/lib/constants'
import { PieceIcon } from './PieceIcon'

interface Props {
  targets: Target[]
  movesLeft: number
  score: number
}

const OBSTACLE_COLORS: Record<string, { bg: string; border: string }> = {
  grass: { bg: '#22C55E', border: '#15803D' },
  box:   { bg: '#D97706', border: '#78350F' },
}

function TargetIcon({ type, size = 28 }: { type: string; size?: number }) {
  const isObstacle = type === 'grass' || type === 'box'
  if (!isObstacle) {
    const pieceType = type as import('@/lib/types').PieceType
    const colors = PIECE_COLORS[pieceType]
    if (!colors) return null
    return (
      <div
        style={{
          width: size, height: size,
          borderRadius: 8,
          background: colors.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${colors.shadow}`,
          boxShadow: `0 2px 0 ${colors.shadow}`,
          flexShrink: 0,
        }}
      >
        <PieceIcon type={pieceType} size={Math.round(size * 0.7)} />
      </div>
    )
  }

  const c = OBSTACLE_COLORS[type]
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: 8,
        background: c.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid ${c.border}`,
        boxShadow: `0 2px 0 ${c.border}`,
        flexShrink: 0,
        fontSize: Math.round(size * 0.55),
      }}
    >
      {type === 'grass' ? '🌿' : '📦'}
    </div>
  )
}

export function HUD({ targets, movesLeft, score }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      width: '100%',
    }}>

      {/* ── Cibles ── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, #1E3A8A, #1E40AF)',
        border: '2.5px solid #FBBF24',
        borderRadius: 14,
        padding: '6px 10px',
        boxShadow: '0 4px 0 #1E3A8A, inset 0 1px 0 rgba(255,255,255,0.1)',
      }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: '#FDE68A', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          Cible
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {targets.map(t => {
            const done = t.collected >= t.required
            const pct  = Math.min(100, (t.collected / t.required) * 100)
            return (
              <div key={t.type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <TargetIcon type={t.type} size={28} />
                  {done && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute', inset: 0, borderRadius: 8,
                        background: 'rgba(34,197,94,0.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7 L5.5 10.5 L12 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                    {t.collected}/{t.required}
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.35)', marginTop: 3 }}>
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4 }}
                      style={{
                        height: '100%', borderRadius: 2,
                        background: done ? '#22C55E' : '#FBBF24',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Portrait roi ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <div style={{
          width: 58, height: 58,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #FDE68A, #B45309)',
          border: '3px solid #FBBF24',
          boxShadow: '0 4px 0 #78350F, 0 0 0 2px #B45309',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30,
          overflow: 'hidden',
        }}>
          👑
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#FDE68A',
          background: 'rgba(0,0,0,0.35)',
          padding: '1px 6px', borderRadius: 6,
        }}>
          {score.toLocaleString()}
        </div>
      </div>

      {/* ── Coups restants ── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, #1E3A8A, #1E40AF)',
        border: '2.5px solid #FBBF24',
        borderRadius: 14,
        padding: '6px 10px',
        textAlign: 'center',
        boxShadow: '0 4px 0 #1E3A8A, inset 0 1px 0 rgba(255,255,255,0.1)',
      }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: '#FDE68A', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
          Coups
        </div>
        <motion.div
          key={movesLeft}
          initial={{ scale: 1.5, color: '#FBBF24' }}
          animate={{ scale: 1, color: movesLeft <= 5 ? '#EF4444' : '#FFFFFF' }}
          transition={{ type: 'spring', stiffness: 500 }}
          style={{
            fontSize: 'clamp(26px, 7vw, 36px)',
            fontFamily: 'Righteous, sans-serif',
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {movesLeft}
        </motion.div>
      </div>
    </div>
  )
}
