import { useTranslation } from 'react-i18next'
import type { AppliedPly, Round } from '../lib/chessReplay'

interface Props {
  applied: AppliedPly[]
  rounds: Round[]
  cursor: number
  totalPlies: number
  onCursor: (n: number) => void
  whiteLogin?: string
  blackLogin?: string
  whiteClass?: string
  blackClass?: string
  className?: string
}

export function MoveHistoryList({
  applied,
  rounds,
  cursor,
  totalPlies,
  onCursor,
  whiteLogin,
  blackLogin,
  whiteClass = 'text-slate-200',
  blackClass = 'text-slate-200',
  className,
}: Props) {
  const { t } = useTranslation()
  const safeCursor = Math.min(cursor, totalPlies)

  return (
    <div
      className={`bg-slate-900/40 border border-slate-800 rounded-md p-3 ${
        className ?? ''
      }`}
    >
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 text-xs uppercase tracking-wider text-slate-500">
        <span />
        <span>{t('pages.replay.white')}</span>
        <span>{t('pages.replay.black')}</span>
      </div>
      {(whiteLogin || blackLogin) && (
        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 text-sm mt-1">
          <span />
          <span className={whiteClass}>{whiteLogin ?? '—'}</span>
          <span className={blackClass}>{blackLogin ?? '—'}</span>
        </div>
      )}
      <div className="my-3 border-t border-slate-800" />
      {rounds.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-2">—</p>
      ) : (
        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-1 text-sm font-mono">
          {rounds.map((round) => {
            const whiteIdx =
              applied.findIndex(
                (p) => p.moveNumber === round.moveNumber && p.color === 1,
              ) + 1
            const blackIdx =
              applied.findIndex(
                (p) => p.moveNumber === round.moveNumber && p.color === 2,
              ) + 1
            return (
              <div key={round.moveNumber} className="contents">
                <span className="text-slate-500">{round.moveNumber}.</span>
                <button
                  type="button"
                  onClick={() => round.white && onCursor(whiteIdx)}
                  disabled={!round.white}
                  className={
                    round.white && safeCursor === whiteIdx
                      ? 'text-left px-2 rounded bg-violet-600/30 text-violet-100'
                      : 'text-left px-2 rounded text-slate-300 hover:bg-slate-800'
                  }
                >
                  {round.white?.san ?? '—'}
                </button>
                <button
                  type="button"
                  onClick={() => round.black && onCursor(blackIdx)}
                  disabled={!round.black}
                  className={
                    round.black && safeCursor === blackIdx
                      ? 'text-left px-2 rounded bg-violet-600/30 text-violet-100'
                      : 'text-left px-2 rounded text-slate-300 hover:bg-slate-800'
                  }
                >
                  {round.black?.san ?? ''}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
