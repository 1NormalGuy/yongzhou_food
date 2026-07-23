import { LocateFixed, Search, Soup, X } from 'lucide-react'
import type { FormEvent } from 'react'
import type { Filters } from '../types'
import { DesktopFilterBar, MobileFilterSheet } from './FilterControls'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onLocate: () => void
  locating: boolean
  loading: boolean
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onFiltersReset: () => void
}

export function SearchHeader({ value, onChange, onSubmit, onLocate, locating, loading, filters, onFiltersChange, onFiltersReset }: Props) {
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit() }
  return (
    <header className="search-header">
      <a className="brand" href="/" onClick={(event) => event.preventDefault()} aria-label="永州寻味地图首页">
        <span className="brand-mark"><Soup size={27} aria-hidden="true" /></span>
        <strong>永州寻味</strong>
      </a>
      <form className="search-form" role="search" onSubmit={submit}>
        <label className="sr-only" htmlFor="restaurant-search">搜索餐厅、菜系或招牌菜</label>
        <Search className="search-leading" size={20} aria-hidden="true" />
        <input id="restaurant-search" type="search" value={value} onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Escape') { onChange(''); event.currentTarget.blur() } }}
          placeholder="搜索餐厅、菜系或菜品" autoComplete="off" />
        {value && <button className="clear-search" type="button" onClick={() => onChange('')} aria-label="清空搜索"><X size={18} /></button>}
        <button className="search-submit" type="submit" disabled={loading}>
          {loading ? <span className="spinner" aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
          <span>{loading ? '搜索中' : '搜索'}</span>
        </button>
      </form>
      <button className="location-button" type="button" onClick={onLocate} disabled={locating}>
        {locating ? <span className="spinner spinner--dark" aria-hidden="true" /> : <LocateFixed size={19} aria-hidden="true" />}
        <span>{locating ? '正在定位' : '使用我的位置'}</span>
      </button>
      <MobileFilterSheet filters={filters} onChange={onFiltersChange} onReset={onFiltersReset} />
      <DesktopFilterBar filters={filters} onChange={onFiltersChange} onReset={onFiltersReset} />
    </header>
  )
}
