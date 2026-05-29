import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Profile({ user, onSignOut }) {
  const [stats, setStats] = useState({ logs: 0, recoveries: 0, performances: 0, streak: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, []) // eslint-disable-line

  const fetchStats = async () => {
    const [{ count: logs }, { count: recoveries }, { count: performances }] = await Promise.all([
      supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('recovery_actions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('performance_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ])
    setStats({ logs: logs || 0, recoveries: recoveries || 0, performances: performances || 0 })
    setLoading(false)
  }

  const username = user.user_metadata?.username || user.email.split('@')[0]

  return (
    <div className="screen">
      <p className="section-title">Profile</p>
      <p className="section-sub">Your recovery journey</p>

      <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', fontWeight: 'bold', margin: '0 auto 16px'
        }}>
          {username.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>{username}</h2>
        <p style={{ color: '#555', fontSize: '14px' }}>{user.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        {[
          { label: 'Check-Ins', value: stats.logs, emoji: '📋' },
          { label: 'Recovery Sessions', value: stats.recoveries, emoji: '💪' },
          { label: 'Performance Logs', value: stats.performances, emoji: '⭐' },
          { label: 'Day Streak', value: `${stats.logs > 0 ? Math.min(stats.logs, 7) : 0}🔥`, emoji: '' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', margin: 0 }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#6366f1' }}>{s.emoji} {s.value}</div>
            <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <p style={{ fontWeight: '600', marginBottom: '12px' }}>⚙️ Settings</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['🔔 Notification Reminders', '📊 Export My Data', '🔒 Privacy Settings'].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? '1px solid #222' : 'none' }}>
              <span style={{ color: '#aaa', fontSize: '15px' }}>{item}</span>
              <span style={{ color: '#444' }}>›</span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-secondary" onClick={onSignOut} style={{ marginTop: '8px' }}>
        Sign Out
      </button>
    </div>
  )
}
