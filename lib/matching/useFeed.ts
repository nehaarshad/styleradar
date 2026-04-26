import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Product, StyleDNA, BrandWithCount,
  buildFeedState, getProductsForBrand,
} from './styleMatching'

export type FeedStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export interface UseFeedReturn {
  // State
  status: FeedStatus
  products: Product[]           // currently visible (filtered by active brand)
  allScoredProducts: Product[]  // all matching products sorted by score
  brands: BrandWithCount[]
  activeBrand: string
  styleDNA: StyleDNA | null
  historyDNA: StyleDNA[]
  userName: string

  // Actions
  selectBrand: (brandName: string) => void
  loadHistoryStyle: (dna: StyleDNA) => Promise<void>
  refresh: () => Promise<void>
  logout: () => Promise<void>
  init: () => Promise<void>
}

export function useFeed(): UseFeedReturn {
  const [status, setStatus]                   = useState<FeedStatus>('idle')
  const [products, setProducts]               = useState<Product[]>([])
  const [allScoredProducts, setAllScored]     = useState<Product[]>([])
  const [brands, setBrands]                   = useState<BrandWithCount[]>([])
  const [activeBrand, setActiveBrand]         = useState('all')
  const [styleDNA, setStyleDNA]               = useState<StyleDNA | null>(null)
  const [historyDNA, setHistoryDNA]           = useState<StyleDNA[]>([])
  const [userName, setUserName]               = useState('')
  const [currentUserId, setCurrentUserId]     = useState<string | null>(null)

  // ── Fetch all products from DB (paginated) ──────────────────────────────────
  const fetchAllProducts = async (): Promise<Product[]> => {
    const supabase = createClient()
    let all: Product[] = []
    let page = 0
    const PAGE_SIZE = 1000

    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (error) throw error
      if (!data || data.length === 0) break

      all = [...all, ...data]
      page++

      // Safety: stop if we've clearly got everything
      if (data.length < PAGE_SIZE) break
    }

    return all
  }

  // ── Score + build feed from DNA ─────────────────────────────────────────────
  const buildFeed = useCallback(async (dna: StyleDNA) => {
    setStatus('loading')
    try {
      const rawProducts = await fetchAllProducts()

      if (rawProducts.length === 0) {
        setStatus('empty')
        setProducts([])
        setAllScored([])
        return
      }

      const { allScoredProducts: matched, brands: brandList } = buildFeedState(rawProducts, dna)

      if (matched.length === 0) {
        setStatus('empty')
        setProducts([])
        setAllScored([])
        setBrands([])
        return
      }

      setAllScored(matched)
      setBrands(brandList)
      setActiveBrand('all')
      setProducts(getProductsForBrand(matched, 'all'))
      setStatus('ready')
    } catch (err) {
      console.error('Feed build failed:', err)
      setStatus('error')
    }
  }, [])

  // ── Init: auth check → load DNA → build feed ────────────────────────────────
  const init = useCallback(async () => {
    setStatus('loading')
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) { setStatus('error'); return }

      setCurrentUserId(user.id)
      setUserName(user.user_metadata?.username || user.email?.split('@')[0] || 'User')

      const { data: allDNA, error: dnaError } = await supabase
        .from('style_dna')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (dnaError) throw dnaError
      if (!allDNA || allDNA.length === 0) { setStatus('empty'); return }

      setStyleDNA(allDNA[0])
      setHistoryDNA(allDNA)
      await buildFeed(allDNA[0])
    } catch (err) {
      console.error('Init failed:', err)
      setStatus('error')
    }
  }, [buildFeed])

  // ── Brand filter (no re-fetch, just slice from allScoredProducts) ───────────
  const selectBrand = useCallback((brandName: string) => {
    setActiveBrand(brandName)
    setBrands(prev => prev.map(b => ({ ...b, active: b.name === brandName })))
    setProducts(getProductsForBrand(allScoredProducts, brandName))
  }, [allScoredProducts])

  // ── Load a historical DNA ────────────────────────────────────────────────────
  const loadHistoryStyle = useCallback(async (dna: StyleDNA) => {
    setStyleDNA(dna)
    await buildFeed(dna)
  }, [buildFeed])

  // ── Refresh current DNA ──────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (styleDNA) await buildFeed(styleDNA)
  }, [styleDNA, buildFeed])

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }, [])

  return {
    status, products, allScoredProducts, brands,
    activeBrand, styleDNA, historyDNA, userName,
    selectBrand, loadHistoryStyle, refresh, logout, init,
  }
}