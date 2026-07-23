import L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { ExternalLink, Navigation, Star } from 'lucide-react'
import type { Coordinates, RestaurantCategory, RestaurantWithDistance } from '../types'
import { formatDistance, statusText } from '../utils'
import { directionsUrl } from './RestaurantList'

type Props = {
  restaurants: RestaurantWithDistance[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDetails: (id: string) => void
  userLocation: Coordinates | null
  loading: boolean
  onTileError: () => void
}

const pinPath = 'M19 1.5C9.1 1.5 1.5 9.1 1.5 19c0 12.7 17.5 27.5 17.5 27.5S36.5 31.7 36.5 19C36.5 9.1 28.9 1.5 19 1.5Z'

function classicPinIcon(sourceIndex: number, category: RestaurantCategory, selected: boolean) {
  return L.divIcon({
    className: 'food-marker-wrapper',
    html: `<span class="food-pin food-pin--${category} ${selected ? 'food-pin--selected' : ''}"><svg viewBox="0 0 38 48" aria-hidden="true" focusable="false"><path class="pin-ring pin-ring--outer" d="${pinPath}"/><path class="pin-ring pin-ring--inner" d="${pinPath}"/><path class="pin-body" d="${pinPath}"/><circle cx="19" cy="18.5" r="11" class="pin-center"/><text x="19" y="22.5" text-anchor="middle">${sourceIndex}</text></svg></span>`,
    iconSize: [38, 48],
    iconAnchor: [19, 47],
    popupAnchor: [0, -45],
  })
}

function MapViewport({ restaurants, selectedId, userLocation }: Pick<Props, 'restaurants' | 'selectedId' | 'userLocation'>) {
  const map = useMap()
  const previousResults = useRef('')
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  useEffect(() => {
    if (!selectedId) return
    const restaurant = restaurants.find((item) => item.id === selectedId)
    if (restaurant) map.flyTo([restaurant.lat, restaurant.lng], 16, { animate: !reducedMotion, duration: reducedMotion ? 0 : 0.65 })
  }, [map, reducedMotion, restaurants, selectedId])

  useEffect(() => {
    const key = restaurants.map((item) => item.id).join('|') + (userLocation ? `@${userLocation.lat}` : '')
    if (key === previousResults.current || selectedId) return
    previousResults.current = key
    const points = restaurants.map((item) => L.latLng(item.lat, item.lng))
    if (userLocation) points.push(L.latLng(userLocation.lat, userLocation.lng))
    if (points.length === 1) map.setView(points[0], 15)
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [54, 54], maxZoom: 14, animate: !reducedMotion })
  }, [map, reducedMotion, restaurants, selectedId, userLocation])
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

export function FoodMap({ restaurants, selectedId, onSelect, onDetails, userLocation, loading, onTileError }: Props) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({})
  useEffect(() => {
    if (!selectedId) return
    const timer = window.setTimeout(() => markerRefs.current[selectedId]?.openPopup(), 180)
    return () => window.clearTimeout(timer)
  }, [selectedId])

  useEffect(() => {
    restaurants.forEach((restaurant) => {
      const element = markerRefs.current[restaurant.id]?.getElement()
      const categoryLabel = restaurant.category === 'dessert' ? '甜品饮品' : '正餐小吃'
      element?.setAttribute('aria-label', `${restaurant.name}，${categoryLabel}，评分 ${restaurant.rating}，距离 ${formatDistance(restaurant.distance)}`)
      element?.setAttribute('role', 'button')
    })
  }, [restaurants])

  return (
    <div className={`food-map ${loading ? 'food-map--loading' : ''}`} aria-label="永州餐厅位置地图">
      <MapContainer center={[26.4345, 111.608]} zoom={13} zoomControl scrollWheelZoom={false}
        touchZoom doubleClickZoom boxZoom className="leaflet-map" preferCanvas>
        <ZoomControlAccessibility />
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: onTileError }} />
        <MapViewport restaurants={restaurants} selectedId={selectedId} userLocation={userLocation} />
        {userLocation && <>
          <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={15} pathOptions={{ color: '#287C9E', fillColor: '#287C9E', fillOpacity: 0.16, weight: 0 }} className="location-pulse" />
          <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={6} pathOptions={{ color: '#FFFFFF', fillColor: '#287C9E', fillOpacity: 1, weight: 3 }} />
        </>}
        {restaurants.map((restaurant) => {
          const selected = selectedId === restaurant.id
          return <Marker key={restaurant.id} position={[restaurant.lat, restaurant.lng]} icon={classicPinIcon(restaurant.sourceIndex, restaurant.category, selected)} keyboard riseOnHover zIndexOffset={selected ? 1000 : 0}
            title={`${restaurant.name}，评分 ${restaurant.rating}`} ref={(ref) => { markerRefs.current[restaurant.id] = ref }}
            eventHandlers={{ click: () => onSelect(restaurant.id) }}>
            <Popup minWidth={292} maxWidth={320} closeButton className="restaurant-popup">
              <div className="popup-content">
                <img src={restaurant.image} alt="" />
                <div className="popup-copy"><span className="popup-number">寻味 · {String(restaurant.sourceIndex).padStart(2, '0')}</span><strong>{restaurant.name}</strong>
                  <span className="popup-rating"><Star size={13} fill="currentColor" />{restaurant.rating.toFixed(1)}<i />{restaurant.cuisine[0]} · {restaurant.price}</span>
                  <span className={`status status--${restaurant.openStatus}`}>{statusText[restaurant.openStatus]} · {formatDistance(restaurant.distance)}</span>
                </div>
              </div>
              <div className="popup-actions"><button type="button" onClick={() => onDetails(restaurant.id)}>查看详情<ExternalLink size={14} /></button><a href={directionsUrl(restaurant)} target="_blank" rel="noreferrer"><Navigation size={14} />路线导航</a></div>
            </Popup>
          </Marker>
        })}
      </MapContainer>
      <div className="map-legend" role="group" aria-label="餐厅类别图例">
        <span><svg viewBox="0 0 16 20" aria-hidden="true"><path d="M8 1C4.1 1 1 4.1 1 8c0 5 7 11 7 11s7-6 7-11c0-3.9-3.1-7-7-7Z" /></svg>甜品饮品</span>
        <span><svg viewBox="0 0 16 20" aria-hidden="true"><path d="M8 1C4.1 1 1 4.1 1 8c0 5 7 11 7 11s7-6 7-11c0-3.9-3.1-7-7-7Z" /></svg>正餐小吃</span>
      </div>
    </div>
  )
}
