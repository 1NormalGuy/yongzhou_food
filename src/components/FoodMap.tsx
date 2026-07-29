import L from 'leaflet'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Star } from 'lucide-react'
import { YONGZHOU_CENTER } from '../data/restaurants'
import { MAP_CONFIG } from '../map/config'
import { toMapCoordinates } from '../map/coordinates'
import type { Coordinates, RestaurantCategory, RestaurantWithDistance } from '../types'
import { distanceKm, formatDistance, statusText } from '../utils'
import { AMapSearchLink } from './AMapSearchLink'

type Props = {
  restaurants: RestaurantWithDistance[]
  selectedId: string | null
  selectionVersion: number
  onSelect: (id: string) => void
  onDetails: (id: string) => void
  userLocation: Coordinates | null
  mapActive: boolean
  fitAllResults: boolean
  onTileError: () => void
}

const pinPath = 'M16 2.75C8.54 2.75 2.5 8.79 2.5 16.25C2.5 26.25 16 40 16 40S29.5 26.25 29.5 16.25C29.5 8.79 23.46 2.75 16 2.75Z'
const mapCenter = toMapCoordinates(YONGZHOU_CENTER, MAP_CONFIG.coordinateSystem)
const displayCoordinates = (coordinates: Coordinates) => toMapCoordinates(coordinates, MAP_CONFIG.coordinateSystem)
const categoryLabels: Record<RestaurantCategory, string> = {
  barbecue: '烧烤',
  noodles: '粉面',
  snack: '小吃',
  other: '其他',
}

