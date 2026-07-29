import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Map, Store } from 'lucide-react'

export type MobileView = 'shops' | 'map'

const views: MobileView[] = ['shops', 'map']

export function MobileViewSwitcher({ view, resultCount, onViewChange }: {
  view: MobileView
  resultCount: number
  onViewChange: (view: MobileView) => void
}) {
  const tabRefs = useRef<Record<MobileView, HTMLButtonElement | null>>({ shops: null, map: null })
  const previousView = useRef(view)

  useEffect(() => {
    if (previousView.current === view) return
    previousView.current = view
    tabRefs.current[view]?.focus()
  }, [view])

  const activate = (nextView: MobileView) => {
    onViewChange(nextView)
    tabRefs.current[nextView]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentView: MobileView) => {
    const currentIndex = views.indexOf(currentView)
    let nextView: MobileView | null = null
    if (event.key === 'ArrowLeft') nextView = views[(currentIndex - 1 + views.length) % views.length]
    if (event.key === 'ArrowRight') nextView = views[(currentIndex + 1) % views.length]
    if (event.key === 'Home') nextView = views[0]
    if (event.key === 'End') nextView = views[views.length - 1]
    if (!nextView) return
    event.preventDefault()
    activate(nextView)
  }

  return (
    <nav className="mobile-view-switcher" role="tablist" aria-label="移动视图切换">
      <button
        ref={(node) => { tabRefs.current.shops = node }}
        className={view === 'shops' ? 'is-active' : ''}
        id="mobile-shops-tab"
        type="button"
        role="tab"
        aria-selected={view === 'shops'}
        aria-controls="mobile-shops-panel"
        tabIndex={view === 'shops' ? 0 : -1}
        onClick={() => onViewChange('shops')}
        onKeyDown={(event) => onKeyDown(event, 'shops')}
      >
        <Store size={19} strokeWidth={1.75} aria-hidden="true" />
        <span>店家</span>
        <em aria-label={`${resultCount}家`}>{resultCount}</em>
      </button>
      <button
        ref={(node) => { tabRefs.current.map = node }}
        className={view === 'map' ? 'is-active' : ''}
        id="mobile-map-tab"
        type="button"
        role="tab"
        aria-selected={view === 'map'}
        aria-controls="mobile-map-panel"
        tabIndex={view === 'map' ? 0 : -1}
        onClick={() => onViewChange('map')}
        onKeyDown={(event) => onKeyDown(event, 'map')}
      >
        <Map size={19} strokeWidth={1.75} aria-hidden="true" />
        <span>地图</span>
      </button>
    </nav>
  )
}
