import { NextResponse } from 'next/server'
import { PlaywrightScraper } from '@/lib/scrapers/playwrightScraper'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  console.log('\n' + '='.repeat(60))
  console.log('🚀 STARTING PRODUCT SCRAPE')
  console.log('='.repeat(60) + '\n')
  
  const startTime = Date.now()
  let scraper: PlaywrightScraper | null = null
  
  try {
    scraper = new PlaywrightScraper()
    await scraper.initialize()
    
    const products = await scraper.scrapeAllProducts()
    
    const scrapeTime = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\n⏱️  Scraping completed in ${scrapeTime} seconds`)
    
    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 404 })
    }
    
    // Save to database
    console.log('\n💾 Saving to database...')
    const supabase = createAdminClient()
    
    // Clear old products
    await supabase.from('products').delete().neq('id', '')
    
    // Insert in batches
    const batchSize = 100
    let inserted = 0
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      const { error } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'id' })
      
      if (error) {
        console.error(`Batch ${i / batchSize + 1} failed:`, error.message)
      } else {
        inserted += batch.length
        console.log(`✅ Batch ${i / batchSize + 1}: Inserted ${batch.length} products`)
      }
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
    
    console.log(`\n🎉 SUCCESS!`)
    console.log(`   Products scraped: ${products.length}`)
    console.log(`   Products stored: ${inserted}`)
    console.log(`   Total time: ${totalTime} seconds`)
    
    return NextResponse.json({
      success: true,
      totalScraped: products.length,
      stored: inserted,
      timeSeconds: totalTime,
      retailers: {
        limelight: products.filter(p => p.retailer === 'Limelight').length,
        khaadi: products.filter(p => p.retailer === 'Khaadi').length,
      }
    })
    
  } catch (error) {
    console.error('❌ Scrape failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scrape failed' },
      { status: 500 }
    )
  } finally {
    if (scraper) {
      await scraper.close()
    }
    console.log('='.repeat(60) + '\n')
  }
}