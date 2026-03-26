const CHIP_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  silhouette: { bg: '#EEF2FF', text: '#4338CA', dot: '#6366F1' },
  color:      { bg: '#FDF4FF', text: '#7E22CE', dot: '#A855F7' },
  fabric:     { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
  aesthetic:  { bg: '#FFF7ED', text: '#9A3412', dot: '#F97316' },
  occasion:   { bg: '#FFF1F2', text: '#9F1239', dot: '#FB7185' },
}

export const Chip = ({ label, type }: { label: string; type: keyof typeof CHIP_COLORS }) => {
  const c = CHIP_COLORS[type]
  return (
    <span
      style={{ background: c.bg, color: c.text }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
    >
      <span style={{ background: c.dot }} className="w-1.5 h-1.5 rounded-full flex-shrink-0" />
      {label}
    </span>
  )
}