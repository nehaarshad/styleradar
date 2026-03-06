// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold text-indigo-600">StyleRadar</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Personal Style Mirror
          </h2>
          <p className="text-xl text-gray-600 mb-8">
          {`  Upload 5 outfits you love. We'll analyze your style and show you matching items from across the web.`}
          </p>
          
          <div className="bg-white p-8 rounded-2xl shadow-xl mb-12">
            <div className="grid grid-cols-5 gap-2 mb-6">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ))}
            </div>
            <Link
              href="/signup"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700"
            >
            {`  Get Started — It's Free`}
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="font-semibold mb-2">1. Upload 5 Outfits</h3>
              <p className="text-gray-600">From your camera roll</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold mb-2">2. AI Analyzes</h3>
              <p className="text-gray-600">We extract your unique style DNA</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="font-semibold mb-2">3. Shop Your Feed</h3>
              <p className="text-gray-600">Daily personalized outfit recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}