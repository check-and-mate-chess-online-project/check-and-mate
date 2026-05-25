import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { PlanetDto, SkinDto } from '../shared/api'
import {
  useEquipSkin,
  useInventory,
  usePlanetSkins,
  usePlanets,
} from '../shared/api/hooks'
import { planetById } from '../shared/lib/planets'
import {
  FigureType,
  figureTypeI18nKey,
  normalizeFigureType,
  skinRarityI18nKey,
} from '../shared/api/enums'

function figureKeyName(figure: number): string {
  switch (figure) {
    case FigureType.King:
      return 'king'
    case FigureType.Queen:
      return 'queen'
    case FigureType.Rook:
      return 'rook'
    case FigureType.Bishop:
      return 'bishop'
    case FigureType.Knight:
      return 'knight'
    case FigureType.Pawn:
      return 'pawn'
    default:
      return ''
  }
}
import { skinImageSrc } from '../shared/lib/skinImage'
import { useEquippedSkinsStore } from '../shared/lib/equippedSkins'
import { Skeleton } from '../shared/ui/Skeleton'

interface DisplaySkin extends SkinDto {
  isOwned: boolean
}

function isPlaceholderId(id: string): boolean {
  return id.startsWith('__placeholder__:')
}

function toDisplaySkins(planetSkins: SkinDto[]): DisplaySkin[] {
  return planetSkins.map((s) => ({ ...s, isOwned: !isPlaceholderId(s.id) }))
}

interface PlanetGridProps {
  planets: PlanetDto[]
  onSelect: (id: string) => void
}

