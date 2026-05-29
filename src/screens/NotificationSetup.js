import React, { useState } from 'react'
import { requestNotificationPermission, scheduleNotifications, registerServiceWorker } from '../notifications'

export default function NotificationSetup({ onDone }) {
  const [status, setStatus] = useState('idle')

  const handleEnable = async () => {
    setStatus('requesting')
    await registerServiceWorker()
    const permission = await requestNotificationPermission()
    if (permission === 'granted') {
      await scheduleNotifications()
      setStatus('granted')
      setTimeout(() => onDone(), 1500)
    } else if (permission === 'denied') {
      setStatus('denied')
    } else {
      setStatus('idle')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#080d13',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', zIndex: 9998
    }}>
      <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>

        <div style={{
          width: '88px', height: '88px', borderRadius: '24px',
          background: '#0d1520', border: '1px solid #1e2a3a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '40px'
        }}>🔔</div>

        <h2 style={{ color: '#f0f6ff', fontSize: '24px', fontWeight: '700', margin: '0 0 12px' }}>
          Stay on track
        </h2>
        <p style={{ color: '#4a6080', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px' }}>
          Get a morning check-in reminder and evening recovery nudge to keep your streak alive.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {[
            { time: '8:00 AM', message: 'Morning check-in reminder', icon: '☀️' },
            { time: '8:00 PM', message: 'Evening recovery reminder', icon: '🌙' },
            { time: 'Anytime', message: 'Streak milestone alerts', icon: '🔥' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#0d1520', borderRadius: '12px', padding: '14px 16px', border: '0.5px solid #1e2a3a', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
              <span style={{ fontSize: '22px' }}>{item.icon}</span>
              <div>
                <p style={{ color: '#f0f6ff', fontSize: '14px', fontWeight: '500', margin: '0 0 2px' }}>{item.message}</p>
                <p style={{ color: '#4a6080', fontSize: '12px', margin: '0' }}>{item.time}</p>
              </div>
            </div>
          ))}
        </div>

        {status === 'granted' && (
          <div style={{ background: '#2ecc7115', border: '1px solid #2ecc7140', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
            <p style={{ color: '#2ecc71', fontSize: '15px', fontWeight: '600', margin: '0' }}>Notifications enabled!</p>
          </div>
        )}

        {status === 'denied' && (
          <div style={{ background: '#e74c3c15', border: '1px solid #e74c3c40', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
            <p style={{ color: '#e74c3c', fontSize: '14px', margin: '0' }}>Notifications blocked. Enable them in your browser settings.</p>
          </div>
        )}

        {status !== 'granted' && (
          <>
            <button
              onClick={handleEnable}
              disabled={status === 'requesting'}
              style={{
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                color: 'white', border: 'none', borderRadius: '14px',
                fontSize: '16px', fontWeight: '700',
                cursor: status === 'requesting' ? 'not-allowed' : 'pointer',
                opacity: status === 'requesting' ? 0.7 : 1,
                marginBottom: '12px',
                boxShadow: '0 4px 20px #0ea5e930'
              }}>
              {status === 'requesting' ? 'Setting up...' : 'Enable Notifications'}
            </button>
            <button onClick={onDone} style={{ background: 'transparent', border: 'none', color: '#4a6080', fontSize: '14px', cursor: 'pointer', padding: '8px' }}>
              Not now
            </button>
          </>
        )}
      </div>
    </div>
  )
}
