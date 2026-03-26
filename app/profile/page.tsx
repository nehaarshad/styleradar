'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HistoryCard } from '../components/ui/historycard'
import { StyleDNAModel } from '@/model/userStyleDNA'
import { Chip } from '../components/ui/chips'
import { formatMonth } from '../components/ui/formats'
import CurrentDNACard from '../components/ui/dnaCard'

function EvolutionSummary({ history }: { history: StyleDNAModel[] }) {
  if (history.length < 2) return null

  const earliest = history[history.length - 1]
  const latest = history[0]

  // Handle both field name formats
  const earliestKW = new Set(earliest.aestheticKeywords ?? [])
  const latestKW = new Set(latest.aestheticKeywords ?? [])
  const gained = [...latestKW].filter((k) => !earliestKW.has(k))
  const dropped = [...earliestKW].filter((k) => !latestKW.has(k))

  return (
    <div className="rounded-2xl border border-[#E8E3DD] bg-white p-5 mb-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#A0A0A0] mb-4">
        Your Style Evolution
      </p>
      <div className="flex items-center gap-3 text-sm text-[#6B6B6B] mb-4">
        <span className="font-medium text-[#1C1C1C]">{formatMonth(earliest.created_at)}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#D1CBC3] via-[#C9A96E] to-[#1C1C1C]" />
        <span className="font-medium text-[#1C1C1C]">{formatMonth(latest.created_at)}</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {gained.length > 0 && (
          <div>
            <p className="text-xs text-[#10B981] font-semibold uppercase tracking-wide mb-2">
              ↑ New interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {gained.map((k) => <Chip key={k} label={k} type="aesthetic" />)}
            </div>
          </div>
        )}
        {dropped.length > 0 && (
          <div>
            <p className="text-xs text-[#F97316] font-semibold uppercase tracking-wide mb-2">
              ↓ Moved away from
            </p>
            <div className="flex flex-wrap gap-1.5">
              {dropped.map((k) => <Chip key={k} label={k} type="aesthetic" />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default function ProfilePage() {
  const router = useRouter()
  const [history, setHistory] = useState<StyleDNAModel[]>([]) 
  const [historyLoading, setHistoryLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')

        useEffect(() => {
          const fetchHistory = async () => {
            try {
              setHistoryLoading(true)
              const response = await fetch('/api/style_history',{
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              if (!response.ok) throw new Error('Failed to fetch')
              const data = await response.json()
            console.log('Fetched history:', data)
              setHistory(data)
            } catch (err) {
              console.error('History fetch error:', err)
            } finally {
              setHistoryLoading(false)
            }
          }
          
          fetchHistory()
        }, [])
  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* ── Nav ── */}
      <nav className="bg-white border-b border-[#ECEAE6] sticky top-0 z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center">
                
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl  font-bold text-[#1C1C1C]">
                      Style<span className="text-[#C9A96E]">Radar</span>
                    </h1>
                    <span className="hidden sm:block text-sm text-[#A0A0A0]">Your Daily Feed</span>
                  </div>
                  
                  </div>
                </div>
      
            </nav>
      

      <main className="max-w-4xl mx-auto  py-8">
        {/* ── Page title ── */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1C1C1C]">Your Style Profile</h2>
          <p className="text-sm text-[#A0A0A0] mt-1">
            {history.length > 0
              ? `${history.length} style ${history.length === 1 ? 'analysis' : 'analyses'} · tracked since ${formatMonth(history[history.length - 1]?.created_at)}`
              : 'Analyzed by Gemini AI'}
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 bg-[#F0EDE8] p-1 rounded-xl w-fit">
          {(['current', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-white text-[#1C1C1C] shadow-sm'
                  : 'text-[#6B6B6B] hover:text-[#1C1C1C]'
              }`}
            >
              {tab === 'history' && history.length > 0
                ? `History (${history.length})`
                : tab === 'history'
                ? 'History'
                : 'Current'}
            </button>
          ))}
        </div>

        {/* ── Current tab ── */}
        {activeTab === 'current' && (
          <>
            {history.length > 0 ? (
              <CurrentDNACard dna={history[0]} /> 
            ) : (
              <div className="rounded-2xl border border-[#E8E3DD] bg-white p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#F5F1EB] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <p className="text-[#6B6B6B] mb-4">{`You haven't analyzed your style yet`}</p>
                <button
                  onClick={() => router.push('/upload')}
                  className="bg-[#1C1C1C] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2E2E2E] transition"
                >
                  Analyze Your Style
                </button>
              </div>
            )}
          </>
        )}

        {/* ── History tab ── */}
        {activeTab === 'history' && (
          <>
            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-white border border-[#E8E3DD] animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-2xl border border-[#E8E3DD] bg-white p-12 text-center">
                <p className="text-[#A0A0A0] mb-4">No style history yet. Your analyses will appear here.</p>
                <button
                  onClick={() => router.push('/upload')}
                  className="bg-[#1C1C1C] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2E2E2E] transition"
                >
                  Start Your First Analysis
                </button>
              </div>
            ) : (
              <>
                <EvolutionSummary history={history} />
                <div className="relative">
                  {history.map((record, idx) => (
                    <HistoryCard
                      key={idx}
                      record={record}
                      index={idx}
                      total={history.length}
                      isLatest={idx === 0}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}