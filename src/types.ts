export type Price = '¥' | '¥¥' | '¥¥¥'
export type OpenStatus = 'open' | 'closing' | 'closed'
export type RestaurantCategory = 'barbecue' | 'noodles' | 'snack' | 'other'

export type Restaurant = {
  id: string
  /** 对应用户原始清单中的固定编号，用于列表与地图稳定联动。 */
  sourceIndex: number
  name: string
  category: RestaurantCategory
  image: string
  rating: number
  reviews: number
  cuisine: string[]
  price: Price
  openStatus: OpenStatus
  address: string
  lat: number
  lng: number
  featuredDish: string[]
  hours: string
  phone?: string
}

export type RestaurantWithDistance = Restaurant & { distance: number }

export type Filters = {
  distance: 'all' | '1' | '3' | '5'
  rating: 'all' | '4' | '4.5'
  prices: Price[]
  openOnly: boolean
}

export type Coordinates = { lat: number; lng: number }

export type ToastMessage = {
  id: number
  type: 'info' | 'error'
  message: string
  action?: { label: string; onClick: () => void }
}
