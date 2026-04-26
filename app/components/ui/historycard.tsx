import { StyleDNAModel } from "@/model/userStyleDNA"
import { Chip } from "./chips"
import { EvolutionDot } from "./formats"
import { formatDate } from "./formats"  
import { useState } from 'react'

export function HistoryCard({
  record,
  index,
  total,
  isLatest,
}: {
  record: StyleDNAModel
  index: number
  total: number
  isLatest: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  
  // Handle both camelCase and snake_case field names
  const silhouettePrefs = record.silhouettePrefs || []
  const colorPalette = record.colorPalette || []
  const fabricTypes = record.fabricTypes || []
  const aestheticKeywords = record.aestheticKeywords || []
  const occasionStyle = record.occasionStyle || ''

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center pt-1 flex-shrink-0">
        <EvolutionDot isLatest={isLatest} />
        {index < total - 1 && (
          <div className="w-px flex-1 mt-1 bg-gradient-to-b from-[#D1CBC3] to-transparent min-h-[3rem]" />
        )}
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-6 rounded-2xl border transition-all duration-300 ${
          isLatest
            ? 'border-[#C9A96E]/40 bg-[#FFFCF7] shadow-sm'
            : 'border-[#E8E3DD] bg-white'
        }`}
      >
        {/* Top row */}
        <button
          className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
          onClick={() => setExpanded((p) => !p)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isLatest && (
              <span className="flex-shrink-0 text-[10px] font-semibold bg-[#C9A96E] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                Latest
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1C1C1C] truncate">
                {formatDate(record.created_at)}
              </p>
              <p className={`text-xs text-[#A0A0A0] mt-0.5 ${expanded ? 'line-clamp-8' : 'line-clamp-1'}`}>
                {record.description}
              </p>
            </div>
          </div>
          {/* Expand chevron */}
          <svg
            className={`w-4 h-4 text-[#A0A0A0] flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Quick chips (always visible) */}
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {aestheticKeywords.slice(0, 3).map((k: string) => (
            <Chip key={k} label={k} type="aesthetic" />
          ))}
          {colorPalette.slice(0, 2).map((c: string) => (
            <Chip key={c} label={c} type="color" />
          ))}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="px-5 pb-5 border-t border-[#F0EDE8] pt-4 grid sm:grid-cols-2 gap-4">
            {silhouettePrefs.length > 0 && (
              <div>
                <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2 font-medium">
                  Silhouettes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {silhouettePrefs.map((v: string) => <Chip key={v} label={v} type="silhouette" />)}
                </div>
              </div>
            )}
            
            {fabricTypes.length > 0 && (
              <div>
                <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2 font-medium">
                  Fabrics
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {fabricTypes.map((v: string) => <Chip key={v} label={v} type="fabric" />)}
                </div>
              </div>
            )}
            
            {occasionStyle && (
              <div>
                <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2 font-medium">
                  Occasion
                </p>
                <Chip label={occasionStyle} type="occasion" />
              </div>
            )}
            
            {colorPalette.length > 0 && (
              <div>
                <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2 font-medium">
                  Full Palette
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {colorPalette.map((v: string) => <Chip key={v} label={v} type="color" />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}