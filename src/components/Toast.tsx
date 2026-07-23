import { AlertTriangle, Info, X } from 'lucide-react'
import type { ToastMessage } from '../types'

export function ToastRegion({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: number) => void }) {
  return <div className="toast-region" aria-live="assertive" aria-atomic="true">
    {toasts.map((toast) => <div className={`toast toast--${toast.type}`} key={toast.id} role="alert">
      {toast.type === 'error' ? <AlertTriangle size={19} /> : <Info size={19} />}
      <span>{toast.message}</span>
      {toast.action && <button type="button" onClick={toast.action.onClick}>{toast.action.label}</button>}
      <button className="toast-close" type="button" onClick={() => onDismiss(toast.id)} aria-label="关闭提示"><X size={17} /></button>
    </div>)}
  </div>
}
