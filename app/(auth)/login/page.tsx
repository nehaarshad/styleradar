'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSession } from '@/lib/userStorage'


export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {

          const res = await fetch('/api/auth/login', {
              method: 'POST',
              body: JSON.stringify({ email: form.email, password: form.password }),
            })

          const data = await res.json()
          console.log("LOGIN RESPONSE DATA:", data)

          if (data.error) { 
            console.error(data.error)
            return
          }

          console.log("LOGIN DATA:", data)

          createSession(data.user.id, data.user.user_metadata?.username )

          router.push('/feed')
        
      } 
      else {
              const  data = await fetch('/api/auth/signup', {
                    method: 'POST',
                    body: JSON.stringify({ email: form.email, password: form.password ,username: form.username}),
                  })
                .then(res => res.json())
                .catch(err => {
                  console.error('Signup error:', err);
                  setError('Failed to create account. Please try again.');
                });
                  
                createSession(
                  data.user?.id,
                  data.user?.user_metadata?.username
                )

                
          router.push('/upload') 
        
      }

    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      {/* Left – branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1C1C1C] flex-col justify-between p-12 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#C9A96E] opacity-10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#8B5E3C] opacity-10 blur-3xl" />

        <div className="relative z-10">
          <h1 className="text-white text-3xl font-bold tracking-tight">
            Style<span className="text-[#C9A96E]">Radar</span>
          </h1>
        </div>

        <div className="relative z-10">
          <p className="text-5xl font-bold text-white leading-tight mb-6">
            Your taste.<br />
            <span className="text-[#C9A96E]">Everywhere.</span>
          </p>
          <p className="text-[#A0A0A0] text-lg max-w-md">
            Upload 5 outfits you already love. AI decodes your style DNA and
            builds a live, shoppable feed from Khaadi, Limelight, Satrangi — every morning.
          </p>
        </div>

        <div className="relative z-10 flex gap-6">
          {['Khaadi', 'Limelight', 'Satrangi'].map((brand) => (
            <span
              key={brand}
              className="text-[#C9A96E] text-sm font-medium border border-[#C9A96E]/30 px-3 py-1 rounded-full"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Right – form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <h1 className="text-2xl font-bold text-[#1C1C1C]">
              Style<span className="text-[#C9A96E]">Radar</span>
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-[#6B6B6B] mb-8 text-sm">
            {mode === 'login'
              ? 'Sign in to your personalised feed'
              : 'Start discovering fashion matched to your taste'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#4A4A4A] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={update('username')}
                  required
                  placeholder="fashionista_pk"
                  className="w-full border border-[#E0DDD8] rounded-lg px-4 py-3 text-sm text-[#1C1C1C] placeholder-[#B0ADA8] focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50 bg-white"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-[#4A4A4A] mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                required
                placeholder="you@example.com"
                className="w-full border border-[#E0DDD8] rounded-lg px-4 py-3 text-sm text-[#1C1C1C] placeholder-[#B0ADA8] focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4A4A4A] mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border border-[#E0DDD8] rounded-lg px-4 py-3 text-sm text-[#1C1C1C] placeholder-[#B0ADA8] focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50 bg-white"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1C1C1C] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#2E2E2E] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? mode === 'login'
                  ? 'Signing in…'
                  : 'Creating account…'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B6B6B]">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError('')
              }}
              className="text-[#C9A96E] font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}