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

export function HUD({ targets, movesLeft, score }: Props) {
  return (
    <div className="flex items-center justify-between w-full px-2 gap-2">
      {/* Cibles */}
      <div className="flex flex-col items-center gap-1.5 bg-amber-900/40 backdrop-blur rounded-2xl px-3 py-2 min-w-[90px]">
        <span className="text-amber-200 text-[10px] font-bold uppercase tracking-widest">Cible</span>
        <div className="flex flex-col gap-1">
          {targets.map(t => {
            const colors = PIECE_COLORS[t.type]
            const done = t.collected >= t.required
            const pct = Math.min(100, Math.round((t.collected / t.required) * 100))
            return (
              <div key={t.type} className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{ background: colors.bg, boxShadow: `0 3px 0 ${colors.shadow}` }}
                >
                  <PieceIcon type={t.type} size={22} />
                  {done && (
                    <motion.div
                      className="absolute inset-0 bg-green-500/80 flex items-center justify-center rounded-xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3 9 L7.5 13.5 L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-white text-xs font-bold leading-none">
                    {t.collected}/{t.required}
                  </div>
                  <div className="w-14 h-1.5 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: done ? '#22C55E' : colors.bg }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Personnage central */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{
            background: 'linear-gradient(145deg, #FDE68A, #B45309)',
            boxShadow: '0 4px 0 #78350F, 0 0 0 3px #FDE68A',
            border: '3px solid #92400E',
          }}
        >
          👑
        </div>
        <div className="text-amber-200 text-xs font-bold">
          {score.toLocaleString()}
        </div>
      </div>

      {/* Coups restants */}
      <div className="flex flex-col items-center gap-1 bg-amber-900/40 backdrop-blur rounded-2xl px-4 py-2 min-w-[70px]">
        <span className="text-amber-200 text-[10px] font-bold uppercase tracking-widest">Coups</span>
        <motion.span
          key={movesLeft}
          className="text-white font-black"
          style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontFamily: 'Righteous, sans-serif' }}
          initial={{ scale: 1.4, color: '#FBBF24' }}
          animate={{ scale: 1, color: movesLeft <= 5 ? '#EF4444' : '#FFFFFF' }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          {movesLeft}
        </motion.span>
      </div>
    </div>
  )
}
