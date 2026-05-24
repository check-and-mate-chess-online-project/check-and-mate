import { useMemo } from 'react'
import {
  Chessboard as RCBChessboard,
  defaultPieces,
  type ChessboardOptions,
} from 'react-chessboard'
import { useEquippedSkinsStore } from '../../lib/equippedSkins'
import { FigureType } from '../../api/enums'
import type { FigureType as FigureTypeT } from '../../api/enums'
import { SkinPiece } from './SkinPiece'

type Color = 'white' | 'black'

const PIECE_KEY_TO_FIGURE: Record<
  string,
  { figure: FigureTypeT; color: Color }
> = {
  wK: { figure: FigureType.King, color: 'white' },
  wQ: { figure: FigureType.Queen, color: 'white' },
  wR: { figure: FigureType.Rook, color: 'white' },
  wB: { figure: FigureType.Bishop, color: 'white' },
  wN: { figure: FigureType.Knight, color: 'white' },
  wP: { figure: FigureType.Pawn, color: 'white' },
  bK: { figure: FigureType.King, color: 'black' },
  bQ: { figure: FigureType.Queen, color: 'black' },
  bR: { figure: FigureType.Rook, color: 'black' },
  bB: { figure: FigureType.Bishop, color: 'black' },
  bN: { figure: FigureType.Knight, color: 'black' },
  bP: { figure: FigureType.Pawn, color: 'black' },
}

interface Props {
  options: ChessboardOptions
}

export function Chessboard({ options }: Props) {
  const equipped = useEquippedSkinsStore((s) => s.equipped)

  const pieces = useMemo(() => {
    const map: typeof defaultPieces = { ...defaultPieces }
    for (const [key, { figure, color }] of Object.entries(PIECE_KEY_TO_FIGURE)) {
      const skinId = equipped[figure]
      if (!skinId) continue
      const Default = defaultPieces[key]
      map[key] = (props) => (
        <SkinPiece
          skinId={skinId}
          color={color}
          fallback={() => Default(props)}
          svgStyle={props?.svgStyle}
        />
      )
    }
    return map
  }, [equipped])

  return (
    <RCBChessboard
      options={{
        animationDurationInMs: 0,
        showAnimations: false,
        ...options,
        pieces,
      }}
    />
  )
}
