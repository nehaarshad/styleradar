/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Product, StyleDNA, BrandWithCount,
  buildFeedState, getProductsForBrand,
} from './styleMatching'

export type FeedStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export interface UseFeedReturn {
  status: FeedStatus
  products: Product[]          
  allScoredProducts: Product[]  
  brands: BrandWithCount[]     
  activeBrand: string          
  styleDNA: StyleDNA | null     
  historyDNA: StyleDNA[]        
  userName: string              

  selectBrand: (brandName: string) => void         
  loadHistoryStyle: (dna: StyleDNA) => Promise<void> 
  refresh: () => Promise<void>                       
  logout: () => Promise<void>                       
  init: () => Promise<void>                        
}
const PAGE_SIZE = 1_000

export function useFeed(): UseFeedReturn {

  const [status, setStatus] = useState<FeedStatus>('idle')
  const [products, setProducts] = useState<Product[]>([])
  const [allScoredProducts, setAllScored] = useState<Product[]>([])
  const [brands, setBrands] = useState<BrandWithCount[]>([])
  const [activeBrand, setActiveBrand] = useState('all')
  const [styleDNA, setStyleDNA] = useState<StyleDNA | null>(null)
  const [historyDNA, setHistoryDNA] = useState<StyleDNA[]>([])
  const [userName, setUserName] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const fetchAllProducts = async (): Promise<Product[]> => {
    const supabase = createClient()
    let all: Product[] = []
    let page = 0

    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (error) throw error        
      if (!data || data.length === 0) break  

      all = [...all, ...data]
      page++
      if (data.length < PAGE_SIZE) break
    }

    return all
  }

  const saveFeedToDb = async (userId: string, scored: Product[]): Promise<void> => {
    const supabase = createClient()

    const rows = scored.map(p => ({
      user_id:    userId,
      product_id: p.id,
      score:      (p as any).score ?? null,
    }))

    // Upsert in a single round-trip.
    // `onConflict` must name the columns that form the unique constraint.
    // `ignoreDuplicates: true` means conflicting rows are skipped, not overwritten.
    const { error } = await supabase
      .from('user_feed')
      .upsert(rows, {
        onConflict:       'user_id,product_id',
        ignoreDuplicates: true,
      })

    if (error) {
      console.error('[useFeed] saveFeedToDb error:', error)
    }
  }

    const loadFeedFromDb = async (userId: string): Promise<Product[] | null> => {
    const supabase = createClient()
 
    const { data, error } = await supabase
      .from('user_feed')
      .select(`
        added_at,
        score,
        products (*)
      `)
      .eq('user_id', userId)
      // Newest additions at the top of the feed
      .order('added_at', { ascending: false })
 
    if (error) {
      console.error('[useFeed] loadFeedFromDb error:', error)
      return null
    }
 
    if (!data || data.length === 0) return null
 
    // Flatten the join: each row is { added_at, score, products: {...} }
    // We extract the nested product object and optionally re-attach the score.
    const result: Product[] = []
 
    for (const row of data) {
      const product = (row as any).products as Product | null
      if (!product) continue
 
      const hydrated: Product = {
        ...product,
        match_score: (row as any).score ?? undefined,
      }
      result.push(hydrated)
    }
 
    return result
  }

  const buildFeed = useCallback(async (dna: StyleDNA, userId: string) => {
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
      saveFeedToDb(userId, matched)

      setAllScored(matched)
      setBrands(brandList)
      setActiveBrand('all')
      setProducts(getProductsForBrand(matched, 'all'))
      setStatus('ready')

    } catch (err) {
      console.error('[useFeed] buildFeed failed:', err)
      setStatus('error')
    }
  }, []) 

  const init = useCallback(async () => {
    setStatus('loading')

    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setStatus('error')
        return
      }

      setCurrentUserId(user.id)
      setUserName(user.user_metadata?.username || user.email?.split('@')[0] || 'User')

      const { data: allDNA, error: dnaError } = await supabase
        .from('style_dna')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) 

      if (dnaError) throw dnaError

      if (!allDNA || allDNA.length === 0) {
        setStatus('empty')
        return
      }

      setStyleDNA(allDNA[0])  
      setHistoryDNA(allDNA)    

      const persistedFeed = await loadFeedFromDb(user.id)

      if (persistedFeed && persistedFeed.length > 0) {
        setAllScored(persistedFeed)
        setProducts(getProductsForBrand(persistedFeed, 'all'))

        const { brands: brandList } = buildFeedState(persistedFeed, allDNA[0])
        setBrands(brandList)
        setActiveBrand('all')
        setStatus('ready')
        buildFeed(allDNA[0], user.id)
        return
      }
      await buildFeed(allDNA[0], user.id)

    } catch (err) {
      console.error('[useFeed] init failed:', err)
      setStatus('error')
    }
  }, [buildFeed])


  const selectBrand = useCallback((brandName: string) => {
    setActiveBrand(brandName)
    setBrands(prev => prev.map(b => ({ ...b, active: b.name === brandName })))
    setProducts(getProductsForBrand(allScoredProducts, brandName))
  }, [allScoredProducts])

  const loadHistoryStyle = useCallback(async (dna: StyleDNA) => {
    setStyleDNA(dna)
    if (currentUserId) {
      await buildFeed(dna, currentUserId)
    }
  }, [buildFeed, currentUserId])

  const refresh = useCallback(async () => {
    if (styleDNA && currentUserId) {
      await buildFeed(styleDNA, currentUserId)
    }
  }, [styleDNA, currentUserId, buildFeed])
  const logout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }, [])

  return {
    status,
    products,
    allScoredProducts,
    brands,
    activeBrand,
    styleDNA,
    historyDNA,
    userName,
    selectBrand,
    loadHistoryStyle,
    refresh,
    logout,
    init,
  }
}