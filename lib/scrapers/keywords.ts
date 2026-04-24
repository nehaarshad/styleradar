// ============================================
// UNIVERSAL KEYWORD STRATEGY
// Works for Limelight, Khaadi, and Pakistani fashion retailers
// ============================================

export const UNIVERSAL_KEYWORDS = {
  // FABRICS (Priority 1 - Most products)
  fabrics: [
    'lawn', 'cotton', 'silk', 'linen', 'chiffon', 'velvet', 
    'khaddar', 'jersey', 'organza', 'net', 'denim', 'wool',
    'polyester', 'viscose', 'satin', 'crepe', 'lace'
  ],
  
  // CATEGORIES (Priority 2 - Broad coverage)
  categories: [
    'pret', 'formal', 'casual', 'unstitched', 'stitched',
    'ready to wear', 'semi formal', 'luxury pret', 'bridal',
    'party wear', 'wedding', 'eid collection', 'festive',
    'winter collection', 'summer collection', 'lawn collection'
  ],
  
  // PRODUCT TYPES (Priority 3 - Specific items)
  products: [
    'kurta', 'shirt', 'dress', 'trouser', 'pants', 'jeans',
    't-shirt', 'top', 'blouse', 'tunic', 'cape', 'jacket',
    'coat', 'waistcoat', 'shalwar', 'saree', 'dupatta',
    'scarf', 'shawl', 'cardigan', 'sweater', 'hoodie',
    'blazer', 'skirt', 'palazzo', 'lehenga', 'gown'
  ],
  
  // DESIGNS (Priority 4 - Style variations)
  designs: [
    'embroidered', 'printed', 'solid', 'striped', 'checked',
    'floral', 'digital printed', 'block printed', 'tie dye',
    'ombre', 'plaid', 'woven', 'textured', 'sequined',
    'beaded', 'lace trimmed', 'fringed', 'hand embroidered'
  ],
  
  // OCCASIONS (Priority 5 - Usage-based)
  occasions: [
    'daily wear', 'office wear', 'evening', 'party', 
    'formal event', 'casual wear', 'resort wear', 'beach wear',
    'vacation wear', 'work wear', 'business casual'
  ],
  
  // GENDER & AGE (Priority 6 - Demographic)
  demographic: [
    'women', 'men', 'kids', 'girls', 'boys', 'infants',
    'unisex', 'teen', 'adult'
  ],
  
  // COLORS (Priority 7 - For broad search)
  colors: [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 
    'pink', 'purple', 'brown', 'grey', 'navy', 'maroon',
    'beige', 'cream', 'ivory', 'gold', 'silver'
  ]
}

// ============================================
// STRATEGY 1: QUICK SCRAPE (2-3 minutes)
// Best for: Frequent updates, limited time
// ============================================
export const QUICK_KEYWORDS = [
  // Top 10 most effective keywords
  'lawn', 'pret', 'formal', 'casual', 'unstitched',
  'kurta', 'dress', 'embroidered', 'winter', 'summer'
]

// ============================================
// STRATEGY 2: BALANCED SCRAPE (5-7 minutes)
// Best for: Daily updates, good coverage
// ============================================
export const BALANCED_KEYWORDS = [
  // Fabrics (priority)
  'lawn', 'cotton', 'silk', 'linen', 'chiffon', 'velvet',
  
  // Categories (priority)
  'pret', 'formal', 'casual', 'unstitched', 'stitched',
  'ready to wear', 'luxury pret', 'bridal',
  
  // Products (priority)
  'kurta', 'shirt', 'dress', 'trouser', 'saree', 'dupatta',
  'cape', 'jacket', 'blouse', 'palazzo',
  
  // Designs (priority)
  'embroidered', 'printed', 'floral', 'solid',
  
  // Occasions
  'party wear', 'wedding', 'eid collection', 'festive',
  'winter collection', 'summer collection',
  
  // Demographics
  'women', 'men', 'kids'
]

// ============================================
// STRATEGY 3: COMPLETE SCRAPE (10-15 minutes)
// Best for: Nightly full catalog updates
// ============================================
export const COMPLETE_KEYWORDS = [
  ...UNIVERSAL_KEYWORDS.fabrics,
  ...UNIVERSAL_KEYWORDS.categories,
  ...UNIVERSAL_KEYWORDS.products,
  ...UNIVERSAL_KEYWORDS.designs,
  ...UNIVERSAL_KEYWORDS.occasions,
  ...UNIVERSAL_KEYWORDS.demographic,
  ...UNIVERSAL_KEYWORDS.colors
].filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates

// ============================================
// STRATEGY 4: RETAILER-SPECIFIC OPTIMIZED
// For maximum coverage per retailer
// ============================================
export const RETAILER_SPECIFIC = {
  limelight: [
    // Limelight specializes in lawn, pret, formal
    'lawn', 'pret', 'formal', 'casual', 'unstitched',
    'embroidered', 'printed', 'solid', 'kurta', 'dress',
    'winter collection', 'summer collection', 'eid collection'
  ],
  
  khaadi: [
    // Khaadi is known for lawn, unstitched, khaddar
    'lawn', 'khaddar', 'cotton', 'unstitched', 'stitched',
    'pret', 'formal', 'casual', 'kurta', 'shirt', 'dupatta',
    'winter collection', 'summer collection', 'festive collection'
  ],
  
  satrangi: [
    // Satrangi (if added) - lawn, formal, embroidered
    'lawn', 'formal', 'embroidered', 'ready to wear',
    'bridal', 'party wear', 'kurta', 'dress'
  ]
}