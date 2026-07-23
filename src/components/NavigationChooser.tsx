import * as Dialog from '@radix-ui/react-dialog'
import { ExternalLink, MapPinned, Navigation, Smartphone, X } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'
import type { Restaurant } from '../types'

type NavigationTarget = Pick<Restaurant, 'name' | 'lat' | 'lng'>
type Platform = 'ios' | 'android' | 'desktop'

function detectPlatform(): Platform {
  const userAgent = navigator.userAgent
  if (/Android/i.test(userAgent)) return 'android'
  if (/iPad|iPhone|iPod/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios'
  return 'desktop'
}

export function navigationUrls(restaurant: NavigationTarget) {
  const name = encodeURIComponent(restaurant.name)
  const coordinates = `${restaurant.lat},${restaurant.lng}`
  const amapParameters = `sourceApplication=yongzhou_food&poiname=${name}&lat=${restaurant.lat}&lon=${restaurant.lng}&dev=1&style=2`
  return {
    iosAmap: `iosamap://navi?${amapParameters}`,
    androidAmap: `androidamap://navi?${amapParameters}`,
    appleMaps: `https://maps.apple.com/?daddr=${coordinates}&q=${name}&dirflg=d`,
    androidSystem: `geo:0,0?q=${coordinates}(${name})`,
    desktopAmap: `https://uri.amap.com/navigation?to=${restaurant.lng},${restaurant.lat},${name}&mode=car&src=yongzhou_food&callnative=1`,
  }
}

type Props = {
  restaurant: NavigationTarget
  className?: string
  iconSize?: number
  children?: ReactNode
}

export function NavigationChooser({ restaurant, className, iconSize = 15, children = '路线导航' }: Props) {
  const platform = detectPlatform()
  const urls = navigationUrls(restaurant)
  const options = platform === 'ios'
    ? [
        { label: '高德地图', description: '使用高德地图 App 导航', href: urls.iosAmap, native: true },
        { label: '系统地图', description: '使用 Apple 地图导航', href: urls.appleMaps, native: false },
      ]
    : platform === 'android'
      ? [
          { label: '高德地图', description: '使用高德地图 App 导航', href: urls.androidAmap, native: true },
          { label: '系统地图', description: '选择手机中已安装的地图应用', href: urls.androidSystem, native: true },
        ]
      : [
          { label: '高德地图网页版', description: '在浏览器中规划驾车路线', href: urls.desktopAmap, native: false },
          { label: 'Apple 地图', description: '在 Apple 地图中查看路线', href: urls.appleMaps, native: false },
        ]

  const stopPropagation = (event: MouseEvent) => event.stopPropagation()

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className={className} type="button" onClick={stopPropagation} aria-label={`打开前往${restaurant.name}的导航选项`}>
          <Navigation size={iconSize} aria-hidden="true" />{children}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay navigation-overlay" />
        <Dialog.Content className="navigation-dialog" aria-describedby="navigation-description" onClick={stopPropagation}>
          <div className="navigation-dialog-heading">
            <span className="navigation-dialog-icon"><MapPinned size={22} aria-hidden="true" /></span>
            <div><span className="results-context">选择地图应用</span><Dialog.Title>导航到{restaurant.name}</Dialog.Title></div>
            <Dialog.Close asChild><button className="icon-action" type="button" aria-label="关闭导航选项"><X size={20} /></button></Dialog.Close>
          </div>
          <Dialog.Description id="navigation-description">选择一个地图应用，将从你当前的位置规划驾车路线。</Dialog.Description>
          <div className="navigation-options">
            {options.map((option) => (
              <a key={option.label} href={option.href} target={option.native ? undefined : '_blank'} rel={option.native ? undefined : 'noreferrer'}>
                <span><Smartphone size={20} aria-hidden="true" /></span>
                <strong>{option.label}<small>{option.description}</small></strong>
                {!option.native && <ExternalLink size={17} aria-hidden="true" />}
              </a>
            ))}
          </div>
          <p className="navigation-note">坐标来自演示数据，实际路线请以地图应用为准。</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
