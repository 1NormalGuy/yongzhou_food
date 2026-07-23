import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'

type Level = 'peek' | 'half' | 'full'
const levels: Level[] = ['peek', 'half', 'full']
const labels: Record<Level, string> = { peek: '收起', half: '半屏', full: '全屏' }

export function MobileResultsSheet({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<Level>('peek')
  const sheetRef = useRef<HTMLElement>(null)
  const drag = useRef<{ start: number; last: number } | null>(null)
  const pendingDelta = useRef(0)
  const frame = useRef<number | null>(null)

  useEffect(() => () => {
    if (frame.current !== null) window.cancelAnimationFrame(frame.current)
  }, [])

  const levelOffsets = () => {
    const viewport = window.innerHeight
    const sheetHeight = Math.max(0, viewport - 92)
    return {
      full: 0,
      half: Math.max(0, sheetHeight - viewport * 0.52),
      peek: Math.max(0, sheetHeight - 132),
    } satisfies Record<Level, number>
  }

  const clampDelta = (delta: number) => {
    const offsets = levelOffsets()
    const currentIndex = levels.indexOf(level)
    const currentOffset = offsets[level]
    const higher = levels[Math.min(levels.length - 1, currentIndex + 1)]
    const lower = levels[Math.max(0, currentIndex - 1)]
    return Math.max(offsets[higher] - currentOffset, Math.min(offsets[lower] - currentOffset, delta))
  }

  const writeDragPosition = () => {
    frame.current = null
    sheetRef.current?.style.setProperty('--drag-y', `${pendingDelta.current}px`)
  }

  const resetDragStyles = () => {
    if (frame.current !== null) { window.cancelAnimationFrame(frame.current); frame.current = null }
    pendingDelta.current = 0
    sheetRef.current?.style.setProperty('--drag-y', '0px')
    sheetRef.current?.classList.remove('is-dragging')
  }

  const cycle = () => setLevel(levels[(levels.indexOf(level) + 1) % levels.length])
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { start: event.clientY, last: event.clientY }
    sheetRef.current?.classList.add('is-dragging')
  }
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    drag.current.last = event.clientY
    pendingDelta.current = clampDelta(event.clientY - drag.current.start)
    if (frame.current === null) frame.current = window.requestAnimationFrame(writeDragPosition)
  }
  const onPointerUp = () => {
    if (!drag.current) return
    const delta = drag.current.last - drag.current.start
    if (Math.abs(delta) < 8) cycle()
    else {
      const current = levels.indexOf(level)
      setLevel(levels[Math.max(0, Math.min(2, current + (delta < 0 ? 1 : -1)))])
    }
    drag.current = null
    resetDragStyles()
  }
  const onPointerCancel = () => {
    drag.current = null
    resetDragStyles()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const current = levels.indexOf(level)
    if (event.key === 'ArrowUp') { event.preventDefault(); setLevel(levels[Math.min(2, current + 1)]) }
    if (event.key === 'ArrowDown') { event.preventDefault(); setLevel(levels[Math.max(0, current - 1)]) }
  }

  return (
    <section ref={sheetRef} className={`mobile-results mobile-results--${level}`} aria-label="搜索结果面板">
      <button className="drag-handle" type="button" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown} aria-expanded={level === 'full'} aria-label={`搜索结果面板，当前${labels[level]}；点击切换高度，上下箭头调整`}>
        <span /><em>{labels[level]}</em>
      </button>
      {children}
    </section>
  )
}
