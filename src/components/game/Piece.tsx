'use client'

import { Piece as PieceType } from '@/lib/types'
import { PIECE_COLORS } from '@/lib/constants'
import { PieceIcon } from './PieceIcon'

interface Props {
  piece: PieceType
  isSelected: boolean
  isMatched: boolean
  cellSize: number
}

// Composant purement visuel — le motion.div parent (GameBoard) gère
// le déplacement, l'entrée et la sortie.
export function PieceCell({ piece, isSelected, isMatched, cellSize }: Props) {
  const colors = PIECE_COLORS[piece.type]
  const iconSize = Math.round(cellSize * 0.54)
  const radius = Math.round(cellSize * 0.25)

  let shadow: string
  if (isMatched) {
    shadow = `0 0 0 2.5px #fff, 0 0 18px 6px ${colors.bg}, 0 3px 0 ${colors.shadow}`
  } else if (isSelected) {
    shadow = `0 0 0 3px #fff, 0 0 0 5px ${colors.bg}, 0 5px 0 ${colors.shadow}`
  } else {
    shadow = `0 4px 0 ${colors.shadow}, inset 0 1px 0 ${colors.border}`
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius,
        background: `linear-gradient(145deg, ${colors.border}, ${colors.bg})`,
        border: `2px solid ${isMatched ? 'rgba(255,255,255,0.9)' : colors.shadow}`,
        boxShadow: shadow,
        pointerEvents: 'none',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
    >
      {/* Reflet claymorphism */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 8,
          right: 8,
          height: 5,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.65)',
          opacity: isMatched ? 0.3 : 0.55,
        }}
      />

      <PieceIcon type={piece.type} size={iconSize} />

      {/* Éclat de match */}
      {isMatched && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            background: `radial-gradient(circle, ${colors.border}cc 0%, transparent 70%)`,
            animation: 'pulse-match 0.4s ease-out forwards',
          }}
        />
      )}
    </div>
  )
}
