import { useState, type CSSProperties } from 'react'
import { skinImageSrc } from '../../lib/skinImage'

type Color = 'white' | 'black'

interface Props {
  boardImage: string
  color: Color
  fallback: () => React.JSX.Element
  svgStyle?: CSSProperties
}

export function SkinPiece({ boardImage, color, fallback, svgStyle }: Props) {
  const [errored, setErrored] = useState(false)
  const src = skinImageSrc(boardImage)

  if (!src || errored) return fallback()

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        color: color === 'white' ? '#f8fafc' : '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        ...svgStyle,
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        onError={() => setErrored(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}
