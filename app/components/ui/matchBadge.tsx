

export function MatchBadge({ score }: { score?: number }){
 if (!score) return null
  const pct = Math.round(score)
  const color = pct >= 70 ? 'bg-emerald-100 text-emerald-700' : pct >= 45 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {pct}% match
    </span>
  )
}