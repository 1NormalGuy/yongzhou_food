import { RefreshCw, SearchX, Soup } from 'lucide-react'

export function EmptyState({ summary, onClear }: { summary: string; onClear: () => void }) {
  return <div className="result-state" role="status">
    <div className="empty-bowl"><Soup size={48} strokeWidth={1.4} /><i /><i /><i /></div>
    <h2>这次没找到合口味的</h2><p>没有匹配“{summary || '当前条件'}”的餐厅，换个关键词或放宽筛选试试。</p>
    <button className="secondary-button" type="button" onClick={onClear}><SearchX size={17} />清除条件</button>
  </div>
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="result-state" role="alert">
    <div className="state-icon state-icon--error"><RefreshCw size={27} /></div>
    <h2>暂时没能完成搜索</h2><p>上一次的地图结果还在。请检查网络连接，或稍后再试。</p>
    <button className="primary-button" type="button" onClick={onRetry}><RefreshCw size={17} />重新搜索</button>
  </div>
}
