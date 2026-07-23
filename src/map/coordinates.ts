import type { Coordinates } from '../types'

export type MapCoordinateSystem = 'wgs84' | 'gcj02'

const PI = Math.PI
const EARTH_SEMI_MAJOR_AXIS = 6378245
const ECCENTRICITY_SQUARED = 0.006693421622965943

export function isOutsideChina({ lat, lng }: Coordinates) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271
}

function transformLatitude(x: number, y: number) {
  let value = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  value += ((20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2) / 3
  value += ((20 * Math.sin(y * PI) + 40 * Math.sin((y / 3) * PI)) * 2) / 3
  value += ((160 * Math.sin((y / 12) * PI) + 320 * Math.sin((y * PI) / 30)) * 2) / 3
  return value
}

function transformLongitude(x: number, y: number) {
  let value = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  value += ((20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2) / 3
  value += ((20 * Math.sin(x * PI) + 40 * Math.sin((x / 3) * PI)) * 2) / 3
  value += ((150 * Math.sin((x / 12) * PI) + 300 * Math.sin((x / 30) * PI)) * 2) / 3
  return value
}

/** Convert WGS84 business data to GCJ-02 for display on domestic map tiles. */
export function wgs84ToGcj02(coordinates: Coordinates): Coordinates {
  if (isOutsideChina(coordinates)) return { ...coordinates }

  const latitudeOffsetInput = coordinates.lat - 35
  const longitudeOffsetInput = coordinates.lng - 105
  let latitudeOffset = transformLatitude(longitudeOffsetInput, latitudeOffsetInput)
  let longitudeOffset = transformLongitude(longitudeOffsetInput, latitudeOffsetInput)
  const latitudeRadians = (coordinates.lat / 180) * PI
  const sineLatitude = Math.sin(latitudeRadians)
  const magic = 1 - ECCENTRICITY_SQUARED * sineLatitude * sineLatitude
  const squareRootMagic = Math.sqrt(magic)

  latitudeOffset = (latitudeOffset * 180)
    / (((EARTH_SEMI_MAJOR_AXIS * (1 - ECCENTRICITY_SQUARED)) / (magic * squareRootMagic)) * PI)
  longitudeOffset = (longitudeOffset * 180)
    / ((EARTH_SEMI_MAJOR_AXIS / squareRootMagic) * Math.cos(latitudeRadians) * PI)

  return {
    lat: coordinates.lat + latitudeOffset,
    lng: coordinates.lng + longitudeOffset,
  }
}

export function toMapCoordinates(coordinates: Coordinates, coordinateSystem: MapCoordinateSystem): Coordinates {
  return coordinateSystem === 'gcj02' ? wgs84ToGcj02(coordinates) : { ...coordinates }
}
