export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })
}

export function EvolutionDot({ isLatest }: { isLatest: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`w-4 h-4 rounded-full border-2 z-10 ${
          isLatest
            ? 'border-[#C9A96E] bg-[#C9A96E]'
            : 'border-[#D1CBC3] bg-white'
        }`}
      />
    </div>
  )
}
