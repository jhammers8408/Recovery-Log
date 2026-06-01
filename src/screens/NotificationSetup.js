import React, { useState } from 'react'
import { registerForPushNotifications } from '../notifications'
import { Bell } from 'lucide-react'

export default function NotificationSetup({ onDone }) {
  const [loading, setLoading] = useState(false)

  const handleEnable = async () => {
    setLoading(true)
    await registerForPushNotifications()
    setLoading(false)
    onDone()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'flex-end',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#0d1520',
        borderRadius: '24px 24px 0 0',
        padding: '32px 24px 48px',
        width: '100%',
        border: '0.5px solid #1e2a3a',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: '#0ea5e915', border: '1px solid #0ea5e930', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Bell size={32} color="#0ea5e9" />
          </div>
          <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '700', margin: '0 0 8px' }}>Stay on Track</p>
          <p style={{ color: '#8aa0b8', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
            Get a morning reminder to log your recovery and an evening reminder to reflect on your day.
          </p>
        </div>

        <div style={{ background: '#111820', borderRadius: '14px', padding: '16px', marginBottom: '24px', border: '0.5px solid #1e2a3a' }}>
          {[
            { time: '8:00 AM', label: 'Morning check-in reminder', icon: '🌅' },
            { time: '8:00 PM', label: 'Evening recovery log', icon: '🌙' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i === 0 ? '0.5px solid #1e2a3a' : 'none' }}>
              <span style={{ fontSize: '24px' }}>{item.icon}</span>
              <div>
                <p style={{ color: '#f0f6ff', fontSize: '14px', fontWeight: '500', margin: '0 0 2px' }}>{item.label}</p>
                <p style={{ color: '#4a6080', fontSize: '12px', margin: '0' }}>{item.time} daily</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleEnable}
          disabled={loading}
          style={{ width: '100%', padding: '16px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '12px' }}>
          {loading ? 'Setting up...' : 'Enable Notifications'}
        </button>

        <button onClick={onDone} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid #1e2a3a', borderRadius: '14px', color: '#4a6080', fontSize: '15px', cursor: 'pointer' }}>
          Not Now
        </button>
      </div>
    </div>
  )
}
