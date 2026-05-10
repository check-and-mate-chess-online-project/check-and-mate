import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Guid } from '../api/common'
import type { FigureType } from '../api/enums'

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
          const next: Partial<Record<FigureType, Guid>> = { ...state.equipped }
          if (skinId) next[figure] = skinId
          else delete next[figure]
          return { equipped: next }
        }),
      clear: () => set({ equipped: {} }),
    }),
    { name: 'equipped-skins' },
  ),
)
