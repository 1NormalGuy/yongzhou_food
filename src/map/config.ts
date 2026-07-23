import type { MapCoordinateSystem } from './coordinates'

const DEFAULT_TILE_URL = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
const DEFAULT_ATTRIBUTION = '&copy; <a href="https://www.amap.com/" target="_blank" rel="noreferrer">高德地图</a>'

function parseCoordinateSystem(value: string | undefined): MapCoordinateSystem {
  return value?.toLowerCase() === 'wgs84' ? 'wgs84' : 'gcj02'
}

function parseSubdomains(value: string | undefined): string | string[] {
  const normalized = value === undefined ? '1234' : value.trim()
  if (!normalized) return ''
  if (!normalized.includes(',')) return normalized
  return normalized.split(',').map((item) => item.trim()).filter(Boolean)
}

export const MAP_CONFIG = {
  tileUrl: import.meta.env.VITE_MAP_TILE_URL?.trim() || DEFAULT_TILE_URL,
  attribution: import.meta.env.VITE_MAP_ATTRIBUTION?.trim() || DEFAULT_ATTRIBUTION,
  subdomains: parseSubdomains(import.meta.env.VITE_MAP_SUBDOMAINS),
  coordinateSystem: parseCoordinateSystem(import.meta.env.VITE_MAP_COORDINATE_SYSTEM),
} as const
