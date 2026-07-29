import * as Dialog from '@radix-ui/react-dialog'
import { useRef, useState } from 'react'
import { Clock3, MapPin, Phone, Star, X } from 'lucide-react'
import type { RestaurantWithDistance } from '../types'
import { formatDistance, statusText } from '../utils'
import { AMapSearchLink } from './AMapSearchLink'

type Props = {
  restaurant: RestaurantWithDistance | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailImage({ restaurant }: { restaurant: RestaurantWithDistance }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className="detail-image-fallback" aria-label={`${restaurant.name}暂无图片`}>{restaurant.cuisine[0].slice(0, 1)}</div>
  return <img src={restaurant.image} alt={`${restaurant.name}餐厅与菜品`} onError={() => setFailed(true)} />
}

export function DetailDialog({ restaurant, open, onOpenChange }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  if (!restaurant) return null
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="detail-dialog" aria-describedby="detail-description" onOpenAutoFocus={(event) => { event.preventDefault(); titleRef.current?.focus() }}>
          <div className="detail-image-wrap"><DetailImage key={restaurant.id} restaurant={restaurant} /><div className="detail-image-shade" /></div>
          <Dialog.Close asChild><button className="dialog-close" aria-label="关闭详情"><X size={21} /></button></Dialog.Close>
          <div className="detail-body">
            <span className="results-context">{restaurant.cuisine.join(' · ')}</span>
            <Dialog.Title ref={titleRef} tabIndex={-1}>{restaurant.name}</Dialog.Title>
            <Dialog.Description id="detail-description" className="detail-rating">
              <Star size={16} fill="currentColor" /><strong>{restaurant.rating.toFixed(1)}</strong><span>{restaurant.reviews.toLocaleString('zh-CN')} 条评价</span><i />
              <span className={`status status--${restaurant.openStatus}`}>{statusText[restaurant.openStatus]}</span><span>{restaurant.price}</span>
            </Dialog.Description>
            <section className="signature-dishes"><h3>招牌值得点</h3><div>{restaurant.featuredDish.map((dish, index) => <span key={dish}><b>{String(index + 1).padStart(2, '0')}</b>{dish}</span>)}</div></section>
            <dl className="detail-facts">
              <div><dt><Clock3 size={17} />营业时间</dt><dd>{restaurant.hours}</dd></div>
              <div><dt><MapPin size={17} />地址</dt><dd>{restaurant.address}<small>距你 {formatDistance(restaurant.distance)}</small></dd></div>
              {restaurant.phone && <div><dt><Phone size={17} />电话</dt><dd>{restaurant.phone}</dd></div>}
            </dl>
            <div className="detail-actions"><Dialog.Close asChild><button className="secondary-button" type="button">返回地图</button></Dialog.Close><AMapSearchLink restaurant={restaurant} className="primary-button" iconSize={17} /></div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
