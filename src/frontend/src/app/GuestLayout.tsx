import { LanguageToggle } from '../shared/ui/LanguageToggle'
import { PageTransition } from '../shared/ui/PageTransition'
import { SpaceTraffic } from '../shared/ui/SpaceTraffic'

export function GuestLayout() {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      <SpaceTraffic />
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <PageTransition />
      </div>
    </div>
  )
}