function classicPinIcon(category: RestaurantCategory, selected: boolean) {
  return L.divIcon({
    className: 'food-marker-wrapper',
    html: `<svg class="food-pin food-pin--${category} ${selected ? 'food-pin--selected' : ''}" width="32" height="40" viewBox="0 0 32 40" aria-hidden="true" focusable="false"><path class="pin-ring pin-ring--outer" d="${pinPath}"/><path class="pin-ring pin-ring--inner" d="${pinPath}"/><path class="pin-body" d="${pinPath}"/><circle cx="16" cy="16" r="7" class="pin-center"/></svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -38],
  })
}

function restaurantsForInitialViewport(restaurants: RestaurantWithDistance[], fitAllResults: boolean) {
  if (fitAllResults || restaurants.length < 3) return restaurants
  const cityCluster = restaurants.filter((restaurant) => distanceKm(YONGZHOU_CENTER, restaurant) <= 8)
  return cityCluster.length >= 3 && cityCluster.length < restaurants.length ? cityCluster : restaurants
}

function MapViewport({ restaurants, selectedId, selectionVersion, userLocation, fitAllResults, onSelectionSettled }: Pick<Props, 'restaurants' | 'selectedId' | 'selectionVersion' | 'userLocation' | 'fitAllResults'> & {
  onSelectionSettled: (id: string) => void
}) {
  const map = useMap()
  const previousResults = useRef('')
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  useEffect(() => {
    if (!selectedId) return
    const restaurant = restaurants.find((item) => item.id === selectedId)
    if (!restaurant) return
    const displayPosition = displayCoordinates(restaurant)
    const target = L.latLng(displayPosition.lat, displayPosition.lng)
    const settled = () => onSelectionSettled(selectedId)
    map.stop()
    if (reducedMotion || (map.getZoom() === 16 && map.getCenter().distanceTo(target) < 1)) {
      map.setView(target, 16, { animate: false })
      settled()
      return
    }
    map.once('moveend', settled)
    map.flyTo(target, 16, { animate: true, duration: 0.3 })
    return () => { map.off('moveend', settled) }
  }, [map, onSelectionSettled, reducedMotion, restaurants, selectedId, selectionVersion])

  useEffect(() => {
    const key = `${fitAllResults ? 'all' : 'cluster'}:${restaurants.map((item) => item.id).join('|')}${userLocation ? `@${userLocation.lat},${userLocation.lng}` : ''}`
    if (key === previousResults.current || selectedId) return
    previousResults.current = key
    const viewportRestaurants = restaurantsForInitialViewport(restaurants, fitAllResults)
    if (!fitAllResults && !userLocation && viewportRestaurants.length < restaurants.length) {
      map.setView([mapCenter.lat, mapCenter.lng], 14, { animate: !reducedMotion })
      return
    }
    const points = viewportRestaurants.map((item) => {
      const displayPosition = displayCoordinates(item)
      return L.latLng(displayPosition.lat, displayPosition.lng)
    })
    if (userLocation) {
      const displayUserLocation = displayCoordinates(userLocation)
      points.push(L.latLng(displayUserLocation.lat, displayUserLocation.lng))
    }
    if (points.length === 1) map.setView(points[0], 15)
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [54, 54], maxZoom: 14, animate: !reducedMotion, duration: reducedMotion ? 0 : 0.3 })
  }, [fitAllResults, map, reducedMotion, restaurants, selectedId, userLocation])
  return null
}

function ZoomControlAccessibility() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const zoomIn = container.querySelector<HTMLAnchorElement>('.leaflet-control-zoom-in')
    const zoomOut = container.querySelector<HTMLAnchorElement>('.leaflet-control-zoom-out')
    if (zoomIn) { zoomIn.setAttribute('aria-label', '放大地图'); zoomIn.title = '放大地图' }
    if (zoomOut) { zoomOut.setAttribute('aria-label', '缩小地图'); zoomOut.title = '缩小地图' }
  }, [map])
  return null
}

function MapVisibilityController({ active }: { active: boolean }) {
  const map = useMap()
  useLayoutEffect(() => {
    if (!active) return
    map.invalidateSize({ animate: false })
  }, [active, map])
  return null
}

const pinScaleForZoom = (zoom: number) => {
  if (zoom <= 11) return 0.62
  if (zoom >= 16) return 1
  return 0.62 + (zoom - 11) * 0.08
}

function PinScaleController() {
  const map = useMap()
  useEffect(() => {
    const updateScale = () => map.getContainer().style.setProperty('--pin-scale', String(pinScaleForZoom(map.getZoom())))
    updateScale()
    map.on('zoom zoomend', updateScale)
    return () => { map.off('zoom zoomend', updateScale) }
  }, [map])
  return null
}

function PopupImage({ restaurant }: { restaurant: RestaurantWithDistance }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className="popup-image-fallback" aria-label={`${restaurant.name}暂无图片`}>{restaurant.cuisine[0].slice(0, 1)}</div>
  return <img src={restaurant.image} alt="" onError={() => setFailed(true)} />
}

export function FoodMap({ restaurants, selectedId, selectionVersion, onSelect, onDetails, userLocation, mapActive, fitAllResults, onTileError }: Props) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({})
  const displayUserLocation = userLocation ? displayCoordinates(userLocation) : null
  const openSelectedPopup = useCallback((id: string) => markerRefs.current[id]?.openPopup(), [])

  useEffect(() => {
    restaurants.forEach((restaurant) => {
      const element = markerRefs.current[restaurant.id]?.getElement()
      element?.setAttribute('aria-label', `${restaurant.name}，${categoryLabels[restaurant.category]}，评分 ${restaurant.rating}，距离 ${formatDistance(restaurant.distance)}`)
      element?.setAttribute('role', 'button')
    })
  }, [restaurants])

  return (
    <div className="food-map" aria-label="永州餐厅位置地图">
      <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={13} zoomControl scrollWheelZoom={false}
        touchZoom doubleClickZoom boxZoom className="leaflet-map" preferCanvas>
        <ZoomControlAccessibility />
        <MapVisibilityController active={mapActive} />
        <PinScaleController />
        <TileLayer attribution={MAP_CONFIG.attribution} url={MAP_CONFIG.tileUrl} subdomains={MAP_CONFIG.subdomains} detectRetina
          eventHandlers={{ tileerror: onTileError }} />
        <MapViewport restaurants={restaurants} selectedId={selectedId} selectionVersion={selectionVersion} userLocation={userLocation} fitAllResults={fitAllResults}
          onSelectionSettled={openSelectedPopup} />
        {displayUserLocation && <>
          <CircleMarker center={[displayUserLocation.lat, displayUserLocation.lng]} radius={15} pathOptions={{ color: '#287C9E', fillColor: '#287C9E', fillOpacity: 0.16, weight: 0 }} className="location-halo" />
          <CircleMarker center={[displayUserLocation.lat, displayUserLocation.lng]} radius={6} pathOptions={{ color: '#FFFFFF', fillColor: '#287C9E', fillOpacity: 1, weight: 3 }} />
        </>}
        {restaurants.map((restaurant) => {
          const selected = selectedId === restaurant.id
          const displayPosition = displayCoordinates(restaurant)
          return <Marker key={restaurant.id} position={[displayPosition.lat, displayPosition.lng]} icon={classicPinIcon(restaurant.category, selected)} keyboard riseOnHover zIndexOffset={selected ? 1000 : 0}
            title={`${restaurant.name}，评分 ${restaurant.rating}`} ref={(ref) => { markerRefs.current[restaurant.id] = ref }}
            eventHandlers={{ click: () => onSelect(restaurant.id) }}>
            <Popup minWidth={292} maxWidth={320} closeButton className="restaurant-popup">
              <div className="popup-content">
                <PopupImage restaurant={restaurant} />
                <div className="popup-copy"><span className="popup-number">寻味 · {String(restaurant.sourceIndex).padStart(2, '0')}</span><strong>{restaurant.name}</strong>
                  <span className="popup-rating"><Star size={13} fill="currentColor" />{restaurant.rating.toFixed(1)}<i />{restaurant.cuisine[0]} · {restaurant.price}</span>
                  <span className={`status status--${restaurant.openStatus}`}>{statusText[restaurant.openStatus]} · {formatDistance(restaurant.distance)}</span>
                </div>
              </div>
              <div className="popup-actions"><button type="button" onClick={() => onDetails(restaurant.id)}>查看详情</button><AMapSearchLink restaurant={restaurant} className="navigation-trigger" iconSize={14} /></div>
            </Popup>
          </Marker>
        })}
      </MapContainer>
      <div className="map-legend" role="group" aria-label="餐厅类别图例">
        <span className="legend-barbecue"><svg viewBox="0 0 16 20" aria-hidden="true"><path d="M8 1C4.1 1 1 4.1 1 8c0 5 7 11 7 11s7-6 7-11c0-3.9-3.1-7-7-7Z" /></svg>烧烤</span>
        <span className="legend-noodles"><svg viewBox="0 0 16 20" aria-hidden="true"><path d="M8 1C4.1 1 1 4.1 1 8c0 5 7 11 7 11s7-6 7-11c0-3.9-3.1-7-7-7Z" /></svg>粉面</span>
        <span className="legend-snack"><svg viewBox="0 0 16 20" aria-hidden="true"><path d="M8 1C4.1 1 1 4.1 1 8c0 5 7 11 7 11s7-6 7-11c0-3.9-3.1-7-7-7Z" /></svg>小吃</span>
        <span className="legend-other"><svg viewBox="0 0 16 20" aria-hidden="true"><path d="M8 1C4.1 1 1 4.1 1 8c0 5 7 11 7 11s7-6 7-11c0-3.9-3.1-7-7-7Z" /></svg>其他</span>
      </div>
    </div>
  )
}
