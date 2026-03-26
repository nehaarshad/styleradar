import { RetailerConfig } from "@/model/retailers"
 

export const RETAILERS: Record<string, RetailerConfig> = {
  limelight: {
    name: 'Limelight',
    baseUrl: 'https://www.limelight.pk',
    searchUrl: (query: string) =>
      `https://www.limelight.pk/search?type=product&q=${encodeURIComponent(query)}`,
    jsonSearchUrl: (query: string) =>
      `https://www.limelight.pk/search?type=product&q=${encodeURIComponent(query)}&view=json`,
    selectors: {
      productContainer: '.product-card-wrapper, .card-wrapper, li.grid__item',
      image: '.card__media img, .product-card img, img[srcset], img',
      name: '.card__heading a, .card__heading, .full-unstyled-link, h3 a, h3',
      price: '.price-item--regular, .price__regular, .price .money, .price',
      link: 'a.card__heading, a.full-unstyled-link, .card__media a, a',
    },
    waitFor: 5000,
    waitUntil: 'domcontentloaded',
  },
  khaadi: {
    name: 'Khaadi',
    baseUrl: 'https://pk.khaadi.com',
    searchUrl: (query: string) =>
      `https://pk.khaadi.com/search?q=${encodeURIComponent(query)}`,
    jsonSearchUrl: (query: string) =>
      `https://pk.khaadi.com/search?q=${encodeURIComponent(query)}`,
    selectors: {
      // Updated selectors based on actual Khaadi HTML structure
      productContainer: '.product, .product-tile, .tile',  // From HTML: class="product" and class="product-tile"
      image: '.tile-image, img[src*="images/hi-res"], .image-container img',
      name: '.pdp-link-heading, .product-brand .text-truncate, h2.pdp-link-heading',
      price: '.price .value, .sales .value, .cc-price',
      link: 'a.plpRedirectPdp',
    },
    waitFor: 8000,
    waitUntil: 'networkidle',
    // Add delay to let dynamic content load
    delayBeforeScrape: 2000,
  },
  // satrangi: {
  //   name: 'Satrangi',
  //   baseUrl: 'https://www.satrangi.com',
  //   searchUrl: (query: string) =>
  //     `https://www.satrangi.com/search?type=product&q=${encodeURIComponent(query)}`,
  //   jsonSearchUrl: (query: string) =>
  //     `https://www.satrangi.com/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=24&resources[options][unavailable_products]=last`,
  //   selectors: {
  //     productContainer: '.product-card-wrapper, .card-wrapper, li.grid__item, .product-item',
  //     image: '.card__media img, img[srcset], img',
  //     name: '.card__heading a, .card__heading, h3 a, h3, h2',
  //     price: '.price-item--regular, .price__regular, .price .money, .price',
  //     link: 'a.card__heading, a.full-unstyled-link, .card__media a, a',
  //   },
  //   waitFor: 5000,
  //   waitUntil: 'domcontentloaded',
  //   // Handle SSL issues by ignoring certificate errors
  //   ignoreHTTPSErrors: true,
  // },
}

export type Retailer = keyof typeof RETAILERS