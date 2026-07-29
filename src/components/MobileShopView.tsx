import type { ReactNode } from 'react'

export function MobileShopView({ children, hidden }: { children: ReactNode; hidden: boolean }) {
  return (
    <section
      className="mobile-shop-view"
      id="mobile-shops-panel"
      role="tabpanel"
      aria-labelledby="mobile-shops-tab"
      hidden={hidden}
    >
      {children}
    </section>
  )
}
