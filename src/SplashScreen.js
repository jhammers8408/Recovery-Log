import React, { useEffect, useState } from 'react'
import { LogoIcon } from './Logo'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('logo')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 800)
    const t2 = setTimeout(() => setPhase('fade'), 1800)
    const t3 = setTimeout(() => onDone(), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#080d13',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 99999,
      opacity: phase === 'fade' ? 0 : 1,
      transition: 'opacity 0.6s ease',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '20px',
        transform: phase === 'logo' ? 'scale(0.8)' : 'scale(1)',
        opacity: phase === 'logo' ? 0 : 1,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{
          width: '88px', height: '88px', borderRadius: '24px',
          background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '40px',
          boxShadow: '0 0 60px #0ea5e940',
        }}><LogoIcon size={88} borderRadius={24} /></div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
  fontSize: '32px', fontWeight: '800',
  color: '#f0f6ff', margin: '12px 0 8px',
  letterSpacing: '-0.5px'
}}>RecoveryLog</h1>
          <p style={{
            color: '#4a6080', fontSize: '15px', margin: 0,
            opacity: phase === 'tagline' || phase === 'fade' ? 1 : 0,
            transform: phase === 'tagline' || phase === 'fade' ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.4s ease 0.2s',
          }}>What actually improves YOUR performance.</p>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: '60px',
        display: 'flex', gap: '6px',
        opacity: phase === 'tagline' || phase === 'fade' ? 1 : 0,
        transition: 'opacity 0.4s ease 0.4s',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: i === 0 ? '#0ea5e9' : '#1e2a3a',
            animation: `pulse 1.2s ease ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
