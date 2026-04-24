# Quick scrape (testing)
curl "http://localhost:3000/api/scrape?strategy=quick"

# Balanced scrape (daily)
curl "http://localhost:3000/api/scrape?strategy=balanced"

# Complete scrape (nightly)
curl "http://localhost:3000/api/scrape?strategy=complete"