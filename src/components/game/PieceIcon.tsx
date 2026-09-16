import { PieceType } from '@/lib/types'

interface Props {
  type: PieceType
  size?: number
}

export function PieceIcon({ type, size = 32 }: Props) {
  const s = size

  switch (type) {

    case 'crown':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-label="couronne">
          <path d="M4 22 L4 8 L10 16 L16 6 L22 16 L28 8 L28 22 Z"
            fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="4" y="22" width="24" height="4" rx="2" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="16" cy="6"  r="2" fill="#EF4444" />
          <circle cx="4"  cy="8"  r="2" fill="#EF4444" />
          <circle cx="28" cy="8"  r="2" fill="#EF4444" />
        </svg>
      )

    case 'shield':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-label="bouclier">
          <path d="M16 3 L28 8 L28 18 C28 24 22 29 16 31 C10 29 4 24 4 18 L4 8 Z"
            fill="#60A5FA" stroke="#1D4ED8" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16 8 L22 11 L22 18 C22 21 19 24 16 25 C13 24 10 21 10 18 L10 11 Z"
            fill="#BFDBFE" opacity="0.6" />
          <path d="M13 17 L15.5 19.5 L20 14"
            stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )

    case 'leaf':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-label="feuille">
          <path d="M16 4 C16 4 6 10 6 18 C6 23 10 27 16 27 C22 27 26 23 26 18 C26 10 16 4 16 4Z"
            fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
          <path d="M16 4 L16 27" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M11 14 C11 14 16 12 21 14" stroke="#15803D" strokeWidth="1" strokeLinecap="round" />
          <path d="M10 18 C10 18 16 16 22 18" stroke="#15803D" strokeWidth="1" strokeLinecap="round" />
        </svg>
      )

    case 'square':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-label="diamant">
          <polygon points="16,3 29,14 16,29 3,14"
            fill="#F87171" stroke="#B91C1C" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="16,3 22,14 16,20 10,14"
            fill="#FECACA" opacity="0.6" />
          <polygon points="16,3 29,14 22,14"
            fill="#FFF" opacity="0.25" />
        </svg>
      )

    case 'stripe':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-label="étoile">
          <path d="M16 3 L18.9 11.6 L28 11.6 L20.6 17 L23.4 25.6 L16 20.2 L8.6 25.6 L11.4 17 L4 11.6 L13.1 11.6 Z"
            fill="#C084FC" stroke="#7E22CE" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M16 5 L18.2 11.6 L24.5 11.6 L19.5 15.2 L21.5 21.8 L16 18.2 Z"
            fill="#F3E8FF" opacity="0.4" />
        </svg>
      )
  }
}
