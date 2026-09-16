'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PowerUp, Position } from '@/lib/types'

interface Props {
  type: PowerUp['type']
  pos: Position
  step: number
  cellSize: number
  boardW: number
  boardH: number
  onDone: () => void
}

const PU_COLOR: Record<PowerUp['type'], string> = {
  hammer: '#F59E0B',
  arrow:  '#38BDF8',
  bomb:   '#EF4444',
  joker:  '#E879F9',
}

export function PowerUpEffect({ type, pos, step, cellSize, boardW, onDone }: Props) {
  const cx  = pos.col * step + cellSize / 2
  const cy  = pos.row * step + cellSize / 2
  const col = PU_COLOR[type]

  useEffect(() => {
    const t = setTimeout(onDone, 750)
    return () => clearTimeout(t)
  }, [onDone])

  // ── Flèche : balayage de ligne ──────────────────────────────────────────────
  if (type === 'arrow') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }}>
        {/* Flash de ligne */}
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: [1, 1, 0] }}
          transition={{ duration: 0.45, ease: 'easeOut', opacity: { times: [0, 0.6, 1] } }}
          style={{
            position: 'absolute',
            left: 0, top: pos.row * step,
            width: boardW, height: cellSize,
            background: `linear-gradient(90deg, transparent 0%, ${col}99 20%, white 50%, ${col}99 80%, transparent 100%)`,
            transformOrigin: 'left center',
            borderRadius: 6,
          }}
        />
        {/* Traînée de particules */}
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ x: (boardW / 10) * i, y: cy, opacity: 1, scale: 1 }}
            animate={{ y: cy + (i % 2 === 0 ? -28 : 28), opacity: 0, scale: 0 }}
            transition={{ duration: 0.38, delay: i * 0.025, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 7, height: 7, borderRadius: '50%',
              background: col, marginLeft: -3.5, marginTop: -3.5,
            }}
          />
        ))}
      </div>
    )
  }

  // ── Bombe : explosion radiale ───────────────────────────────────────────────
  if (type === 'bomb') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }}>
        {/* Flash central */}
        <motion.div
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: cx - cellSize / 2, top: cy - cellSize / 2,
            width: cellSize, height: cellSize,
            borderRadius: '50%',
            background: `radial-gradient(circle, #fff 0%, ${col} 40%, transparent 70%)`,
          }}
        />
        {/* Ondes de choc */}
        {[0.8, 1.6, 2.6].map((maxS, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: maxS, opacity: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: cx - cellSize * 1.5, top: cy - cellSize * 1.5,
              width: cellSize * 3, height: cellSize * 3,
              borderRadius: '50%',
              border: `3px solid ${col}`,
            }}
          />
        ))}
        {/* Débris */}
        {Array.from({ length: 9 }, (_, i) => {
          const angle = (i / 9) * Math.PI * 2
          const dist  = cellSize * 2.2
          return (
            <motion.div key={i}
              initial={{ x: cx, y: cy, opacity: 1, scale: 1 }}
              animate={{ x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, opacity: 0, scale: 0 }}
              transition={{ duration: 0.48, delay: 0.05, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: 10, height: 10, borderRadius: 3,
                background: col, marginLeft: -5, marginTop: -5,
              }}
            />
          )
        })}
      </div>
    )
  }

  // ── Joker : étoiles qui rayonnent ───────────────────────────────────────────
  if (type === 'joker') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }}>
        {/* Flash central */}
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: cx - cellSize / 2, top: cy - cellSize / 2,
            width: cellSize, height: cellSize, borderRadius: '50%',
            background: `radial-gradient(circle, #fff, ${col}88, transparent)`,
          }}
        />
        {/* Étoiles */}
        {Array.from({ length: 14 }, (_, i) => {
          const angle = (i / 14) * Math.PI * 2
          const dist  = cellSize * (2.5 + (i % 3) * 0.8)
          const size  = 10 + (i % 3) * 4
          return (
            <motion.div key={i}
              initial={{ x: cx, y: cy, opacity: 1, scale: 1, rotate: 0 }}
              animate={{ x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, opacity: 0, scale: 0, rotate: 180 }}
              transition={{ duration: 0.55, delay: i * 0.02, ease: 'easeOut' }}
              style={{
                position: 'absolute', fontSize: size,
                marginLeft: -size / 2, marginTop: -size / 2,
                lineHeight: 1,
              }}
            >
              ✦
            </motion.div>
          )
        })}
      </div>
    )
  }

  // ── Marteau : impact + éclats ───────────────────────────────────────────────
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }}>
      <motion.div
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 2.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: cx - cellSize / 2, top: cy - cellSize / 2,
          width: cellSize, height: cellSize, borderRadius: '50%',
          background: `radial-gradient(circle, #fff, ${col}aa, transparent)`,
        }}
      />
      {Array.from({ length: 7 }, (_, i) => {
        const angle = (i / 7) * Math.PI * 2
        return (
          <motion.div key={i}
            initial={{ x: cx, y: cy, opacity: 1 }}
            animate={{ x: cx + Math.cos(angle) * cellSize * 1.6, y: cy + Math.sin(angle) * cellSize * 1.6, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 6, height: 6, borderRadius: '50%',
              background: col, marginLeft: -3, marginTop: -3,
            }}
          />
        )
      })}
    </div>
  )
}
