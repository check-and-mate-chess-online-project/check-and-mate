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

const FEN_TO_FIGURE: Record<
  string,
  { figure: FigureTypeT; color: Color }
> = {
  K: { figure: FigureType.King, color: 'white' },
  Q: { figure: FigureType.Queen, color: 'white' },
  R: { figure: FigureType.Rook, color: 'white' },
  B: { figure: FigureType.Bishop, color: 'white' },
  N: { figure: FigureType.Knight, color: 'white' },
  P: { figure: FigureType.Pawn, color: 'white' },
  k: { figure: FigureType.King, color: 'black' },
  q: { figure: FigureType.Queen, color: 'black' },
  r: { figure: FigureType.Rook, color: 'black' },
  b: { figure: FigureType.Bishop, color: 'black' },
  n: { figure: FigureType.Knight, color: 'black' },
  p: { figure: FigureType.Pawn, color: 'black' },
}

interface Props {
  options: ChessboardOptions
}

export function Chessboard({ options }: Props) {
  const equipped = useEquippedSkinsStore((s) => s.equipped)

  const pieces = useMemo(() => {
    const map: typeof defaultPieces = { ...defaultPieces }
    for (const [fen, { figure, color }] of Object.entries(FEN_TO_FIGURE)) {
      const skinId = equipped[figure]
      if (!skinId) continue
      const Default = defaultPieces[fen]
      map[fen] = (props) => (
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

  return <RCBChessboard options={{ ...options, pieces }} />
}
