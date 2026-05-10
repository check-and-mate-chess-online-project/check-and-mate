import { useEffect, useState, type CSSProperties } from 'react'

type Color = 'white' | 'black'

interface Props {
  skinId: string
  color: Color
  fallback: () => React.JSX.Element
  svgStyle?: CSSProperties
}

const cache = new Map<string, string | null>()

function fitSvgToParent(svg: string): string {
  return svg.replace(
    /<svg\b([^>]*)>/,
    (_, attrs: string) => {
      const cleaned = attrs
        .replace(/\swidth="[^"]*"/i, '')
        .replace(/\sheight="[^"]*"/i, '')
      return `<svg${cleaned} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`
    },
  )
}

async function loadSvg(url: string): Promise<string | null> {
  if (cache.has(url)) return cache.get(url) ?? null
  try {
    const res = await fetch(url)
    if (!res.ok) {
      cache.set(url, null)
      return null
    }
    const text = await res.text()
    if (!text.trim().startsWith('<svg')) {
      cache.set(url, null)
      return null
    }
    const fitted = fitSvgToParent(text)
    cache.set(url, fitted)
    return fitted
  } catch {
    cache.set(url, null)
    return null
  }
}

export function SkinPiece({ skinId, color, fallback, svgStyle }: Props) {
  const url = `/skins/${skinId}/board-${color}.svg`
  const [svg, setSvg] = useState<string | null | undefined>(
    cache.has(url) ? cache.get(url) : undefined,
  )

  useEffect(() => {
    if (svg !== undefined) return
    let cancelled = false
    loadSvg(url).then((result) => {
      if (!cancelled) setSvg(result)
    })
    return () => {
      cancelled = true
    }
  }, [url, svg])

  if (svg === null) return fallback()
  if (svg === undefined) return null

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
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
