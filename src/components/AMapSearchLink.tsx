import { ExternalLink } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'
import type { Restaurant } from '../types'

type SearchTarget = Pick<Restaurant, 'name' | 'lat' | 'lng'>

export function amapSearchUrl(restaurant: SearchTarget) {
  const parameters = new URLSearchParams({
    keyword: restaurant.name,
    center: `${restaurant.lng},${restaurant.lat}`,
    city: '永州',
    view: 'map',
    src: 'yongzhou_food',
    callnative: '1',
  })
  return `https://uri.amap.com/search?${parameters.toString()}`
}

type Props = {
  restaurant: SearchTarget
  className?: string
  iconSize?: number
  children?: ReactNode
}

export function AMapSearchLink({ restaurant, className, iconSize = 15, children = '高德看店' }: Props) {
  const stopPropagation = (event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation()

  return (
    <a
      className={className}
      href={amapSearchUrl(restaurant)}
      target="_blank"
      rel="noreferrer"
      onClick={stopPropagation}
      aria-label={`在高德地图搜索${restaurant.name}`}
    >
      <ExternalLink size={iconSize} aria-hidden="true" />
      {children}
    </a>
  )
}
