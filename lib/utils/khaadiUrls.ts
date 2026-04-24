const KHAADI_CATEGORIES = {
  // WOMEN'S WEAR
  women: [
    'https://pk.khaadi.com/pret',           // Ready-to-wear
    'https://pk.khaadi.com/lawn',           // Lawn collection
    'https://pk.khaadi.com/formal',         // Formal wear
    'https://pk.khaadi.com/casual',         // Casual wear
    'https://pk.khaadi.com/winterwear',     // Winter collection
    'https://pk.khaadi.com/summer',         // Summer collection
    'https://pk.khaadi.com/festive',        // Festive collection
    'https://pk.khaadi.com/luxury-pret',    // Luxury pret
    'https://pk.khaadi.com/eid-collection', // Eid collection
    'https://pk.khaadi.com/bridal',         // Bridal collection
  ],
  
  // FABRICS (Unstitched)
  fabrics: [
    'https://pk.khaadi.com/fabrics',                    // All fabrics
    'https://pk.khaadi.com/fabrics/lawn',               // Lawn fabric
    'https://pk.khaadi.com/fabrics/cotton',             // Cotton fabric
    'https://pk.khaadi.com/fabrics/khaddar',            // Khaddar fabric
    'https://pk.khaadi.com/fabrics/silk',               // Silk fabric
    'https://pk.khaadi.com/unstitched',                 // Unstitched collection
  ],
  
  // MEN'S WEAR
  men: [
    'https://pk.khaadi.com/men',
    'https://pk.khaadi.com/men/casual',
    'https://pk.khaadi.com/men/formal',
    'https://pk.khaadi.com/men/kurta',
    'https://pk.khaadi.com/men/shirts',
  ],
  
  // KIDS
  kids: [
    'https://pk.khaadi.com/kids',
    'https://pk.khaadi.com/kids/girls',
    'https://pk.khaadi.com/kids/boys',
    'https://pk.khaadi.com/kids/infants',
  ],
  
  // HOME & LIFESTYLE
  home: [
    'https://pk.khaadi.com/home',           // Home decor
    'https://pk.khaadi.com/bedding',        // Bed sheets, duvets
    'https://pk.khaadi.com/cushions',       // Cushion covers
    'https://pk.khaadi.com/tableware',      // Table linens
    'https://pk.khaadi.com/furniture',      // Ottomans, sofas, benches
  ],
  
  // ACCESSORIES
  accessories: [
    'https://pk.khaadi.com/bags',
    'https://pk.khaadi.com/shoes',
    'https://pk.khaadi.com/jewelry',
    'https://pk.khaadi.com/wallets',
    'https://pk.khaadi.com/fragrances',
  ],
  
  // SALE
  sale: [
    'https://pk.khaadi.com/sale',
    'https://pk.khaadi.com/sale/women',
    'https://pk.khaadi.com/sale/men',
    'https://pk.khaadi.com/sale/kids',
    'https://pk.khaadi.com/sale/fabrics',   // From search results [citation:9]
  ],
  
  // SPECIAL COLLECTIONS
  special: [
    'https://pk.khaadi.com/khaadi-khaas',   // Luxury festive line [citation:5]
    'https://pk.khaadi.com/signature',      // Signature collection [citation:1]
    'https://pk.khaadi.com/essentials',     // Essentials collection [citation:1]
    'https://pk.khaadi.com/smart-casuals',  // Smart casuals [citation:1]
    'https://pk.khaadi.com/instakhaadi',    // Instagram featured [citation:1]
    'https://pk.khaadi.com/ajrak',          // Reviving Ajrak collection [citation:1]
    'https://pk.khaadi.com/rsvp',           // RSVP collection [citation:1]
    'https://pk.khaadi.com/festive-silks',  // Festive Silks [citation:1]
    'https://pk.khaadi.com/the-print-story',// The Print Story [citation:1]
    'https://pk.khaadi.com/winter-glow',    // Winter Glow [citation:1]
  ],
}

// Flatten all categories
const ALL_KHAADI_CATEGORIES = [
  ...KHAADI_CATEGORIES.women,
  ...KHAADI_CATEGORIES.fabrics,
  ...KHAADI_CATEGORIES.men,
  ...KHAADI_CATEGORIES.kids,
  ...KHAADI_CATEGORIES.home,
  ...KHAADI_CATEGORIES.accessories,
  ...KHAADI_CATEGORIES.sale,
  ...KHAADI_CATEGORIES.special,
]