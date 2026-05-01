import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FigureType, SkinRarity } from '../shared/api'
import type { OwnedSkinDto } from '../shared/api'
import { useInventory, useUpdateCustomization } from '../shared/api/hooks'
import { Skeleton } from '../shared/ui/Skeleton'

const FIGURES: FigureType[] = [
  FigureType.King,
  FigureType.Queen,
  FigureType.Rook,
  FigureType.Bishop,
  FigureType.Knight,
  FigureType.Pawn,
]

const RARITY_COLOR: Record<SkinRarity, string> = {
  [SkinRarity.Common]: 'border-slate-600 bg-slate-800',
  [SkinRarity.Rare]: 'border-blue-500 bg-blue-500/10',
  [SkinRarity.Legendary]: 'border-yellow-500 bg-yellow-500/10',
}

interface SkinCardProps {
  skin: OwnedSkinDto
  rarityLabel: string
  activeLabel: string
  onClick: () => void
  disabled: boolean
}

function SkinCard({
  skin,
  rarityLabel,
  activeLabel,
  onClick,
  disabled,
}: SkinCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col rounded-lg border-2 overflow-hidden transition-all ${
        skin.isActive ? 'ring-2 ring-blue-400' : ''
      } ${RARITY_COLOR[skin.rarity]} ${disabled ? 'opacity-60 cursor-wait' : 'hover:scale-105'}`}
      style={{ aspectRatio: '832 / 1216' }}
    >
      <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
        832×1216
      </div>
      <div className="p-2 bg-slate-900/80 text-left">
        <div className="text-sm text-slate-100 truncate">{skin.name}</div>
        <div className="text-xs text-slate-500">{rarityLabel}</div>
      </div>
      {skin.isActive && (
        <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white uppercase tracking-wider">
          {activeLabel}
        </span>
      )}
    </button>
  )
}

export function InventoryPage() {
  const { t } = useTranslation()
  const { data: skins, isLoading } = useInventory()
  const update = useUpdateCustomization()
  const [selected, setSelected] = useState<FigureType>(FigureType.King)

  const filtered = skins?.filter((s) => s.figureType === selected) ?? []

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl mb-6">{t('pages.inventory.title')}</h1>

      <div className="flex gap-2 mb-6 border-b border-slate-800">
        {FIGURES.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setSelected(f)}
            className={`px-4 py-2 -mb-px border-b-2 ${
              selected === f
                ? 'border-blue-500 text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            {t(`pages.inventory.figures.${f}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full"
              style={{ aspectRatio: '832 / 1216' }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((skin) => (
            <SkinCard
              key={skin.id}
              skin={skin}
              rarityLabel={t(`pages.inventory.rarity.${skin.rarity}`)}
              activeLabel={t('pages.inventory.active')}
              disabled={update.isPending || skin.isActive}
              onClick={() =>
                update.mutate({ figureType: skin.figureType, skinId: skin.id })
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
