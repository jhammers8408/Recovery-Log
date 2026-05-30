import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { callClaude } from '../claude'
import Paywall from '../Paywall'
import { useProStatus } from '../useProStatus'
import ProductRecommendation from '../ProductRecommendation'

function correlate(logs, metricA, metricB) {
  if (logs.length < 5) return null
  const pairs = logs
    .filter(l => l[metricA] != null && l[metricB] != null)
    .map(l => ({ a: parseFloat(l[metricA]), b: parseFloat(l[metricB]) }))
  if (pairs.length < 5) return null
  const avgA = pairs.reduce((s, p) => s + p.a, 0) / pairs.length
  const avgB = pairs.reduce((s, p) => s + p.b, 0) / pairs.length
  const num = pairs.reduce((s, p) => s + (p.a - avgA) * (p.b - avgB), 0)
  const den = Math.sqrt(
    pairs.reduce((s, p) => s + (p.a - avgA) ** 2, 0) *
    pairs.reduce((s, p) => s + (p.b - avgB) ** 2, 0)
  )
  return den === 0 ? 0 : num / den
}

function getCorrelationInsight(logs) {
  const checks = [
    {
      a: 'sleep_hours', b: 'energy',
      positive: (r) => `When you sleep more your energy is ${Math.round(Math.abs(r) * 100)}% more likely to be high`,
      negative: (r) => `More sleep doesn't seem to boost your energy — your other factors matter more`,
    },
    {
      a: 'sleep_hours', b: 'soreness',
      positive: (r) => `More sleep noticeably reduces your soreness — prioritize 8+ hours on heavy training days`,
      negative: (r) => `Sleep has a ${Math.round(Math.abs(r) * 100)}% correlation with reducing your soreness`,
    },
    {
      a: 'stress', b: 'motivation',
      positive: (r) => `Your stress and motivation move together — managing stress is key to staying driven`,
      negative: (r) => `High stress days drop your motivation by a significant margin — stress management is critical for you`,
    },
    {
      a: 'hydration', b: 'energy',
      positive: (r) => `Hydration has a ${Math.round(Math.abs(r) * 100)}% correlation with your energy levels`,
      negative: (r) => `On days you hydrate well your energy tends to be higher`,
    },
    {
      a: 'sleep_quality', b: 'motivation',
      positive: (r) => `Sleep quality is a strong predictor of your motivation — better sleep means more drive`,
      negative: (r) => `Poor sleep quality is dragging your motivation down`,
    },
  ]

  const insights = []
  for (const check of checks) {
    const r = correlate(logs, check.a, check.b)
    if (r === null) continue
    if (Math.abs(r) > 0.3) {
      insights.push({
        text: r > 0 ? check.positive(r) : check.negative(r),
        strength: Math.abs(r),
        color: Math.abs(r) > 0.6 ? '#2ecc71' : Math.abs(r) > 0.4 ? '#0ea5e9' : '#f59e0b',
        label: Math.abs(r) > 0.6 ? 'Strong' : Math.abs(r) > 0.4 ? 'Moderate' : 'Weak',
      })
    }
  }
  return insights.sort((a, b) => b.strength - a.strength)
}

function getRecoveryScore(log) {
  if (!log) return null
  return Math.round(
    (log.sleep_quality * 0.3 + log.energy * 0.25 +
    (10 - log.soreness) * 0.2 + log.hydration * 0.15 +
    log.motivation * 0.1) * 10
  )
}

