import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Guid } from '../api/common'
import { normalizeFigureType, type FigureType } from '../api/enums'

interface EquippedSkinsState {
  equipped: Partial<Record<FigureType, Guid>>
  setEquipped: (figure: FigureType, skinId: Guid | null) => void
  clear: () => void
}

export const useEquippedSkinsStore = create<EquippedSkinsState>()(
  persist(
    (set) => ({
      equipped: {},
      setEquipped: (figure, skinId) =>
        set((state) => {
          const normalizedFigure = normalizeFigureType(figure)
          if (normalizedFigure === null) return state
          const next: Partial<Record<FigureType, Guid>> = { ...state.equipped }
          if (skinId) next[normalizedFigure] = skinId
          else delete next[normalizedFigure]
          return { equipped: next }
        }),
      clear: () => set({ equipped: {} }),
    }),
    { name: 'equipped-skins' },
  ),
)
