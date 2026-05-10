import { useState, type CSSProperties } from 'react'

type Color = 'white' | 'black'

interface Props {
  skinId: string
  color: Color
  fallback: () => React.JSX.Element
  svgStyle?: CSSProperties
}

export function SkinPiece({ skinId, color, fallback, svgStyle }: Props) {
  const [errored, setErrored] = useState(false)
  if (errored) return fallback()
  return (
    <img
      src={`/skins/${skinId}/board-${color}.svg`}
      alt=""
      draggable={false}
      onError={() => setErrored(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        pointerEvents: 'none',
        ...svgStyle,
      }}
    />
  )
}
