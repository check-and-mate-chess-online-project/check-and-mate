import { useState, useRef, useEffect, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

export interface DropdownItem {
  label: string
  to?: string
  onClick?: () => void
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
        className="text-slate-400 hover:text-slate-100 flex items-center gap-1"
      >
        {label}
        <span className="text-xs">▾</span>
      </button>
      {open && (
        <div
          className={`absolute ${alignClass} top-full mt-2 bg-slate-800 border border-slate-700 rounded-md py-1 min-w-[160px] shadow-lg z-10`}
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
                      ? 'text-slate-100 bg-slate-700'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
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
                className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
