'use client'

import { motion } from 'framer-motion'
import { PowerUp } from '@/lib/types'

interface Props {
  powerUps: PowerUp[]
  onUse: (type: PowerUp['type']) => void
  disabled?: boolean
  onSettings?: () => void
}

const BTN_COLORS: Record<string, { from: string; to: string; shadow: string }> = {
  hammer: { from: '#4CAF50', to: '#2E7D32', shadow: '#1B5E20' },
  arrow:  { from: '#4CAF50', to: '#2E7D32', shadow: '#1B5E20' },
  bomb:   { from: '#4CAF50', to: '#2E7D32', shadow: '#1B5E20' },
  joker:  { from: '#4CAF50', to: '#2E7D32', shadow: '#1B5E20' },
}

export function PowerUps({ powerUps, onUse, disabled, onSettings }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      {powerUps.map(pu => {
        const c = BTN_COLORS[pu.type]
        const off = disabled || pu.count === 0

        return (
          <motion.button
            key={pu.type}
            whileTap={off ? {} : { scale: 0.88 }}
            whileHover={off ? {} : { scale: 1.07, y: -2 }}
            onClick={() => !off && onUse(pu.type)}
            disabled={off}
            aria-label={`${pu.type} (${pu.count})`}
            style={{
              position: 'relative',
              width: 54, height: 54,
              borderRadius: '50%',
              background: `radial-gradient(circle at 38% 32%, ${c.from}, ${c.to})`,
              boxShadow: off
                ? `0 3px 0 ${c.shadow}`
                : `0 5px 0 ${c.shadow}, inset 0 1px 0 rgba(255,255,255,0.28)`,
              border: '2px solid rgba(255,255,255,0.18)',
              cursor: off ? 'not-allowed' : 'pointer',
              opacity: off ? 0.55 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}
          >
            {/* Reflet */}
            <div style={{
              position: 'absolute', top: 6, left: 10, right: 10, height: 6,
              borderRadius: 999, background: 'rgba(255,255,255,0.4)',
            }} />
            <span role="img" aria-hidden style={{ userSelect: 'none' }}>{pu.icon}</span>
            {/* Badge compteur */}
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              minWidth: 18, height: 18, borderRadius: 999,
              background: '#1E1B4B',
              border: '1.5px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: 'white',
              padding: '0 3px',
            }}>
              {pu.count}
            </div>
          </motion.button>
        )
      })}

      {/* Bouton settings */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.07, y: -2 }}
        onClick={onSettings}
        aria-label="Paramètres"
        style={{
          width: 54, height: 54,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, #3B82F6, #1D4ED8)',
          boxShadow: '0 5px 0 #1E3A8A, inset 0 1px 0 rgba(255,255,255,0.25)',
          border: '2px solid rgba(255,255,255,0.18)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', top: 6, left: 10, right: 10, height: 6,
          borderRadius: 999, background: 'rgba(255,255,255,0.35)',
        }} />
        ⚙️
      </motion.button>
    </div>
  )
}
