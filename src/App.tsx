import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapPin, RotateCcw, Sparkles } from 'lucide-react'
import { DetailDialog } from './components/DetailDialog'
import { FoodMap } from './components/FoodMap'
import { MobileResultsSheet } from './components/MobileResultsSheet'
import { RestaurantList, ListSkeleton } from './components/RestaurantList'
import { EmptyState, ErrorState } from './components/ResultsStates'
import { SearchHeader } from './components/SearchHeader'
import { ToastRegion } from './components/Toast'
import { restaurants, YONGZHOU_CENTER } from './data/restaurants'
import type { Coordinates, Filters, RestaurantWithDistance, ToastMessage } from './types'
import { DEFAULT_FILTERS, enrichRestaurants, filterRestaurants, getActiveFilterCount } from './utils'

function filtersFromUrl(params: URLSearchParams): Filters {
  const distance = params.get('distance')
  const rating = params.get('rating')
  const prices = params.get('price')?.split(',').filter((price): price is '¥' | '¥¥' | '¥¥¥' => ['¥', '¥¥', '¥¥¥'].includes(price)) ?? []
  return {
    distance: distance === '1' || distance === '3' || distance === '5' ? distance : 'all',
    rating: rating === '4' || rating === '4.5' ? rating : 'all', prices,
    openOnly: params.get('open') === '1',
  }
}

function updateUrl(query: string, filters: Filters, mode: 'push' | 'replace') {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (filters.distance !== 'all') params.set('distance', filters.distance)
  if (filters.rating !== 'all') params.set('rating', filters.rating)
  if (filters.prices.length) params.set('price', filters.prices.join(','))
  if (filters.openOnly) params.set('open', '1')
  const url = `${window.location.pathname}${params.size ? `?${params}` : ''}`
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', url)
}

function ResultsContent({ items, selectedId, loading, error, query, filters, onSelect, onDetails, onClear, onRetry }: {
  items: RestaurantWithDistance[]; selectedId: string | null; loading: boolean; error: boolean; query: string; filters: Filters
  onSelect: (id: string) => void; onDetails: (id: string) => void; onClear: () => void; onRetry: () => void
}) {
  const activeCount = getActiveFilterCount(filters)
  return <>
    <div className="results-heading">
      <div><span className="results-context">{query ? `“${query}”的搜索结果` : '编辑精选 · 永州附近'}</span><h1>{loading ? '正在寻味…' : error ? '搜索遇到问题' : `${items.length} 家值得去的店`}</h1></div>
      {!loading && !error && <div className="result-count" aria-live="polite"><strong>{items.length}</strong><span>处味道</span></div>}
      {(query || activeCount > 0) && !loading && <button className="reset-inline" type="button" onClick={onClear} aria-label="清除搜索和筛选"><RotateCcw size={15} /></button>}
    </div>
    {loading ? <ListSkeleton /> : error ? <ErrorState onRetry={onRetry} /> : items.length === 0 ? <EmptyState summary={query || `${activeCount} 个筛选条件`} onClear={onClear} /> :
      <RestaurantList restaurants={items} selectedId={selectedId} onSelect={onSelect} onDetails={onDetails} />}
  </>
}

