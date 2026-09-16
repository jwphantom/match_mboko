'use client'

import { motion } from 'framer-motion'
import { PowerUp } from '@/lib/types'

interface Props {
  powerUps: PowerUp[]
  onUse: (type: PowerUp['type']) => void
  disabled?: boolean
}

const COLORS: Record<PowerUp['type'], { bg: string; shadow: string }> = {
  hammer: { bg: '#B45309', shadow: '#78350F' },
  arrow:  { bg: '#16A34A', shadow: '#14532D' },
  bomb:   { bg: '#DC2626', shadow: '#7F1D1D' },
  joker:  { bg: '#7C3AED', shadow: '#4C1D95' },
}

export function PowerUps({ powerUps, onUse, disabled }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 px-2">
      {powerUps.map(pu => {
        const c = COLORS[pu.type]
        const unavailable = disabled || pu.count === 0

        return (
          <motion.button
            key={pu.type}
            whileTap={unavailable ? {} : { scale: 0.88 }}
            whileHover={unavailable ? {} : { scale: 1.08 }}
            onClick={() => !unavailable && onUse(pu.type)}
            disabled={unavailable}
            aria-label={`Power-up ${pu.type} (${pu.count} restants)`}
            className="relative flex flex-col items-center gap-1 focus:outline-none disabled:opacity-50"
          >
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: `radial-gradient(circle at 40% 35%, ${c.bg}ee, ${c.shadow})`,
                boxShadow: `0 5px 0 ${c.shadow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                border: `2.5px solid rgba(255,255,255,0.2)`,
              }}
            >
              {/* Reflet */}
              <div
                className="absolute top-2 left-3 right-3 h-1.5 rounded-full opacity-40"
                style={{ background: 'rgba(255,255,255,0.9)' }}
              />
              <span role="img" aria-hidden>{pu.icon}</span>
            </div>

            {/* Badge compteur */}
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: '#1E1B4B', border: '1.5px solid #fff' }}
            >
              {pu.count}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
