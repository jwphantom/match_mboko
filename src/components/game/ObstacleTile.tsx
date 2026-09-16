'use client'

import { Obstacle } from '@/lib/types'

interface Props {
  obstacle: Obstacle
  cellSize: number
}

export function ObstacleTile({ obstacle, cellSize }: Props) {
  const R = Math.round(cellSize * 0.22)
  const pct = obstacle.hp / obstacle.maxHp

  if (obstacle.kind === 'grass') {
    return (
      <div
        style={{
          width: '100%', height: '100%',
          borderRadius: R,
          background: 'linear-gradient(160deg, #4ADE80, #16A34A)',
          border: '2.5px solid #15803D',
          boxShadow: '0 3px 0 #14532D, inset 0 1px 0 rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <GrassSVG size={Math.round(cellSize * 0.75)} />
        {/* Barre de vie si hp > 1 */}
        {obstacle.maxHp > 1 && (
          <div style={{
            position: 'absolute', bottom: 3, left: 4, right: 4,
            height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.3)',
          }}>
            <div style={{
              height: '100%', borderRadius: 2, background: '#FBBF24',
              width: `${pct * 100}%`, transition: 'width 0.3s',
            }} />
          </div>
        )}
      </div>
    )
  }

  // Box / caisse en bois
  return (
    <div
      style={{
        width: '100%', height: '100%',
        borderRadius: R,
        background: 'linear-gradient(145deg, #D97706, #92400E)',
        border: '2.5px solid #78350F',
        boxShadow: '0 3px 0 #451A03, inset 0 1px 0 rgba(255,255,255,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <BoxSVG size={Math.round(cellSize * 0.55)} />
      {/* Barre de vie */}
      <div style={{
        position: 'absolute', bottom: 3, left: 4, right: 4,
        height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.35)',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: obstacle.hp === obstacle.maxHp ? '#FBBF24' : '#EF4444',
          width: `${pct * 100}%`, transition: 'width 0.3s',
        }} />
      </div>
    </div>
  )
}

function GrassSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="herbe">
      {/* Sol */}
      <ellipse cx="16" cy="26" rx="12" ry="4" fill="#15803D" opacity="0.5" />
      {/* Brins d'herbe */}
      <path d="M16 24 Q14 16 10 10" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 24 Q16 14 16 8"  stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 24 Q18 16 22 10" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M16 24 Q12 18 8 14"  stroke="#BBFFD0" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 24 Q20 18 24 14" stroke="#BBFFD0" strokeWidth="2" strokeLinecap="round"/>
      {/* Fleurs blanches */}
      <circle cx="10" cy="10" r="2.5" fill="white" />
      <circle cx="16" cy="8"  r="2.5" fill="white" />
      <circle cx="22" cy="10" r="2.5" fill="white" />
      <circle cx="10" cy="10" r="1" fill="#FBBF24" />
      <circle cx="16" cy="8"  r="1" fill="#FBBF24" />
      <circle cx="22" cy="10" r="1" fill="#FBBF24" />
    </svg>
  )
}

function BoxSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="caisse">
      <rect x="4" y="8" width="24" height="20" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1.5"/>
      <rect x="4" y="8" width="24" height="7"  rx="2" fill="#D97706" stroke="#78350F" strokeWidth="1.5"/>
      {/* Cerclages */}
      <line x1="16" y1="8" x2="16" y2="28" stroke="#78350F" strokeWidth="1.5"/>
      <line x1="4"  y1="16" x2="28" y2="16" stroke="#78350F" strokeWidth="1.5"/>
      {/* Clous */}
      <circle cx="9"  cy="12" r="1.5" fill="#FDE68A"/>
      <circle cx="23" cy="12" r="1.5" fill="#FDE68A"/>
      <circle cx="9"  cy="22" r="1.5" fill="#FDE68A"/>
      <circle cx="23" cy="22" r="1.5" fill="#FDE68A"/>
      {/* Étiquette TNT */}
      <rect x="11" y="18" width="10" height="6" rx="1" fill="#EF4444"/>
      <text x="16" y="23.5" textAnchor="middle" fontSize="5" fontWeight="bold" fill="white" fontFamily="sans-serif">TNT</text>
    </svg>
  )
}
