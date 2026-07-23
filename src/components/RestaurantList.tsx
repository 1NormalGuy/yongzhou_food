import { useEffect, useRef, useState } from 'react'
import { Check, ChevronRight, MapPin, Navigation, Star } from 'lucide-react'
import type { RestaurantWithDistance } from '../types'
import { formatDistance, statusText } from '../utils'

type ItemProps = {
  restaurant: RestaurantWithDistance
  selected: boolean
  onSelect: () => void
  onDetails: () => void
}

export function directionsUrl(restaurant: RestaurantWithDistance) {
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${restaurant.lat}%2C${restaurant.lng}`
}

function RestaurantImage({ restaurant }: { restaurant: RestaurantWithDistance }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className="image-fallback" aria-label={`${restaurant.name}暂无图片`}>{restaurant.cuisine[0].slice(0, 1)}</div>
  return <img src={restaurant.image} alt={`${restaurant.name}的${restaurant.featuredDish[0]}`} loading="lazy" onError={() => setFailed(true)} />
}

export function RestaurantListItem({ restaurant, selected, onSelect, onDetails }: ItemProps) {
  return (
    <article className={`restaurant-item ${selected ? 'restaurant-item--selected' : ''}`} data-restaurant-id={restaurant.id} role="listitem">
      <button className="restaurant-select" type="button" onClick={onSelect} aria-pressed={selected} aria-label={`在地图上查看${restaurant.name}`}>
        <span className={`list-number ${selected ? 'list-number--selected' : ''}`}>{selected ? <Check size={14} strokeWidth={3} /> : restaurant.sourceIndex}</span>
        <span className="restaurant-photo"><RestaurantImage restaurant={restaurant} /><span className="dish-ribbon">{restaurant.featuredDish[0]}</span></span>
        <span className="restaurant-copy">
          <span className="restaurant-name-row"><strong>{restaurant.name}</strong><ChevronRight size={17} aria-hidden="true" /></span>
          <span className="rating-row"><Star size={14} fill="currentColor" aria-hidden="true" /><b>{restaurant.rating.toFixed(1)}</b><span>({restaurant.reviews.toLocaleString('zh-CN')})</span><i aria-hidden="true" /> <span>{restaurant.cuisine.join(' · ')}</span><span className="price">{restaurant.price}</span></span>
          <span className="meta-row"><span className={`status status--${restaurant.openStatus}`}>{statusText[restaurant.openStatus]}</span><span className="distance">{formatDistance(restaurant.distance)}</span></span>
          <span className="address-row"><MapPin size={14} aria-hidden="true" />{restaurant.address}</span>
        </span>
      </button>
      <div className="item-actions">
        <button type="button" onClick={(event) => { event.stopPropagation(); onDetails() }}>查看详情</button>
        <a href={directionsUrl(restaurant)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}><Navigation size={14} />路线导航</a>
      </div>
    </article>
  )
}

type ListProps = {
  restaurants: RestaurantWithDistance[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDetails: (id: string) => void
}

export function RestaurantList({ restaurants, selectedId, onSelect, onDetails }: ListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!selectedId || !listRef.current) return
    listRef.current.querySelector(`[data-restaurant-id="${selectedId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedId])

  return (
    <div className="restaurant-list" ref={listRef} role="list">
      {restaurants.map((restaurant) => (
        <RestaurantListItem key={restaurant.id} restaurant={restaurant} selected={restaurant.id === selectedId}
          onSelect={() => onSelect(restaurant.id)} onDetails={() => onDetails(restaurant.id)} />
      ))}
    </div>
  )
}

export function ListSkeleton() {
  return <div className="skeleton-list" aria-label="正在加载餐厅" role="status">
    {[0, 1, 2, 3].map((item) => <div className="skeleton-item" key={item}><span className="skeleton skeleton--image" /><span className="skeleton-lines"><i /><i /><i /><i /></span></div>)}
  </div>
}
