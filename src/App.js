import React, { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'
import { ToastProvider, useToast } from './Toast'
import SplashScreen from './SplashScreen'
import PageTransition from './PageTransition'
import { HomeScreenSkeleton } from './Skeleton'
import { LogoIcon } from './Logo'
import Home from './screens/Home'
import CheckIn from './screens/CheckIn'
import RecoveryLogger from './screens/RecoveryLogger'
import PerformanceLog from './screens/PerformanceLog'
import Insights from './screens/Insights'
import Profile from './screens/Profile'
import Journal from './screens/Journal'
import Experiments from './screens/Experiments'
import Nutrition from './screens/Nutrition'
import NotificationSetup from './screens/NotificationSetup'
import { registerServiceWorker } from './notifications'

const navItems = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'checkin', label: 'Check-In', icon: '📋' },
  { key: 'nutrition', label: 'Nutrition', icon: '🍎' },
  { key: 'experiments', label: 'Lab', icon: '🔬' },
  { key: 'insights', label: 'Insights', icon: '🧠' },
  { key: 'profile', label: 'Profile', icon: '👤' },
]

function Auth() {
  const toast = useToast()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://recovery-log-gamma.vercel.app/',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    if (error) toast(error.message, 'error')
  } catch (err) {
    toast(err.message, 'error')
  }
}

  const inputStyle = {
    width: '100%', backgroundColor: '#111820', border: '1px solid #1e2a3a',
    borderRadius: '12px', padding: '14px 14px 14px 44px',
    color: 'white', fontSize: '15px', outline: 'none', marginBottom: '12px',
  }

  const handleLogin = async () => {
    if (!email || !password) return toast('Please fill in all fields', 'warning')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) toast(error.message, 'error')
    else toast('Welcome back!', 'success')
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!email || !password || !username) return toast('Please fill in all fields', 'warning')
    if (password.length < 6) return toast('Password must be at least 6 characters', 'warning')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
    if (error) toast(error.message, 'error')
    else { toast('Account created! Log in to get started.', 'success'); setMode('login') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#080d13' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
            <LogoIcon size={80} borderRadius={22} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f0f6ff', marginBottom: '6px' }}>RecoveryLog</h1>
          <p style={{ color: '#4a6080', fontSize: '14px' }}>What actually improves YOUR performance.</p>
        </div>

        <div style={{ display: 'flex', backgroundColor: '#111820', borderRadius: '12px', padding: '4px', marginBottom: '24px', border: '1px solid #1e2a3a' }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', backgroundColor: mode === m ? '#0ea5e9' : 'transparent', color: mode === m ? 'white' : '#4a6080', transition: 'all 0.2s' }}>
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {mode === 'signup' && (
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '15px', fontSize: '18px', zIndex: 1 }}>👤</span>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '15px', fontSize: '18px', zIndex: 1 }}>✉️</span>
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '15px', fontSize: '18px', zIndex: 1 }}>🔒</span>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />
        </div>

        <button onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: '20px', boxShadow: '0 4px 20px #0ea5e930' }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In →' : 'Create Account →'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#1e2a3a' }} />
          <span style={{ color: '#2a3a4a', fontSize: '12px' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#1e2a3a' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ backgroundColor: '#111820', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
            <span style={{ fontSize: '16px' }}>🍎</span>
            <span style={{ color: '#8aa0b8', fontSize: '14px', fontWeight: '600' }}>Apple</span>
          </div>
          <button
            onClick={handleGoogleLogin}
            style={{ backgroundColor: '#111820', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span style={{ color: '#8aa0b8', fontSize: '14px', fontWeight: '600' }}>Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function MainApp({ user }) {
  const toast = useToast()
  const [page, setPage] = useState('home')
  const [appIntelligence, setAppIntelligence] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast('Signed out successfully', 'info')
  }

  const navigate = (p) => setPage(p)

  if (initialLoading) {
    return (
      <div className="app">
        <HomeScreenSkeleton />
        <nav className="bottom-nav">
          {navItems.map(item => (
            <div key={item.key} className="nav-item">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
    )
  }

  return (
    <div className="app">
      <PageTransition pageKey={page}>
        {page === 'home' && <Home user={user} onNavigate={navigate} onIntelligenceLoad={setAppIntelligence} />}
        {page === 'checkin' && <CheckIn user={user} onDone={() => { navigate('home'); toast('Check-in saved!', 'success') }} />}
        {page === 'recovery' && <RecoveryLogger user={user} onDone={() => { navigate('home'); toast('Recovery logged!', 'success') }} priorities={appIntelligence?.recoveryPriorities} />}
        {page === 'performance' && <PerformanceLog user={user} onDone={() => { navigate('home'); toast('Performance logged!', 'success') }} />}
        {page === 'insights' && <Insights user={user} />}
        {page === 'profile' && <Profile user={user} onSignOut={handleSignOut} />}
        {page === 'journal' && <Journal user={user} />}
        {page === 'experiments' && <Experiments user={user} />}
        {page === 'nutrition' && <Nutrition user={user} />}
      </PageTransition>

      <nav className="bottom-nav">
        {navItems.map(item => (
          <div key={item.key} className={`nav-item ${page === item.key ? 'active' : ''}`} onClick={() => navigate(item.key)}>
            <span className="nav-icon" style={{ transform: page === item.key ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s' }}>{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  )
}

function AppContent() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [showNotificationSetup, setShowNotificationSetup] = useState(false)

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href).catch(() => {})

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    registerServiceWorker()
    const hasSeenNotifSetup = localStorage.getItem('notif_setup_seen')
    if (!hasSeenNotifSetup && user) {
      setTimeout(() => setShowNotificationSetup(true), 2000)
    }
  }, [user]) // eslint-disable-line

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080d13' }}>
      <div style={{ fontSize: '48px' }}>⚡</div>
    </div>
  )

  if (!user) return <Auth />

  return (
    <>
      {showNotificationSetup && (
        <NotificationSetup onDone={() => {
          setShowNotificationSetup(false)
          localStorage.setItem('notif_setup_seen', 'true')
        }} />
      )}
      <MainApp user={user} />
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
