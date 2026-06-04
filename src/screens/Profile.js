import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Bell, Download, Lock, FileText, ChevronRight, Trash2 } from 'lucide-react'
import { registerForPushNotifications } from '../notifications'
import { useToast } from '../Toast'


export default function Profile({ user, onSignOut, onNavigate }) {
  const toast = useToast()
  const [stats, setStats] = useState({ logs: 0, recoveries: 0, performances: 0 })
  const [loading, setLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    fetchStats()
    const enabled = localStorage.getItem('notif_setup_seen')
    setNotificationsEnabled(!!enabled)
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

  const handleNotifications = async () => {
    try {
      const granted = await registerForPushNotifications()
      if (granted) {
        localStorage.setItem('notif_setup_seen', 'true')
        setNotificationsEnabled(true)
        toast('Notifications enabled!', 'success')
      } else {
        toast('Please enable notifications in iPhone Settings → RecoveryLog', 'warning')
      }
    } catch (err) {
      toast('Please enable notifications in iPhone Settings → RecoveryLog', 'warning')
    }
  }
const handleDeleteAccount = async () => {
  const confirmed = window.confirm(
    'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.'
  )
  if (!confirmed) return

  const doubleConfirmed = window.confirm(
    'This is permanent. All your check-ins, experiments, nutrition logs and recovery data will be deleted forever. Continue?'
  )
  if (!doubleConfirmed) return

  try {
    // Delete all user data from Supabase
    await Promise.all([
      supabase.from('daily_logs').delete().eq('user_id', user.id),
      supabase.from('recovery_actions').delete().eq('user_id', user.id),
      supabase.from('performance_logs').delete().eq('user_id', user.id),
      supabase.from('nutrition_logs').delete().eq('user_id', user.id),
      supabase.from('nutrition_goals').delete().eq('user_id', user.id),
      supabase.from('experiments').delete().eq('user_id', user.id),
      supabase.from('insights').delete().eq('user_id', user.id),
      supabase.from('subscriptions').delete().eq('user_id', user.id),
    ])
    await supabase.auth.signOut()
    toast('Account deleted successfully', 'success')
  } catch (err) {
    toast('Something went wrong. Please contact recoverylogapp@gmail.com', 'error')
  }
}

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Athlete'

  return (
    <div className="screen">
      <p className="section-title">Profile</p>
      <p className="section-sub">Your recovery journey</p>

      <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', fontWeight: 'bold', margin: '0 auto 16px', color: 'white'
        }}>
          {username.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ fontSize: '22px', marginBottom: '4px', color: '#f0f6ff' }}>{username}</h2>
        <p style={{ color: '#4a6080', fontSize: '14px' }}>{user.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        {[
          { label: 'Check-Ins', value: stats.logs, color: '#0ea5e9' },
          { label: 'Recovery Sessions', value: stats.recoveries, color: '#2ecc71' },
          { label: 'Performance Logs', value: stats.performances, color: '#f59e0b' },
          { label: 'Day Streak', value: `${Math.min(stats.logs, 7)}🔥`, color: '#e74c3c' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', margin: 0 }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ color: '#4a6080', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <p style={{ fontWeight: '600', marginBottom: '12px', color: '#f0f6ff' }}>Settings</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { icon: Bell, label: notificationsEnabled ? 'Notifications Enabled ✓' : 'Enable Notifications', key: 'notifications', color: notificationsEnabled ? '#2ecc71' : '#4a6080' },
{ icon: Download, label: 'Export My Data', key: 'export', color: '#4a6080' },
{ icon: Lock, label: 'Privacy Policy', key: 'privacy', color: '#4a6080' },
{ icon: FileText, label: 'Terms of Service', key: 'terms', color: '#4a6080' },
{ icon: Trash2, label: 'Delete Account', key: 'delete', color: '#e74c3c' },
          ].map((item, i) => (
            <div key={i}
              onClick={async () => {
                if (item.key === 'notifications') await handleNotifications()
                if (item.key === 'privacy') onNavigate('privacy')
                if (item.key === 'terms') onNavigate('terms')
                  if (item.key === 'delete') await handleDeleteAccount()
              }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? '1px solid #1e2a3a' : 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <item.icon size={16} color={item.color} />
                <span style={{ color: item.color === '#4a6080' ? '#aaa' : item.color, fontSize: '15px' }}>{item.label}</span>
              </div>
              <ChevronRight size={16} color="#444" />
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
