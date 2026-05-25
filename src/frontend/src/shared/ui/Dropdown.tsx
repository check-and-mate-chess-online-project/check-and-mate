import { useState, useRef, useEffect, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

export interface DropdownItem {
  label: string
  to?: string
  onClick?: () => void
  danger?: boolean
}

interface DropdownProps {
  label: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
}

export function Dropdown({ label, items, align = 'left' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const alignClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
          open
            ? 'text-violet-100 bg-violet-500/15 border-violet-400/40'
            : 'text-violet-300 hover:text-violet-100 border-violet-500/25 hover:border-violet-400/50 hover:bg-violet-500/10'
        }`}
      >
        {label}
        <span
          className="text-[10px] leading-none transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div
          className={`absolute ${alignClass} top-full mt-2 bg-violet-900/40 border border-violet-500/20 backdrop-blur rounded-md py-1 min-w-[160px] shadow-lg z-50`}
        >
          {items.map((item, i) =>
            item.to ? (
              <NavLink
                key={i}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 ${
                    isActive
                      ? 'text-violet-100 bg-violet-500/20'
                      : 'text-violet-200 hover:bg-violet-500/10 hover:text-violet-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 ${
                  item.danger
                    ? 'text-orange-400 hover:bg-orange-500/20 hover:text-orange-300'
                    : 'text-violet-200 hover:bg-violet-500/10 hover:text-violet-100'
                }`}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
