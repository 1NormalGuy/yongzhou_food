import type { Coordinates, Filters, Restaurant, RestaurantWithDistance } from './types'

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

export function distanceKm(a: Coordinates, b: Coordinates) {
  const radius = 6371
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

export function formatDistance(distance: number) {
  if (distance < 1) return `${Math.max(10, Math.round((distance * 1000) / 10) * 10)} 米`
  return `${distance.toFixed(distance < 10 ? 1 : 0)} 公里`
}

export function enrichRestaurants(items: Restaurant[], origin: Coordinates): RestaurantWithDistance[] {
  return items
    .map((restaurant) => ({ ...restaurant, distance: distanceKm(origin, restaurant) }))
    .sort((a, b) => a.distance - b.distance)
}

export function filterRestaurants(items: RestaurantWithDistance[], query: string, filters: Filters) {
  const needle = query.trim().toLocaleLowerCase('zh-CN')
  return items.filter((restaurant) => {
    const haystack = [restaurant.name, restaurant.address, ...restaurant.cuisine, ...restaurant.featuredDish]
      .join(' ')
      .toLocaleLowerCase('zh-CN')
    if (needle && !haystack.includes(needle)) return false
    if (filters.distance !== 'all' && restaurant.distance > Number(filters.distance)) return false
    if (filters.rating !== 'all' && restaurant.rating < Number(filters.rating)) return false
    if (filters.prices.length && !filters.prices.includes(restaurant.price)) return false
    if (filters.openOnly && restaurant.openStatus !== 'open') return false
    return true
  })
}

export const statusText = {
  open: '营业中',
  closing: '即将打烊',
  closed: '已打烊',
} as const

export function getActiveFilterCount(filters: Filters) {
  return Number(filters.distance !== 'all') + Number(filters.rating !== 'all') + filters.prices.length + Number(filters.openOnly)
}

export const DEFAULT_FILTERS: Filters = { distance: 'all', rating: 'all', prices: [], openOnly: false }
