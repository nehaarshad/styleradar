export interface RetailerConfig {
  name: string
  baseUrl: string
  selectors: {
    productContainer: string
    image: string
    name: string
    price: string
    link: string
  }
}

export const RETAILERS: Record<string, RetailerConfig> = {
  limelight: {
    name: 'Limelight',
    baseUrl: 'https://www.limelight.pk',
    selectors: {
      productContainer: '.product-card, .product-item, .grid__item',
      image: 'img',
      name: '.product-card__title, .product-title, h3',
      price: '.price-item--regular, .price, .product-price',
      link: 'a',
    },
  },
  khaadi: {
    name: 'Khaadi',
    baseUrl: 'https://pk.khaadi.com',
    selectors: {
      productContainer: '.product-tile, .product, .tile',
      image: '.tile-image, img',
      name: '.product-name, .pdp-link-heading, .tile-title',
      price: '.price .value, .sales .value',
      link: 'a',
    },
  },
}

export type Retailer = keyof typeof RETAILERS