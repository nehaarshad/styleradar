
import Link from 'next/link'
import Image from 'next/image'
import { redirectIfAuthenticated } from '@/lib/utils/supabase/redirecctIfAuth'

const OUTFITS = [
  { img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80', match: '94%' },
  { img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80', match: '91%' },
  { img: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80', match: '89%' },
  { img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', match: '87%' },
  { img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80', match: '85%' },
  { img: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&q=80', match: '83%' },
  { img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80', match: '80%' },
  { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', match: '78%' },
  { img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80', match: '76%' },
  { img: 'https://images.unsplash.com/photo-1584670747417-594a9412fba5?w=400&q=80', match: '74%' },
  { img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', match: '71%' },
  { img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&q=80', match: '68%' },
]


export default async function LandingPage() {
   await redirectIfAuthenticated();
  
  return (
    <>
      <style>{`
        :root {
          --ink: #0F0E0C;
          --sand: #F5F0E8;
          --gold: #C9A96E;
          --muted: rgba(245,240,232,0.45);
          --serif: 'Cormorant Garamond', Georgia, serif;
        }
        
        .landing { 
          background: var(--ink); 
          color: var(--sand); 
          overflow-x: hidden; 
        }
        
        /* Hero */
        .landing .hero { 
          min-height: 100vh; 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          position: relative; 
          overflow: hidden; 
        }
        
        .landing .hero-left { 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          padding: 140px 64px 80px 80px; 
        }
        
        .landing .eyebrow-line { 
          width: 40px; 
          height: 1px; 
          background: var(--gold); 
          margin-bottom: 28px; 
        }
        
        .landing .hero-title { 
          font-family: var(--serif); 
          font-size: clamp(52px, 5.5vw, 80px); 
          line-height: 1; 
          color: var(--sand); 
        }
        
        .landing .hero-title em { 
          color: var(--gold); 
          font-style: italic; 
        }
        
        .landing .hero-sub { 
          font-size: 17px; 
          color: var(--muted); 
          max-width: 420px; 
          margin: 28px 0 48px; 
        }
        
        .landing .btn-primary { 
          background: var(--gold); 
          color: var(--ink); 
          padding: 14px 32px; 
          font-size: 13px; 
          font-weight: 600; 
          letter-spacing: 0.1em; 
          text-transform: uppercase; 
          text-decoration: none; 
          display: inline-block; 
        }
        
        .landing .hero-right { 
          position: relative; 
          overflow: hidden; 
        }
        
        .landing .hero-right::after { 
          content: ''; 
          position: absolute; 
          left: 0; 
          top: 0; 
          bottom: 0; 
          width: 80px; 
          background: linear-gradient(to right, var(--ink), transparent); 
          z-index: 2; 
        }
        
        .landing .hero-right::before { 
          content: ''; 
          position: absolute; 
          left: 0; 
          right: 0; 
          bottom: 0; 
          height: 120px; 
          background: linear-gradient(to top, var(--ink), transparent); 
          z-index: 2; 
        }
        
        .landing .product-grid { 
          position: absolute; 
          inset: 0; 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 6px; 
          padding: 6px; 
          transform: rotate(-4deg) scale(1.1) translateY(-4%); 
        }
        
        .landing .product-card { 
          background: #1E1C18; 
          border-radius: 3px; 
          overflow: hidden; 
          position: relative; 
          aspect-ratio: 1; 
        }
        
        .landing .product-card-overlay { 
          position: absolute; 
          inset: 0; 
          background: linear-gradient(to top, rgba(15,14,12,0.7), transparent); 
        }
        
        .landing .product-card-match { 
          position: absolute; 
          bottom: 8px; 
          left: 8px; 
          background: var(--gold); 
          color: var(--ink); 
          font-size: 9px; 
          font-weight: 700; 
          padding: 3px 7px; 
          z-index: 3; 
        }
        
        /* Responsive */
        @media (max-width: 900px) {
          .landing .hero { 
            grid-template-columns: 1fr; 
          }
          .landing .hero-left { 
            padding: 120px 24px 60px; 
          }
          .landing .hero-right { 
            height: 300px; 
          }
        }
      `}</style>

      <div className="landing">

        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">AI-Powered Fashion Discovery</span>
            </div>
            <h1 className="hero-title">
              Your taste.<br />
              <em>Everywhere.</em><br />
              Every morning.
            </h1>
            <p className="hero-sub">
              Upload 5 outfits you already love. Gemini AI reads your style DNA — then builds a live, shoppable feed from Pakistan best brands, tailored only to you.
            </p>
            <div className="hero-actions">
              <Link href="/upload" className="btn-primary">Start Your Feed</Link>
              
            </div>
          </div>

          <div className="hero-right">
            <div className="product-grid" id="heroGrid">
              {OUTFITS.map((o, i) => (
                <div key={i} className="product-card">
                  <Image src={o.img} alt="outfit" fill style={{ objectFit: 'cover', opacity: 0.8 }} unoptimized />
                  <div className="product-card-overlay" />
                  <div className="product-card-match">{o.match}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  )
}