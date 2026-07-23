import * as Dialog from '@radix-ui/react-dialog'
import * as Popover from '@radix-ui/react-popover'
import { Check, ChevronDown, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import type { Filters, Price } from '../types'
import { getActiveFilterCount } from '../utils'

type Props = {
  filters: Filters
  onChange: (filters: Filters) => void
  onReset: () => void
}

const choiceClass = (active: boolean) =>
  `filter-choice ${active ? 'filter-choice--active' : ''}`

function FilterOptions({ filters, onChange, compact = false }: Props & { compact?: boolean }) {
  const prices: Price[] = ['¥', '¥¥', '¥¥¥']
  return (
    <div className={compact ? 'filter-options filter-options--sheet' : 'filter-options'}>
      <fieldset>
        <legend>距离</legend>
        <div className="choice-grid">
          {([['all', '不限'], ['1', '1 公里'], ['3', '3 公里'], ['5', '5 公里']] as const).map(([value, label]) => (
            <label className={choiceClass(filters.distance === value)} key={value}>
              <input type="radio" name={compact ? 'sheet-distance' : 'distance'} value={value} checked={filters.distance === value}
                onChange={() => onChange({ ...filters, distance: value })} />
              {label}{filters.distance === value && <Check aria-hidden="true" size={15} />}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>评分</legend>
        <div className="choice-grid choice-grid--three">
          {([['all', '不限'], ['4', '4.0+'], ['4.5', '4.5+']] as const).map(([value, label]) => (
            <label className={choiceClass(filters.rating === value)} key={value}>
              <input type="radio" name={compact ? 'sheet-rating' : 'rating'} value={value} checked={filters.rating === value}
                onChange={() => onChange({ ...filters, rating: value })} />
              {label}{filters.rating === value && <Check aria-hidden="true" size={15} />}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>人均价格</legend>
        <div className="choice-grid choice-grid--three">
          {prices.map((price) => {
            const active = filters.prices.includes(price)
            return (
              <label className={choiceClass(active)} key={price}>
                <input type="checkbox" checked={active} onChange={() => onChange({
                  ...filters,
                  prices: active ? filters.prices.filter((item) => item !== price) : [...filters.prices, price],
                })} />
                {price}{active && <Check aria-hidden="true" size={15} />}
              </label>
            )
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend>营业状态</legend>
        <label className={`switch-row ${filters.openOnly ? 'switch-row--active' : ''}`}>
          <span><strong>只看营业中</strong><small>隐藏已打烊和即将打烊的餐厅</small></span>
          <input type="checkbox" checked={filters.openOnly} onChange={(event) => onChange({ ...filters, openOnly: event.target.checked })} />
          <span className="switch" aria-hidden="true"><span /></span>
        </label>
      </fieldset>
    </div>
  )
}

export function DesktopFilterBar(props: Props) {
  const count = getActiveFilterCount(props.filters)
  return (
    <div className="desktop-filterbar" aria-label="搜索筛选条件">
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className={`filter-trigger ${count ? 'filter-trigger--active' : ''}`} type="button">
            <SlidersHorizontal size={17} aria-hidden="true" /><span>筛选</span>
            {count > 0 && <span className="filter-count" aria-label={`已启用 ${count} 个条件`}>{count}</span>}
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="filter-popover" sideOffset={10} align="end">
            <div className="popover-heading">
              <div><span className="results-context">缩小范围</span><h2>筛选餐厅</h2></div>
              {count > 0 && <button className="text-button" type="button" onClick={props.onReset}><RotateCcw size={15} />重置</button>}
            </div>
            <FilterOptions {...props} />
            <Popover.Arrow className="popover-arrow" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

export function MobileFilterSheet(props: Props) {
  const count = getActiveFilterCount(props.filters)
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className={`icon-action mobile-filter ${count ? 'is-active' : ''}`} type="button" aria-label={`筛选餐厅${count ? `，已启用 ${count} 个条件` : ''}`}>
          <SlidersHorizontal size={20} />
          {count > 0 && <span className="mobile-filter-count">{count}</span>}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="filter-sheet" aria-describedby="filter-description">
          <div className="sheet-handle" aria-hidden="true" />
          <div className="sheet-titlebar">
            <div><span className="results-context">找到你的口味</span><Dialog.Title>筛选餐厅</Dialog.Title></div>
            <Dialog.Close asChild><button className="icon-action" aria-label="关闭筛选"><X size={21} /></button></Dialog.Close>
          </div>
          <Dialog.Description id="filter-description" className="sr-only">按距离、评分、价格和营业状态筛选餐厅。</Dialog.Description>
          <FilterOptions {...props} compact />
          <div className="filter-sheet-actions">
            <button className="secondary-button" type="button" onClick={props.onReset}><RotateCcw size={17} />重置</button>
            <Dialog.Close asChild><button className="primary-button" type="button">应用筛选{count > 0 ? ` · ${count}` : ''}</button></Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
