import { LanguageToggle } from '../shared/ui/LanguageToggle'
import { MuteToggle } from '../shared/ui/MuteToggle'
import { PageTransition } from '../shared/ui/PageTransition'
import { SpaceTraffic } from '../shared/ui/SpaceTraffic'

export function GuestLayout() {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      <SpaceTraffic />
      <div className="flex justify-end items-center gap-2 p-4">
        <MuteToggle />
        <LanguageToggle />
      </div>
      <div className="flex-1 flex flex-col">
        <PageTransition />
      </div>
    </div>
  )
}