export default function Insights({ user }) {
  const [logs, setLogs] = useState([])
  const [perfLogs, setPerfLogs] = useState([])
  const [aiInsights, setAiInsights] = useState([])
  const [correlations, setCorrelations] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showPaywall, setShowPaywall] = useState(false)
  const { isPro } = useProStatus(user)
  console.log('isPro:', isPro)

  useEffect(() => { fetchData() }, []) // eslint-disable-line

  const fetchData = async () => {
    const { data: logData } = await supabase
      .from('daily_logs').select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false }).limit(30)

    const { data: perfData } = await supabase
      .from('performance_logs').select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false }).limit(30)

    const { data: insightData } = await supabase
      .from('insights').select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false }).limit(10)

    if (logData) {
      setLogs(logData)
      setCorrelations(getCorrelationInsight(logData))
    }
    if (perfData) setPerfLogs(perfData)
    if (insightData) setAiInsights(insightData)
    setLoading(false)
  }

  const generateAiInsights = async () => {
    if (logs.length < 3) return alert('Log at least 3 days to generate insights!')
    setGenerating(true)
    const summary = logs.slice(0, 14).map(l =>
      `Date: ${l.log_date}, Sleep: ${l.sleep_hours}hrs (quality: ${l.sleep_quality}/10), Energy: ${l.energy}/10, Soreness: ${l.soreness}/10, Stress: ${l.stress}/10, Motivation: ${l.motivation}/10, Hydration: ${l.hydration}/10, Water: ${l.water_oz}oz`
    ).join('\n')

    const perfSummary = perfLogs.slice(0, 7).map(l =>
      `Date: ${l.log_date}, Sport: ${l.sport}, Performance: ${l.performance_rating}/10, Confidence: ${l.confidence}/10, Fatigue: ${l.fatigue}/10`
    ).join('\n')

    try {
      const data = await callClaude([{
        role: 'user',
        content: `You are an elite sports recovery analyst. Analyze this athlete's data and give 4 highly specific, personalized insights about patterns in their recovery and performance. Be direct, specific with numbers, and actionable. Each insight should start with a bold finding then explain why it matters for this athlete specifically.

Recovery Data:
${summary}

Performance Data:
${perfSummary}

Return exactly 4 insights, one per line, no bullet points, no numbering, nothing else.`
      }])
      const text = data.content[0].text
      const lines = text.split('\n').filter(l => l.trim()).slice(0, 4)
      for (const line of lines) {
        await supabase.from('insights').insert([{
          user_id: user.id,
          insight_text: line.trim(),
          insight_type: 'ai_pattern',
        }])
      }
      fetchData()
    } catch (err) {
      alert('Could not generate insights right now.')
    }
    setGenerating(false)
  }

  const recoveryScore = logs.length > 0 ? getRecoveryScore(logs[0]) : null
  const avgSleep = logs.length > 0 ? (logs.reduce((s, l) => s + (l.sleep_hours || 0), 0) / logs.length).toFixed(1) : null
  const avgEnergy = logs.length > 0 ? (logs.reduce((s, l) => s + (l.energy || 0), 0) / logs.length).toFixed(1) : null
  const avgSoreness = logs.length > 0 ? (logs.reduce((s, l) => s + (l.soreness || 0), 0) / logs.length).toFixed(1) : null

  const tabs = [
    { key: 'overview', label: 'Overview', locked: false },
    { key: 'correlations', label: 'Correlations', locked: false },
    { key: 'ai', label: 'AI Insights', locked: !isPro },
  ]

  return (
    <div className="screen">
      {showPaywall && <Paywall feature="ai_insights" onClose={() => setShowPaywall(false)} />}

      <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Insights</p>
      <p style={{ color: '#4a6080', fontSize: '13px', margin: '0 0 20px' }}>What your data actually says</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => {
            if (tab.locked) { setShowPaywall(true); return }
            setActiveTab(tab.key)
          }} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
            cursor: 'pointer', fontWeight: '600', fontSize: '12px',
            backgroundColor: activeTab === tab.key ? '#0ea5e9' : '#0d1520',
            color: activeTab === tab.key ? 'white' : '#4a6080',
            transition: 'all 0.2s',
            position: 'relative'
          }}>
            {tab.label} {tab.locked && '🔒'}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#4a6080', textAlign: 'center', padding: '40px' }}>Loading your data...</p>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div>
              {recoveryScore && (
                <div style={{ background: '#0d1520', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
                  <p style={{ color: '#4a6080', fontSize: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Today's Recovery Score</p>
                  <p style={{ fontSize: '64px', fontWeight: '800', color: recoveryScore >= 80 ? '#2ecc71' : recoveryScore >= 60 ? '#0ea5e9' : '#e74c3c', margin: '0', lineHeight: '1' }}>{recoveryScore}</p>
                  <p style={{ color: '#4a6080', fontSize: '13px', margin: '12px 0 0' }}>
                    {recoveryScore >= 80 ? 'Ready to perform at your best' : recoveryScore >= 60 ? 'Train smart today' : 'Recovery day recommended'}
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {[
                  { label: 'Avg Sleep', value: avgSleep ? `${avgSleep}h` : '--', color: '#0ea5e9' },
                  { label: 'Avg Energy', value: avgEnergy ? `${avgEnergy}/10` : '--', color: '#2ecc71' },
                  { label: 'Avg Soreness', value: avgSoreness ? `${avgSoreness}/10` : '--', color: '#f59e0b' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: '#0d1520', borderRadius: '12px', padding: '14px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
                    <p style={{ color: stat.color, fontSize: '20px', fontWeight: '700', margin: '0 0 4px' }}>{stat.value}</p>
                    <p style={{ color: '#4a6080', fontSize: '11px', margin: '0' }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {logs.length < 3 ? (
                <div style={{ background: '#0d1520', borderRadius: '16px', padding: '40px 20px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
                  <p style={{ fontSize: '40px', marginBottom: '12px' }}>📊</p>
                  <p style={{ color: '#f0f6ff', fontWeight: '600', marginBottom: '8px' }}>Not enough data yet</p>
                  <p style={{ color: '#4a6080', fontSize: '14px' }}>Log {3 - logs.length} more days to unlock insights</p>
                </div>
              ) : (
                <div style={{ background: '#0d1520', borderRadius: '16px', padding: '16px', border: '0.5px solid #1e2a3a' }}>
                  <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>Recent Check-Ins</p>
                  {logs.slice(0, 5).map((log, i) => {
                    const score = getRecoveryScore(log)
                    const color = score >= 80 ? '#2ecc71' : score >= 60 ? '#0ea5e9' : '#e74c3c'
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '0.5px solid #1e2a3a' : 'none' }}>
                        <div>
                          <p style={{ color: '#f0f6ff', fontSize: '13px', margin: '0 0 2px' }}>
                            {new Date(log.log_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p style={{ color: '#4a6080', fontSize: '11px', margin: '0' }}>{log.sleep_hours}h sleep · {log.energy}/10 energy</p>
                        </div>
                        <div style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: '8px', padding: '4px 10px' }}>
                          <p style={{ color, fontSize: '13px', fontWeight: '700', margin: '0' }}>{score}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'correlations' && (
            <div>
              <div style={{ background: '#0d1520', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '0.5px solid #0ea5e930' }}>
                <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>What is this?</p>
                <p style={{ color: '#8aa0b8', fontSize: '13px', lineHeight: '1.6', margin: '0' }}>
                  The correlation engine analyzes your logged data to find patterns specific to YOUR body — not generic advice. The more you log, the more accurate it gets.
                </p>
              </div>

              {logs.length < 5 ? (
                <div style={{ background: '#0d1520', borderRadius: '16px', padding: '40px 20px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
                  <p style={{ color: '#f0f6ff', fontWeight: '600', marginBottom: '8px' }}>Need more data</p>
                  <p style={{ color: '#4a6080', fontSize: '14px' }}>Log {5 - logs.length} more days to unlock correlations</p>
                  <p style={{ color: '#0ea5e9', fontSize: '13px', marginTop: '8px' }}>{logs.length}/5 days logged</p>
                </div>
              ) : correlations.length === 0 ? (
                <div style={{ background: '#0d1520', borderRadius: '16px', padding: '40px 20px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
                  <p style={{ color: '#f0f6ff', fontWeight: '600', marginBottom: '8px' }}>No strong patterns yet</p>
                  <p style={{ color: '#4a6080', fontSize: '14px' }}>Keep logging — patterns will emerge with more data</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {correlations.map((c, i) => (
                    <div key={i} style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', border: `0.5px solid ${c.color}30` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ background: `${c.color}15`, border: `1px solid ${c.color}40`, borderRadius: '8px', padding: '3px 10px' }}>
                          <p style={{ color: c.color, fontSize: '11px', fontWeight: '600', margin: '0' }}>{c.label} correlation</p>
                        </div>
                        <p style={{ color: c.color, fontSize: '13px', fontWeight: '700', margin: '0' }}>{Math.round(c.strength * 100)}%</p>
                      </div>
                      <p style={{ color: '#f0f6ff', fontSize: '14px', lineHeight: '1.5', margin: '0' }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <div style={{ background: '#0d1520', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '0.5px solid #0ea5e930' }}>
                <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>AI Pattern Analysis</p>
                <p style={{ color: '#8aa0b8', fontSize: '13px', lineHeight: '1.6', margin: '0 0 12px' }}>
                  AI analyzes your full data history to find deeper patterns across sleep, recovery, and performance.
                </p>
                <button
                  onClick={generateAiInsights}
                  disabled={generating || logs.length < 3}
                  style={{
                    width: '100%', padding: '12px', background: '#0ea5e9',
                    color: 'white', border: 'none', borderRadius: '10px',
                    fontSize: '14px', fontWeight: '600',
                    cursor: generating || logs.length < 3 ? 'not-allowed' : 'pointer',
                    opacity: generating || logs.length < 3 ? 0.6 : 1
                  }}>
                  {generating ? 'Analyzing your data...' : 'Generate New Insights'}
                </button>
              </div>

              {aiInsights.length === 0 ? (
                <div style={{ background: '#0d1520', borderRadius: '16px', padding: '40px 20px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
                  <p style={{ color: '#f0f6ff', fontWeight: '600', marginBottom: '8px' }}>No AI insights yet</p>
                  <p style={{ color: '#4a6080', fontSize: '14px' }}>
                    {logs.length < 3 ? `Log ${3 - logs.length} more days then hit Generate` : 'Hit Generate above to analyze your data'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {aiInsights.map((insight, i) => (
                    <div key={i} style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', border: '0.5px solid #0ea5e920' }}>
                      <p style={{ color: '#f0f6ff', fontSize: '14px', lineHeight: '1.6', margin: '0 0 8px' }}>{insight.insight_text}</p>
                      <p style={{ color: '#2a3a4a', fontSize: '11px', margin: '0' }}>
                        {new Date(insight.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {aiInsights.length > 0 && (
                <ProductRecommendation
                  tags={['recovery', 'performance']}
                  title="Products that support your goals"
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
