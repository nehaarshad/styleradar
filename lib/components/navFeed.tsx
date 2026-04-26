'use client'

import { useState } from 'react'
import { StyleDNA } from '@/lib/matching/styleMatching'

// ─── DNA pill row ──────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  amber: 'bg-[#FEF3E2] text-[#B8894A]',
  pink:  'bg-[#FDE8F0] text-[#B05C7A]',
  teal:  'bg-[#E2F5F0] text-[#2D9B7A]',
  blue:  'bg-[#E8F0FE] text-[#3B6EC4]',
}

function DNARow({ label, items, color }: { label: string; items: string[]; color: string }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="text-xs text-[#BABABA] uppercase tracking-wider mb-1.5 font-medium">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className={`text-xs px-2.5 py-0.5 rounded-full ${COLOR_MAP[color] || COLOR_MAP.amber}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── User menu ─────────────────────────────────────────────────────────────────
function UserMenu({
  userName,
  onLogout,
  onReupload,
}: {
  userName: string
  onLogout: () => void
  onReupload: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#F5F3F0] transition"
      >
        <div className="w-6 h-6 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-[#C9A96E]">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-[#1C1C1C] hidden sm:inline">{userName}</span>
        <svg
          className={`w-3 h-3 text-[#BABABA] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#ECEAE6] z-40 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#ECEAE6]">
            <p className="text-xs text-[#6B6B6B]">Signed in as</p>
            <p className="text-sm font-medium text-[#1C1C1C] truncate">{userName}</p>
          </div>
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); onReupload() }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#1C1C1C] hover:bg-[#FAF8F5] transition text-left"
            >
              <svg className="w-4 h-4 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Re-upload Outfits
            </button>
            <button
              onClick={() => { setOpen(false); onLogout() }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition text-left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Nav ──────────────────────────────────────────────────────────────────
export interface FeedNavProps {
  userName: string
  styleDNA: StyleDNA | null
  onHistory: ()=> void
  onRefresh: () => void
  onLogout: () => void
  onReupload: () => void
  onLoadHistory: (dna: StyleDNA) => void
  formatDate: (d: string) => string
  currentDNAId?: string
}

export function FeedNav({
  userName, styleDNA, onHistory,
  onRefresh, onLogout, onReupload, onLoadHistory,
  formatDate, currentDNAId,
}: FeedNavProps) {
  const [showDNA, setShowDNA]         = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const toggleDNA = () => { setShowDNA(v => !v); setShowHistory(false) }
  const toggleHistory = () => { setShowHistory(v => !v); setShowDNA(false) }

  return (
    <nav className="bg-white border-b border-[#ECEAE6] px-6 py-4 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <h1 className="text-xl font-bold text-[#1C1C1C] tracking-tight">
          Style<span className="text-[#C9A96E]">Radar</span>
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-1">

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6B6B6B] hover:text-[#1C1C1C] hover:bg-[#F5F3F0] rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Style DNA */}
          {styleDNA && (
            <div className="relative">
              <button
                onClick={toggleDNA}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition ${
                  showDNA
                    ? 'bg-[#C9A96E]/10 text-[#C9A96E]'
                    : 'text-[#6B6B6B] hover:text-[#1C1C1C] hover:bg-[#F5F3F0]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="hidden sm:inline">Style DNA</span>
              </button>

              {showDNA && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#ECEAE6] z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#ECEAE6] flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1C1C1C]">Your Style DNA</h3>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{formatDate(styleDNA.created_at)}</p>
                    </div>
                    <button title='btn' onClick={() => setShowDNA(false)} className="text-[#BABABA] hover:text-[#6B6B6B]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="px-4 py-3 space-y-3 max-h-80 overflow-y-auto">
                    {styleDNA.description && (
                      <p className="text-xs text-[#6B6B6B] leading-relaxed italic">
                        &ldquo;{styleDNA.description}&rdquo;
                      </p>
                    )}
                    <DNARow label="Aesthetic"  items={styleDNA.aesthetic_keywords} color="amber" />
                    <DNARow label="Colors"     items={styleDNA.color_palette}      color="pink"  />
                    <DNARow label="Fabrics"    items={styleDNA.fabric_types}        color="teal"  />
                    <DNARow label="Silhouette" items={styleDNA.silhouette_prefs}    color="blue"  />
                    {styleDNA.occasion_style && (
                      <div>
                        <p className="text-xs text-[#BABABA] uppercase tracking-wider mb-1.5 font-medium">Occasion</p>
                        <span className="text-xs bg-[#F0EDE8] text-[#6B6B6B] px-2.5 py-1 rounded-full">
                          {styleDNA.occasion_style}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-[#ECEAE6]">
                    <button
                      onClick={() => { setShowDNA(false); onReupload() }}
                      className="w-full text-center text-xs text-[#C9A96E] hover:text-[#B8894A] font-medium transition"
                    >
                      Re-analyse with new photos →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History */}
          
            <div className="relative">
              <button
                onClick={onHistory}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition ${
                  showHistory
                    ? 'bg-[#C9A96E]/10 text-[#C9A96E]'
                    : 'text-[#6B6B6B] hover:text-[#1C1C1C] hover:bg-[#F5F3F0]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">History</span>
              </button>

            </div>
          

          <div className="w-px h-5 bg-[#ECEAE6] mx-1" />
          <UserMenu userName={userName} onLogout={onLogout} onReupload={onReupload} />
        </div>
      </div>
    </nav>
  )
}