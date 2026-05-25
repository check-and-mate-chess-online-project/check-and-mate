import { create } from 'zustand'
import type { SkinDto } from '../api/dto'
import { normalizeFigureType, type FigureType } from '../api/enums'

interface EquippedSkinsState {
  equipped: Partial<Record<FigureType, SkinDto>>
  setEquipped: (figure: FigureType, skin: SkinDto | null) => void
  clear: () => void
}

export const useEquippedSkinsStore = create<EquippedSkinsState>()((set) => ({
  equipped: {},
  setEquipped: (figure, skin) =>
    set((state) => {
      const normalizedFigure = normalizeFigureType(figure)
      if (normalizedFigure === null) return state
      const next: Partial<Record<FigureType, SkinDto>> = { ...state.equipped }
      if (skin) next[normalizedFigure] = skin
      else delete next[normalizedFigure]
      return { equipped: next }
    }),
  clear: () => set({ equipped: {} }),
}))