export default function App() {
  const initialParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const initialQuery = initialParams.get('q') ?? ''
  const initialFilters = useMemo(() => filtersFromUrl(initialParams), [initialParams])
  const calculate = useCallback((query: string, nextFilters: Filters, nextOrigin: Coordinates) =>
    filterRestaurants(enrichRestaurants(restaurants, nextOrigin), query, nextFilters), [])

  const [input, setInput] = useState(initialQuery)
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [origin, setOrigin] = useState<Coordinates>(YONGZHOU_CENTER)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [displayed, setDisplayed] = useState(() => calculate(initialQuery, initialFilters, YONGZHOU_CENTER))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [locating, setLocating] = useState(false)
  const [tileError, setTileError] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const toastId = useRef(0)
  const searchTimer = useRef<number | null>(null)

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = ++toastId.current
    setToasts((current) => [...current, { ...toast, id }])
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 6500)
  }, [])

  const runSearch = useCallback(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current)
    setLoading(true); setError(false); setSelectedId(null)
    const nextQuery = input.trim()
    searchTimer.current = window.setTimeout(() => {
      setLoading(false)
      setQuery(nextQuery)
      if (nextQuery.includes('错误')) {
        setError(true)
        addToast({ type: 'error', message: '暂时没能完成搜索，请稍后重试。' })
        return
      }
      setDisplayed(calculate(nextQuery, filters, origin))
      updateUrl(nextQuery, filters, 'push')
    }, 650)
  }, [addToast, calculate, filters, input, origin])

  const changeFilters = useCallback((next: Filters) => {
    setFilters(next); setError(false); setSelectedId(null)
    setDisplayed(calculate(query, next, origin))
    updateUrl(query, next, 'replace')
  }, [calculate, origin, query])

  const clearConditions = useCallback(() => {
    setInput(''); setQuery(''); setFilters(DEFAULT_FILTERS); setError(false); setSelectedId(null)
    setDisplayed(calculate('', DEFAULT_FILTERS, origin)); updateUrl('', DEFAULT_FILTERS, 'replace')
  }, [calculate, origin])

  const applyLocation = useCallback((location: Coordinates, simulated = false) => {
    setOrigin(location); setUserLocation(location); setLocating(false); setSelectedId(null)
    setDisplayed(calculate(query, filters, location))
    addToast({ type: 'info', message: simulated ? '已使用永州市中心作为模拟位置。' : '定位成功，结果已按距离重新排序。' })
  }, [addToast, calculate, filters, query])

  const locate = useCallback(() => {
    setLocating(true)
    if (!navigator.geolocation) {
      applyLocation(YONGZHOU_CENTER, true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => applyLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => {
        setLocating(false)
        addToast({ type: 'error', message: '无法获取你的位置。可以继续使用永州市中心。', action: { label: '使用市中心', onClick: () => applyLocation(YONGZHOU_CENTER, true) } })
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
    )
  }, [addToast, applyLocation])

  const showDetails = (id: string) => { setDetailId(id); setDetailOpen(true) }
  const detailRestaurant = displayed.find((item) => item.id === detailId) ?? enrichRestaurants(restaurants, origin).find((item) => item.id === detailId) ?? null

  useEffect(() => {
    const popState = () => {
      const params = new URLSearchParams(window.location.search)
      const restoredQuery = params.get('q') ?? ''
      const restoredFilters = filtersFromUrl(params)
      setInput(restoredQuery); setQuery(restoredQuery); setFilters(restoredFilters); setError(false); setSelectedId(null)
      setDisplayed(calculate(restoredQuery, restoredFilters, origin))
    }
    window.addEventListener('popstate', popState)
    return () => window.removeEventListener('popstate', popState)
  }, [calculate, origin])

  useEffect(() => {
    const offline = () => addToast({ type: 'error', message: '网络已断开，地图底图可能暂时不可用。' })
    const online = () => addToast({ type: 'info', message: '网络已恢复，可以继续搜索。' })
    window.addEventListener('offline', offline); window.addEventListener('online', online)
    return () => { window.removeEventListener('offline', offline); window.removeEventListener('online', online) }
  }, [addToast])

  useEffect(() => () => { if (searchTimer.current) window.clearTimeout(searchTimer.current) }, [])

  const resultProps = { items: displayed, selectedId, loading, error, query, filters, onSelect: setSelectedId, onDetails: showDetails, onClear: clearConditions, onRetry: runSearch }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#results-start">跳到搜索结果</a>
      <SearchHeader value={input} onChange={setInput} onSubmit={runSearch} onLocate={locate} locating={locating} loading={loading}
        filters={filters} onFiltersChange={changeFilters} onFiltersReset={() => changeFilters(DEFAULT_FILTERS)} />
      <main className="main-layout" id="results-start" tabIndex={-1}>
        <aside className="desktop-results" aria-busy={loading}><ResultsContent {...resultProps} /></aside>
        <section className="map-stage" aria-label="餐厅地图">
          <FoodMap restaurants={displayed} selectedId={selectedId} onSelect={setSelectedId} onDetails={showDetails} userLocation={userLocation} loading={loading}
            onTileError={() => { if (!tileError) { setTileError(true); addToast({ type: 'error', message: '地图底图加载失败，餐厅列表仍可正常使用。' }) } }} />
          <div className="map-context"><Sparkles size={15} /><span>{userLocation ? '已按你的位置排序' : '探索永州街巷好味'}</span></div>
          {tileError && <div className="map-error"><MapPin size={16} />底图暂不可用，标记与列表仍可操作</div>}
        </section>
      </main>
      <MobileResultsSheet><ResultsContent {...resultProps} /></MobileResultsSheet>
      <DetailDialog restaurant={detailRestaurant} open={detailOpen} onOpenChange={setDetailOpen} />
      <ToastRegion toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))} />
    </div>
  )
}
