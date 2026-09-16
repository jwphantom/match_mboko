'use client'

import { Piece as PieceType, PieceType as PT } from '@/lib/types'
import { PieceIcon } from './PieceIcon'

interface Props {
  piece: PieceType
  isSelected: boolean
  isMatched: boolean
  cellSize: number
}

const TILE: Record<PT, {
  top: string; mid: string; bot: string; glow: string; border: string
}> = {
  crown:  { top: '#FFF8D6', mid: '#FBBF24', bot: '#B45309', glow: '#FDE68A', border: '#D97706' },
  shield: { top: '#DBEAFE', mid: '#3B82F6', bot: '#1E3A8A', glow: '#93C5FD', border: '#1D4ED8' },
  leaf:   { top: '#D1FAE5', mid: '#34D399', bot: '#065F46', glow: '#6EE7B7', border: '#059669' },
  square: { top: '#FEE2E2', mid: '#F87171', bot: '#991B1B', glow: '#FCA5A5', border: '#DC2626' },
  stripe: { top: '#F3E8FF', mid: '#C084FC', bot: '#581C87', glow: '#E879F9', border: '#9333EA' },
}

export function PieceCell({ piece, isSelected, isMatched, cellSize }: Props) {
  const t      = TILE[piece.type]
  const radius = Math.round(cellSize * 0.26)
  const icon   = Math.round(cellSize * 0.60)
  const depth  = Math.max(3, Math.round(cellSize * 0.09))

  let boxShadow: string
  if (isMatched) {
    boxShadow = `0 0 0 2.5px #fff, 0 0 22px 8px ${t.glow}bb, 0 ${depth}px 0 ${t.bot}`
  } else if (isSelected) {
    boxShadow = `0 0 0 3px #fff, 0 0 0 5.5px ${t.mid}99, 0 ${depth}px 0 ${t.bot}`
  } else {
    boxShadow = `0 ${depth}px 0 ${t.bot}, inset 0 -2px 0 rgba(0,0,0,0.18)`
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: radius,
      background: `linear-gradient(155deg, ${t.top} 0%, ${t.mid} 48%, ${t.bot}cc 100%)`,
      border: `2px solid ${isSelected || isMatched ? '#fff' : t.border}`,
      boxShadow,
      overflow: 'hidden',
      pointerEvents: 'none',
      transition: 'box-shadow 0.12s, border-color 0.12s',
    }}>
      {/* Reflet spéculaire */}
      <div style={{
        position: 'absolute',
        top: Math.round(cellSize * 0.10), left: '18%', right: '18%',
        height: Math.max(3, Math.round(cellSize * 0.10)),
        borderRadius: 999,
        background: 'rgba(255,255,255,0.72)',
        filter: 'blur(0.8px)',
        opacity: isMatched ? 0.25 : 0.8,
      }} />
      <div style={{
        position: 'absolute',
        top: Math.round(cellSize * 0.06), left: '30%', right: '42%',
        height: Math.max(2, Math.round(cellSize * 0.06)),
        borderRadius: 999,
        background: 'rgba(255,255,255,0.55)',
        opacity: isMatched ? 0.1 : 0.65,
      }} />
      {/* Vignette bas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '40%', borderRadius: `0 0 ${radius}px ${radius}px`,
        background: 'linear-gradient(to top, rgba(0,0,0,0.28), transparent)',
      }} />
      {/* Icône */}
      <div style={{ position: 'relative', zIndex: 1, lineHeight: 0 }}>
        <PieceIcon type={piece.type} size={icon} />
      </div>
      {/* Flash match */}
      {isMatched && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: radius,
          background: `radial-gradient(circle at 40% 30%, rgba(255,255,255,0.85) 0%, ${t.glow}44 45%, transparent 70%)`,
        }} />
      )}
    </div>
  )
}
