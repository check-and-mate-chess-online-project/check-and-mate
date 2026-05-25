import { useTranslation } from 'react-i18next'
import type { AppliedPly } from '../lib/chessReplay'

type PieceLetter = 'k' | 'q' | 'r' | 'b' | 'n' | 'p'

const PIECE_VALUE: Record<PieceLetter, number> = {
  q: 9,
  r: 5,
  b: 3,
  n: 3,
  p: 1,
  k: 0,
}

const PIECE_ORDER: PieceLetter[] = ['q', 'r', 'b', 'n', 'p']

const WHITE_GLYPHS: Record<PieceLetter, string> = {
  k: '♔',
  q: '♕',
  r: '♖',
  b: '♗',
  n: '♘',
  p: '♙',
}

const BLACK_GLYPHS: Record<PieceLetter, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}

interface Props {
  applied: AppliedPly[]
  upTo?: number
  myColor: 'white' | 'black'
}

function tally(applied: AppliedPly[], upTo: number) {
  const byWhite: PieceLetter[] = []
  const byBlack: PieceLetter[] = []
  for (let i = 0; i < Math.min(applied.length, upTo); i++) {
    const p = applied[i]
    if (!p.captured) continue
    const letter = p.captured as PieceLetter
    if (p.mover === 'w') byWhite.push(letter)
    else byBlack.push(letter)
  }
  return { byWhite, byBlack }
}

function sortPieces(list: PieceLetter[]): PieceLetter[] {
  return [...list].sort(
    (a, b) =>
      PIECE_ORDER.indexOf(a) - PIECE_ORDER.indexOf(b) ||
      a.localeCompare(b),
  )
}

function materialAdvantage(
  byMe: PieceLetter[],
  byOpp: PieceLetter[],
): number {
  const sum = (list: PieceLetter[]) =>
    list.reduce((acc, p) => acc + PIECE_VALUE[p], 0)
  return sum(byMe) - sum(byOpp)
}

interface RowProps {
  pieces: PieceLetter[]
  capturedColor: 'white' | 'black'
  advantage: number
  label: string
}

function Row({ pieces, capturedColor, advantage, label }: RowProps) {
  const glyphs = capturedColor === 'white' ? WHITE_GLYPHS : BLACK_GLYPHS
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-1 min-h-6">
        {pieces.length === 0 ? (
          <span className="text-slate-700 text-sm">—</span>
        ) : (
          pieces.map((p, i) => (
            <span
              key={`${p}-${i}`}
              className={
                capturedColor === 'white'
                  ? 'text-slate-100 text-xl leading-none drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]'
                  : 'text-slate-400 text-xl leading-none'
              }
            >
              {glyphs[p]}
            </span>
          ))
        )}
        {advantage > 0 && (
          <span className="ml-1 text-xs text-orange-300 font-mono tabular-nums">
            +{advantage}
          </span>
        )}
      </div>
    </div>
  )
}

export function CapturedPieces({ applied, upTo, myColor }: Props) {
  const { t } = useTranslation()
  const u = upTo ?? applied.length
  const { byWhite, byBlack } = tally(applied, u)
  const sortedWhite = sortPieces(byWhite)
  const sortedBlack = sortPieces(byBlack)
  const whiteAdv = materialAdvantage(byWhite, byBlack)
  const blackAdv = -whiteAdv

  const myList = myColor === 'white' ? sortedWhite : sortedBlack
  const oppList = myColor === 'white' ? sortedBlack : sortedWhite
  const myCapturedColor = myColor === 'white' ? 'black' : 'white'
  const oppCapturedColor = myColor === 'white' ? 'white' : 'black'
  const myAdv = myColor === 'white' ? whiteAdv : blackAdv
  const oppAdv = -myAdv

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-md p-3 flex flex-col gap-3">
      <Row
        pieces={oppList}
        capturedColor={oppCapturedColor}
        advantage={oppAdv}
        label={t('pages.game.opponent')}
      />
      <Row
        pieces={myList}
        capturedColor={myCapturedColor}
        advantage={myAdv}
        label={t('pages.game.you')}
      />
    </div>
  )
}
