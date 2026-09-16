'use client'

import { useEffect, useState, type ReactNode } from 'react'

const SPLASH = (
  <div
    style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #7C2D12 0%, #92400E 50%, #78350F 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 32,
    }}
  >
    👑
  </div>
)

// Empêche toute tentative de rendu serveur du sous-arbre → pas d'hydration error
export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return mounted ? <>{children}</> : SPLASH
}
