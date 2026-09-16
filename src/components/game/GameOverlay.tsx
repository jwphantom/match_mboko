'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  phase: import('@/lib/types').GamePhase
  score: number
  onRestart: () => void
}

export function GameOverlay({ phase, score, onRestart }: Props) {
  const visible = phase === 'win' || phase === 'lose'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-5 px-8 py-8 rounded-3xl text-center"
            style={{
              background: phase === 'win'
                ? 'linear-gradient(145deg, #FDE68A, #B45309)'
                : 'linear-gradient(145deg, #6B7280, #1F2937)',
              boxShadow: '0 8px 0 rgba(0,0,0,0.4)',
            }}
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.1 }}
          >
            <div className="text-6xl">
              {phase === 'win' ? '🏆' : '💔'}
            </div>

            <div>
              <h2
                className="text-2xl font-black text-white"
                style={{ fontFamily: 'Righteous, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
              >
                {phase === 'win' ? 'Victoire !' : 'Perdu !'}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Score : <span className="font-bold text-white">{score.toLocaleString()}</span>
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={onRestart}
              className="px-8 py-3 rounded-2xl text-white font-black text-base cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{
                background: phase === 'win'
                  ? 'linear-gradient(145deg, #22C55E, #15803D)'
                  : 'linear-gradient(145deg, #FBBF24, #B45309)',
                boxShadow: phase === 'win'
                  ? '0 5px 0 #14532D'
                  : '0 5px 0 #78350F',
                fontFamily: 'Righteous, sans-serif',
              }}
            >
              Rejouer
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
