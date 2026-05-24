import { useEffect } from 'react'
import { useSkinConfiguration } from '../api/hooks'
import { useEquippedSkinsStore } from './equippedSkins'
import { FigureType, normalizeFigureType } from '../api/enums'

export function useSyncEquippedSkins() {
  const { data } = useSkinConfiguration()
  const setEquipped = useEquippedSkinsStore((s) => s.setEquipped)

  useEffect(() => {
    if (!data?.userFigureSkins) return
    for (const [figureKey, skin] of Object.entries(data.userFigureSkins)) {
      const parsedNumber = Number(figureKey)
      const candidate: FigureType = (
        Number.isNaN(parsedNumber) ? figureKey : parsedNumber
      ) as FigureType
      const figure = normalizeFigureType(candidate)
      if (figure === null || !skin?.id) continue
      setEquipped(figure, skin.id)
    }
  }, [data, setEquipped])
}