function PlanetGrid({ planets, onSelect }: PlanetGridProps) {
  const { t } = useTranslation()
  return (
    <motion.div
      key="grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <h1 className="text-3xl mb-8">{t('pages.inventory.title')}</h1>
      <div className="grid grid-cols-3 gap-6">
        {planets.map((p) => {
          const meta = planetById(p.id)
          const available = meta?.available ?? false
          const name = t(`pages.inventory.planets.${p.id}`, {
            defaultValue: p.name,
          })
          if (!available) {
            return (
              <button
                key={p.id}
                type="button"
                disabled
                className="flex flex-col items-center cursor-not-allowed"
              >
                <img
                  src={p.imageUrl}
                  alt={name}
                  className="w-full aspect-square rounded-full grayscale opacity-40"
                  draggable={false}
                />
                <div className="mt-3 text-slate-500">
                  {name}
                  <span className="ml-2 text-xs uppercase tracking-wider text-slate-600">
                    {t('pages.lobby.mode.soon')}
                  </span>
                </div>
              </button>
            )
          }
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-center group"
            >
              <motion.img
                layoutId={`planet-${p.id}`}
                src={p.imageUrl}
                alt={name}
                className="w-full aspect-square rounded-full"
              />
              <div className="mt-3 text-slate-300 group-hover:text-slate-100">
                {name}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

interface PlanetDetailProps {
  planet: PlanetDto
  skins: DisplaySkin[]
  onBack: () => void
}

function PlanetDetail({ planet, skins, onBack }: PlanetDetailProps) {
  const { t } = useTranslation()
  const equip = useEquipSkin()
  const setEquipped = useEquippedSkinsStore((s) => s.setEquipped)
  const equippedMap = useEquippedSkinsStore((s) => s.equipped)
  const [idx, setIdx] = useState(0)
  const skin = skins[idx]
  const skinFigure = skin ? normalizeFigureType(skin.figure) : null
  const isActive =
    !!skin && skinFigure !== null && equippedMap[skinFigure]?.id === skin.id

  const planetName = t(`pages.inventory.planets.${planet.id}`, {
    defaultValue: planet.name,
  })
  const figureKeyForSkin =
    skin && skinFigure !== null ? figureKeyName(skinFigure) : null
  const skinName =
    skin && figureKeyForSkin
      ? t(`pages.inventory.skins.${planet.id}.${figureKeyForSkin}.name`, {
          defaultValue: '',
        })
      : ''
  const skinDescription =
    skin && figureKeyForSkin
      ? t(
          `pages.inventory.skins.${planet.id}.${figureKeyForSkin}.description`,
          { defaultValue: '' },
        )
      : ''

  const prev = () =>
    setIdx((i) => (i - 1 + skins.length) % Math.max(1, skins.length))
  const next = () => setIdx((i) => (i + 1) % Math.max(1, skins.length))

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="relative h-[80vh] overflow-hidden"
    >
      <button
        type="button"
        onClick={onBack}
        className="absolute top-0 left-0 z-30 text-slate-300 hover:text-slate-100"
      >
        ← {t('pages.inventory.back')}
      </button>

      <div className="absolute inset-0 right-80">
        <motion.img
          layoutId={`planet-${planet.id}`}
          src={planet.imageUrl}
          alt={planetName}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none rounded-full z-0"
          style={{
            bottom: '-110vh',
            width: '180vh',
            height: '180vh',
            maxWidth: '2000px',
            maxHeight: '2000px',
          }}
        />

        <div
          className="absolute bottom-0 left-0 right-0 h-64 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 100%)',
          }}
        />

        <AnimatePresence mode="wait">
          {skin && (
            <motion.div
              key={skin.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
              className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              style={{
                bottom: '0',
                height: '80vh',
                aspectRatio: '832 / 1216',
              }}
            >
              {skin.isOwned && skin.assets.idleImage ? (
                <img
                  src={skinImageSrc(skin.assets.idleImage)}
                  alt={skinName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-700 text-9xl bg-slate-900/30 rounded-lg border border-slate-800">
                  ?
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {skins.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-100 text-2xl"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-100 text-2xl"
            >
              →
            </button>
          </>
        )}
      </div>

      <aside className="absolute right-0 top-0 bottom-0 w-80 p-6 z-30 flex flex-col bg-slate-950/40 border-l border-slate-800 overflow-y-auto">
        <div className="text-xs uppercase text-slate-500 tracking-wider mb-1">
          {planetName}
        </div>

        {skin ? (
          skin.isOwned ? (
            <>
              <h2 className="text-2xl mb-1">{skinName || '—'}</h2>
              <div className="text-sm text-slate-400 mb-4">
                {t(`pages.inventory.figures.${figureTypeI18nKey(skin.figure)}`)}{' '}
                ·{' '}
                {t(`pages.inventory.rarity.${skinRarityI18nKey(skin.rarity)}`)}
              </div>
              {skinDescription && (
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                  {skinDescription}
                </p>
              )}
              <button
                type="button"
                disabled={equip.isPending || isActive}
                onClick={() =>
                  equip.mutate(
                    { figure: skinFigure ?? skin.figure, skinId: skin.id },
                    {
                      onSuccess: () =>
                        setEquipped(skinFigure ?? skin.figure, skin),
                    },
                  )
                }
                className={
                  isActive
                    ? 'px-4 py-2 bg-violet-900/60 border border-violet-500 text-violet-200 rounded-md text-sm self-start cursor-default flex items-center gap-2'
                    : 'px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm self-start'
                }
              >
                {isActive ? (
                  <>
                    <span>✓</span>
                    <span>{t('pages.inventory.active')}</span>
                  </>
                ) : equip.isPending ? (
                  t('pages.inventory.activating')
                ) : (
                  t('pages.inventory.setActive')
                )}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl mb-1 text-slate-500">???</h2>
              <div className="text-sm text-slate-500 mb-4">
                {t(`pages.inventory.figures.${figureTypeI18nKey(skin.figure)}`)}{' '}
                ·{' '}
                {t(`pages.inventory.rarity.${skinRarityI18nKey(skin.rarity)}`)}
              </div>
              <p className="text-sm text-slate-400 mb-6">
                {t('pages.inventory.lockedHint')}
              </p>
              <Link
                to="/cases"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm self-start text-center"
              >
                {t('pages.inventory.toCases')}
              </Link>
            </>
          )
        ) : (
          <p className="text-slate-400">{t('pages.inventory.noSkins')}</p>
        )}
      </aside>
    </motion.div>
  )
}

function PlanetDetailLoader({
  planet,
  onBack,
}: {
  planet: PlanetDto
  onBack: () => void
}) {
  const { data: planetSkins, isLoading } = usePlanetSkins(planet.id)
  if (isLoading || !planetSkins) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Skeleton className="w-64 h-8" />
      </div>
    )
  }
  const skins = toDisplaySkins(planetSkins)
  return <PlanetDetail planet={planet} skins={skins} onBack={onBack} />
}

export function InventoryPage() {
  const { data: planets } = usePlanets()
  const { isLoading: loadingInventory } = useInventory()
  const [selected, setSelected] = useState<string | null>(null)

  if (loadingInventory) {
    return (
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-full aspect-square rounded-full" />
        ))}
      </div>
    )
  }

  const planet = planets.find((p) => p.id === selected)
  const planetMeta = selected ? planetById(selected) : null
  const isAvailable = planetMeta?.available ?? false

  return (
    <AnimatePresence mode="wait">
      {selected && planet && isAvailable ? (
        <PlanetDetailLoader
          planet={planet}
          onBack={() => setSelected(null)}
        />
      ) : (
        <PlanetGrid planets={planets} onSelect={setSelected} />
      )}
    </AnimatePresence>
  )
}
