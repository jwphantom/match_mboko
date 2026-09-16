import { PieceType } from '@/lib/types'

interface Props {
  type: PieceType
  size?: number
}

export function PieceIcon({ type, size = 32 }: Props) {
  const s = size
  const half = s / 2
  const third = s / 3

  switch (type) {
    case 'crown':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-label="couronne">
          <path
            d="M4 22 L4 8 L10 16 L16 6 L22 16 L28 8 L28 22 Z"
            fill="#FDE68A"
            stroke="#B45309"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="4" y="22" width="24" height="4" rx="2" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="16" cy="8" r="2" fill="#EF4444" />
          <circle cx="4" cy="8" r="2" fill="#EF4444" />
          <circle cx="28" cy="8" r="2" fill="#EF4444" />
        </svg>
      )

    case 'shield':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-label="bouclier">
          <path
            d="M16 3 L28 8 L28 18 C28 24 22 29 16 31 C10 29 4 24 4 18 L4 8 Z"
            fill="#60A5FA"
            stroke="#1D4ED8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M16 8 L22 11 L22 18 C22 21 19 24 16 25 C13 24 10 21 10 18 L10 11 Z"
            fill="#BFDBFE"
            opacity="0.6"
          />
          <path d="M13 17 L15.5 19.5 L20 14" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )

    case 'leaf':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-label="feuille">
          <path
            d="M16 4 C16 4 6 10 6 18 C6 23 10 27 16 27 C22 27 26 23 26 18 C26 10 16 4 16 4Z"
            fill="#4ADE80"
            stroke="#15803D"
            strokeWidth="1.5"
          />
          <path d="M16 4 C16 4 16 14 16 27" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M11 14 C11 14 16 12 21 14" stroke="#15803D" strokeWidth="1" strokeLinecap="round" />
          <path d="M10 18 C10 18 16 16 22 18" stroke="#15803D" strokeWidth="1" strokeLinecap="round" />
        </svg>
      )

    case 'square':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-label="carré">
          <rect x="5" y="5" width="22" height="22" rx="5" fill="#F87171" stroke="#B91C1C" strokeWidth="1.5" />
          <rect x="9" y="9" width="8" height="8" rx="2" fill="#FECACA" opacity="0.7" />
          <rect x="15" y="15" width="8" height="8" rx="2" fill="#FCA5A5" opacity="0.5" />
        </svg>
      )

    case 'stripe':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-label="bande">
          <rect x="5" y="5" width="22" height="22" rx="6" fill="#C084FC" stroke="#7E22CE" strokeWidth="1.5" />
          <rect x="5" y="5" width="6" height="22" rx="3" fill="#F472B6" />
          <rect x="13" y="5" width="6" height="22" fill="#818CF8" />
          <rect x="21" y="5" width="6" height="22" rx="3" fill="#34D399" />
          <rect x="5" y="5" width="22" height="22" rx="6" stroke="#7E22CE" strokeWidth="1.5" fill="none" />
        </svg>
      )
  }
}
