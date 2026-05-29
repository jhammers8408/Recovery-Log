import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { analyzeMetrics } from '../intelligence'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getReadiness(score) {
  if (score >= 80) return { label: 'Ready to perform', color: '#2ecc71' }
  if (score >= 60) return { label: 'Moderate readiness', color: '#f59e0b' }
  return { label: 'Recovery needed', color: '#e74c3c' }
}

export default function Home({ user, onNavigate }) {
  const [todayLog, setTodayLog] = useState(null)
  const [weekLogs, setWeekLogs] = useState([])
  const [perfLogs, setPerfLogs] = useState([])
  const [recoveryActions, setRecoveryActions] = useState([])
  const [intelligence, setIntelligence] = useState(null)
  const [checkedInToday, setCheckedInToday] = useState(false)
  const [loading, setLoading] = useState(true)

  const username = user.user_metadata?.username || user.email.split('@')[0]
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { fetchData() }, []) // eslint-disable-line

  const fetchData = async () => {
    const [{ data: logs }, { data: perf }, { data: actions }] = await Promise.all([
      supabase.from('daily_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }).limit(14),
      supabase.from('performance_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }).limit(14),
      supabase.from('recovery_actions').select('*').eq('user_id', user.id).order('log_date', { ascending: false }).limit(30),
    ])

    if (logs) {
      const todaysLog = logs.find(l => l.log_date === today)
      if (todaysLog) { setTodayLog(todaysLog); setCheckedInToday(true) }
      setWeekLogs(logs)
      setIntelligence(analyzeMetrics(logs, perf || [], actions || []))
    }
    if (perf) setPerfLogs(perf)
    if (actions) setRecoveryActions(actions)
    setLoading(false)
  }

  const recoveryScore = intelligence?.recoveryScore
  const readiness = recoveryScore ? getReadiness(recoveryScore) : null

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const log = weekLogs.find(l => l.log_date === dateStr)
    return {
      day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
      hasLog: !!log,
      score: log ? Math.round((log.sleep_quality * 0.3 + log.energy * 0.25 + (10 - log.soreness) * 0.2 + log.hydration * 0.15 + log.motivation * 0.1) * 10) : 0
    }
  })

  const insightColors = {
    positive: { bg: '#2ecc7115', border: '#2ecc7140', text: '#2ecc71', dot: '#2ecc71' },
    warning: { bg: '#f59e0b15', border: '#f59e0b40', text: '#f59e0b', dot: '#f59e0b' },
    insight: { bg: '#0ea5e915', border: '#0ea5e940', text: '#0ea5e9', dot: '#0ea5e9' },
  }

  return (
    <div className="screen">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <p style={{ color: '#4a6080', fontSize: '13px', margin: '0' }}>{getGreeting()}</p>
          <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '4px 0 0' }}>{username}</p>
        </div>
        <div onClick={() => onNavigate('profile')} style={{
          width: '44px', height: '44px', borderRadius: '50%', background: '#0ea5e9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', color: '#fff', fontSize: '18px', cursor: 'pointer'
        }}>
          {username.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Recovery Score */}
      <div style={{ background: '#0d1520', borderRadius: '20px', padding: '24px 20px', marginBottom: '12px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
        <p style={{ color: '#4a6080', fontSize: '11px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recovery Score</p>
        {loading ? (
          <p style={{ color: '#4a6080', fontSize: '16px', margin: '20px 0' }}>Analyzing your data...</p>
        ) : recoveryScore ? (
          <>
            <p style={{ fontSize: '72px', fontWeight: '800', color: readiness.color, margin: '0', lineHeight: '1' }}>{recoveryScore}</p>
            <div style={{ display: 'inline-block', background: `${readiness.color}15`, border: `1px solid ${readiness.color}40`, borderRadius: '20px', padding: '5px 16px', marginTop: '12px' }}>
              <span style={{ color: readiness.color, fontSize: '13px', fontWeight: '500' }}>{readiness.label}</span>
            </div>
            {intelligence?.performanceContext && (
              <p style={{ color: '#4a6080', fontSize: '12px', margin: '12px 0 0', lineHeight: '1.6' }}>{intelligence.performanceContext}</p>
            )}
          </>
        ) : (
          <>
            <p style={{ fontSize: '72px', fontWeight: '800', color: '#1e2a3a', margin: '0', lineHeight: '1' }}>--</p>
            <p style={{ color: '#4a6080', fontSize: '13px', margin: '12px 0 0' }}>Complete your check-in to see your score</p>
          </>
        )}
      </div>

      {/* Dynamic Coaching Insights */}
      {intelligence?.insights && intelligence.insights.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {intelligence.insights.slice(0, 2).map((insight, i) => {
            const colors = insightColors[insight.type] || insightColors.insight
            return (
              <div key={i} style={{ background: colors.bg, borderRadius: '14px', padding: '14px 16px', marginBottom: '8px', border: `0.5px solid ${colors.border}`, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.dot, marginTop: '5px', flexShrink: 0 }} />
                <p style={{ color: '#f0f6ff', fontSize: '13px', lineHeight: '1.6', margin: '0' }}>{insight.message}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Next Action */}
      <div style={{ background: '#0d1520', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: `0.5px solid ${checkedInToday ? '#1e2a3a' : '#0ea5e940'}` }}>
        <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Next action</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#0ea5e915', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0', fontSize: '20px' }}>
            {checkedInToday ? '💪' : '📋'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#f0f6ff', fontSize: '14px', fontWeight: '500', margin: '0 0 3px' }}>
              {checkedInToday ? 'Log your recovery' : 'Morning check-in'}
            </p>
            <p style={{ color: '#4a6080', fontSize: '12px', margin: '0' }}>
              {checkedInToday ? 'What did you do to recover today?' : 'Takes 20 seconds — not done yet'}
            </p>
          </div>
          <div
            onClick={() => onNavigate(checkedInToday ? 'recovery' : 'checkin')}
            onMouseEnter={e => e.currentTarget.style.background = '#38bdf8'}
            onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
            style={{ background: '#0ea5e9', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', color: '#fff', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}>
            Go
          </div>
        </div>
      </div>

      {/* Smart Recovery Priorities */}
      {intelligence?.recoveryPriorities && intelligence.recoveryPriorities.length > 0 && (
        <div style={{ background: '#0d1520', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '0.5px solid #1e2a3a' }}>
          <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Recommended for you today</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {intelligence.recoveryPriorities.slice(0, 3).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#111820', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                  <p style={{ color: '#f0f6ff', fontSize: '13px', fontWeight: '500', margin: '0' }}>{item.label}</p>
                </div>
                <p style={{ color: '#4a6080', fontSize: '11px', margin: '0' }}>{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Log */}
      <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Quick log</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        {[
          { icon: '📋', label: 'Check-In', sub: 'Sleep, energy, soreness', nav: 'checkin' },
          { icon: '💪', label: 'Recovery', sub: 'Log what you did', nav: 'recovery' },
          { icon: '⚡', label: 'Performance', sub: 'Rate your session', nav: 'performance' },
          { icon: '🔬', label: 'Experiments', sub: 'Run a controlled test', nav: 'experiments' },
        ].map(item => (
          <div key={item.nav} onClick={() => onNavigate(item.nav)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e940'; e.currentTarget.style.background = '#0ea5e908'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2a3a'; e.currentTarget.style.background = '#0d1520'; e.currentTarget.style.transform = 'translateY(0)' }}
            style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', border: '0.5px solid #1e2a3a', cursor: 'pointer', transition: 'all 0.15s' }}>
            <p style={{ fontSize: '22px', margin: '0 0 8px' }}>{item.icon}</p>
            <p style={{ color: '#f0f6ff', fontSize: '14px', fontWeight: '500', margin: '0 0 3px' }}>{item.label}</p>
            <p style={{ color: '#4a6080', fontSize: '11px', margin: '0' }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div style={{ background: '#0d1520', borderRadius: '16px', padding: '16px', border: '0.5px solid #1e2a3a' }}>
        <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>This week</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '4px', height: '64px' }}>
          {last7Days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', height: d.hasLog ? `${Math.max(20, (d.score / 100) * 52)}px` : '12px', background: d.hasLog ? '#0ea5e9' : '#1e2a3a', borderRadius: '4px', opacity: d.hasLog ? 1 : 0.4, transition: 'height 0.3s ease' }} />
              <p style={{ color: '#4a6080', fontSize: '10px', margin: '0' }}>{d.day}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
