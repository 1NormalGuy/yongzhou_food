import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'

type Level = 'peek' | 'half' | 'full'
const levels: Level[] = ['peek', 'half', 'full']
const labels: Record<Level, string> = { peek: '收起', half: '半屏', full: '全屏' }

export function MobileResultsSheet({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<Level>('peek')
  const [dragY, setDragY] = useState(0)
  const drag = useRef<{ start: number; last: number } | null>(null)

  const cycle = () => setLevel(levels[(levels.indexOf(level) + 1) % levels.length])
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { start: event.clientY, last: event.clientY }
  }
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    drag.current.last = event.clientY
    setDragY(event.clientY - drag.current.start)
  }
  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    const delta = event.clientY - drag.current.start
    if (Math.abs(delta) < 8) cycle()
    else {
      const current = levels.indexOf(level)
      setLevel(levels[Math.max(0, Math.min(2, current + (delta < 0 ? 1 : -1)))])
    }
    drag.current = null
    setDragY(0)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const current = levels.indexOf(level)
    if (event.key === 'ArrowUp') { event.preventDefault(); setLevel(levels[Math.min(2, current + 1)]) }
    if (event.key === 'ArrowDown') { event.preventDefault(); setLevel(levels[Math.max(0, current - 1)]) }
  }

  return (
    <section className={`mobile-results mobile-results--${level} ${dragY ? 'is-dragging' : ''}`} style={{ '--drag-y': `${dragY}px` } as React.CSSProperties} aria-label="搜索结果面板">
      <button className="drag-handle" type="button" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { drag.current = null; setDragY(0) }}
        onKeyDown={onKeyDown} aria-expanded={level === 'full'} aria-label={`搜索结果面板，当前${labels[level]}；点击切换高度，上下箭头调整`}>
        <span /><em>{labels[level]}</em>
      </button>
      {children}
    </section>
  )
}
