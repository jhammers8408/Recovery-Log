import React, { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'
import { ToastProvider, useToast } from './Toast'
import SplashScreen from './SplashScreen'
import PageTransition from './PageTransition'
import { HomeScreenSkeleton } from './Skeleton'
import { LogoIcon } from './Logo'
import Onboarding from './Onboarding'
import Home from './screens/Home'
import CheckIn from './screens/CheckIn'
import RecoveryLogger from './screens/RecoveryLogger'
import PerformanceLog from './screens/PerformanceLog'
import Insights from './screens/Insights'
import Profile from './screens/Profile'
import Journal from './screens/Journal'
import Experiments from './screens/Experiments'
import Nutrition from './screens/Nutrition'
import Shop from './screens/Shop'
import PrivacyPolicy from './screens/PrivacyPolicy'
import TermsOfService from './screens/TermsOfService'
import NotificationSetup from './screens/NotificationSetup'
import { registerServiceWorker } from './notifications'
import { Home as HomeIcon, ClipboardList, Apple, FlaskConical, ShoppingBag, User, Brain } from 'lucide-react'

const navItems = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'checkin', label: 'Check-In', icon: ClipboardList },
  { key: 'nutrition', label: 'Nutrition', icon: Apple },
  { key: 'experiments', label: 'Lab', icon: FlaskConical },
  { key: 'insights', label: 'Insights', icon: Brain },
  { key: 'shop', label: 'Shop', icon: ShoppingBag },
  { key: 'profile', label: 'Profile', icon: User },
]

const openBrowser = async (url) => {
  try {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url })
  } catch {
    window.open(url, '_blank')
  }
}

const closeBrowser = async () => {
  try {
    const { Browser } = await import('@capacitor/browser')
    await Browser.close()
  } catch {}
}

function Auth() {
  const toast = useToast()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'recoverylog://login',
          skipBrowserRedirect: true,
        }
      })
      if (error) { toast(error.message, 'error'); return }
      await openBrowser(data.url)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleAppleLogin = async () => {
  console.log('handleAppleLogin called')
  try {
    console.log('trying apple sign in')
    const { SignInWithApple } = await import('@capacitor-community/apple-sign-in')
    
    const result = await SignInWithApple.authorize({
      clientId: 'com.jacobhammers.recoverylog',
      redirectURI: 'https://agwzcqqalhpdedbjkfgw.supabase.co/auth/v1/callback',
      scopes: 'email name',
      state: '12345',
      nonce: 'nonce',
    })

    console.log('Apple result:', JSON.stringify(result))
    const { identityToken } = result.response

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: identityToken,
    })
    if (error) toast(error.message, 'error')
  } catch (err) {
    console.log('Apple error:', err.message)
    if (!err.message?.includes('1001')) {
      toast('Apple Sign In failed. Please try again.', 'error')
    }
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button onClick={handleAppleLogin} style={{ width: '100%', backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>Continue with Apple</span>
          </button>

          <button onClick={handleGoogleLogin} style={{ width: '100%', backgroundColor: '#111820', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span style={{ color: '#8aa0b8', fontSize: '14px', fontWeight: '600' }}>Continue with Google</span>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <span onClick={() => window.open('https://recovery-log-gamma.vercel.app', '_blank')} style={{ color: '#4a6080', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>
          <span onClick={() => window.open('https://recovery-log-gamma.vercel.app', '_blank')} style={{ color: '#4a6080', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
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
              <item.icon size={20} style={{ color: '#555' }} />
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
        {page === 'profile' && <Profile user={user} onSignOut={handleSignOut} onNavigate={setPage} />}
        {page === 'journal' && <Journal user={user} />}
        {page === 'experiments' && <Experiments user={user} />}
        {page === 'nutrition' && <Nutrition user={user} />}
        {page === 'shop' && <Shop user={user} recommendedActions={appIntelligence?.recoveryPriorities} />}
        {page === 'privacy' && <PrivacyPolicy onBack={() => setPage('profile')} />}
        {page === 'terms' && <TermsOfService onBack={() => setPage('profile')} />}
      </PageTransition>

      <nav className="bottom-nav">
        {navItems.map(item => (
          <div key={item.key} className={`nav-item ${page === item.key ? 'active' : ''}`} onClick={() => navigate(item.key)}>
            <item.icon size={20} style={{ color: page === item.key ? '#0ea5e9' : '#555', transform: page === item.key ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s' }} />
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
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showNotificationSetup, setShowNotificationSetup] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('onboarding_seen')
    if (!seen) setShowOnboarding(true)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    registerServiceWorker()
    const hasSeenNotifSetup = localStorage.getItem('notif_setup_seen')
    if (!hasSeenNotifSetup && user) {
      setTimeout(() => setShowNotificationSetup(true), 2000)
    }

    const setupDeepLink = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app')
        CapApp.addListener('appUrlOpen', async ({ url }) => {
          await closeBrowser()
          const hashPart = url.split('#')[1] || url.split('?')[1] || ''
          const params = new URLSearchParams(hashPart)
          const accessToken = params.get('access_token')
          const refreshToken = params.get('refresh_token')
          if (accessToken && refreshToken) {
            const { data } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
            if (data?.session) setUser(data.session.user)
          } else {
            const { data } = await supabase.auth.getSession()
            if (data?.session) setUser(data.session.user)
          }
        })
      } catch (err) {
        console.log('Deep link not available:', err)
      }
    }
    setupDeepLink()
  }, [user]) // eslint-disable-line

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />

  if (showOnboarding) return <Onboarding onDone={() => {
    localStorage.setItem('onboarding_seen', 'true')
    setShowOnboarding(false)
  }} />

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
