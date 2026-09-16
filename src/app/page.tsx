import { ClientOnly } from '@/components/ClientOnly'
import { GameScreen } from '@/components/game/GameScreen'

export default function Home() {
  return (
    <ClientOnly>
      <GameScreen />
    </ClientOnly>
  )
}
