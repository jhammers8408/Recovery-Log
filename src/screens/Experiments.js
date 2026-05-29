import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { callClaude } from '../claude'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'training', label: 'Training' },
  { key: 'mental', label: 'Mental' },
  { key: 'recovery', label: 'Recovery' },
]

function ExperimentCard({ exp, onStart, isActive }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0d1520',
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '12px',
        border: `0.5px solid ${hovered ? '#0ea5e940' : '#1e2a3a'}`,
        transition: 'all 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none'
      }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '28px' }}>{exp.icon}</span>
          <div>
            <p style={{ color: '#f0f6ff', fontSize: '15px', fontWeight: '600', margin: '0 0 3px' }}>{exp.title}</p>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ background: '#0ea5e915', border: '1px solid #0ea5e930', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: '#0ea5e9', textTransform: 'capitalize' }}>{exp.category}</span>
              <span style={{ color: '#4a6080', fontSize: '11px' }}>{exp.duration_days} days</span>
              {exp.is_ai_generated && (
                <span style={{ background: '#9b59b615', border: '1px solid #9b59b630', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: '#9b59b6' }}>AI Generated</span>
              )}
              {exp.is_featured && (
                <span style={{ background: '#f59e0b15', border: '1px solid #f59e0b30', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: '#f59e0b' }}>Featured</span>
              )}
            </div>
          </div>
        </div>
        {exp.starts_count > 0 && (
          <p style={{ color: '#4a6080', fontSize: '11px', margin: '0', whiteSpace: 'nowrap' }}>{exp.starts_count} started</p>
        )}
      </div>

      <p style={{ color: '#8aa0b8', fontSize: '13px', lineHeight: '1.5', margin: '0 0 12px' }}>{exp.description}</p>

      <div style={{ background: '#111820', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px' }}>
        <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Protocol</p>
        <p style={{ color: '#8aa0b8', fontSize: '12px', lineHeight: '1.5', margin: '0' }}>{exp.instructions}</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <div style={{ flex: 1, background: '#1e2a3a', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <p style={{ color: '#4a6080', fontSize: '10px', margin: '0 0 2px' }}>Control</p>
          <p style={{ color: '#f0f6ff', fontSize: '11px', fontWeight: '600', margin: '0' }}>Days 1-7</p>
        </div>
        <div style={{ flex: 1, background: '#0ea5e915', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid #0ea5e930' }}>
          <p style={{ color: '#4a6080', fontSize: '10px', margin: '0 0 2px' }}>Test</p>
          <p style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '600', margin: '0' }}>Days 8-14</p>
        </div>
      </div>

      <button
        onClick={() => onStart(exp)}
        disabled={isActive}
        style={{
          width: '100%', padding: '12px',
          background: isActive ? '#1e2a3a' : '#0ea5e9',
          color: isActive ? '#4a6080' : 'white',
          border: 'none', borderRadius: '12px',
          fontSize: '14px', fontWeight: '600',
          cursor: isActive ? 'not-allowed' : 'pointer'
        }}>
        {isActive ? 'Already Active' : 'Start Experiment'}
      </button>
    </div>
  )
}

function ActiveExperimentCard({ exp, onComplete }) {
  const today = new Date().toISOString().split('T')[0]
  const startDate = new Date(exp.control_start)
  const daysPassed = Math.floor((new Date(today) - startDate) / (1000 * 60 * 60 * 24))
  const progress = Math.min(Math.round((daysPassed / 14) * 100), 100)
  const inTestPhase = today >= exp.test_start
  const isComplete = today > exp.test_end

  return (
    <div style={{ background: '#0d1520', borderRadius: '16px', padding: '18px', marginBottom: '12px', border: '0.5px solid #0ea5e940' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ color: '#f0f6ff', fontSize: '16px', fontWeight: '600', margin: '0' }}>{exp.title}</p>
        <div style={{ background: inTestPhase ? '#0ea5e915' : '#1e2a3a', border: `1px solid ${inTestPhase ? '#0ea5e9' : '#2a3a4a'}`, borderRadius: '8px', padding: '4px 10px' }}>
          <p style={{ color: inTestPhase ? '#0ea5e9' : '#4a6080', fontSize: '11px', fontWeight: '600', margin: '0' }}>
            {isComplete ? 'Complete' : inTestPhase ? 'Test Phase' : 'Control Phase'}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <p style={{ color: '#4a6080', fontSize: '12px', margin: '0' }}>Progress</p>
          <p style={{ color: '#0ea5e9', fontSize: '12px', fontWeight: '600', margin: '0' }}>Day {Math.min(daysPassed + 1, 14)} of 14</p>
        </div>
        <div style={{ background: '#1e2a3a', borderRadius: '4px', height: '6px' }}>
          <div style={{ background: '#0ea5e9', borderRadius: '4px', height: '6px', width: `${progress}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {isComplete && (
        <button onClick={() => onComplete(exp)} style={{ width: '100%', padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          See My Results
        </button>
      )}
    </div>
  )
}

export default function Experiments({ user }) {
  const [library, setLibrary] = useState([])
  const [activeExperiments, setActiveExperiments] = useState([])
  const [completedExperiments, setCompletedExperiments] = useState([])
  const [view, setView] = useState('browse')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    fetchAll()
  }, []) // eslint-disable-line

  const fetchAll = async () => {
    const [{ data: libData }, { data: expData }] = await Promise.all([
      supabase.from('experiment_library').select('*').order('is_featured', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('experiments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    if (libData) setLibrary(libData)
    if (expData) {
      setActiveExperiments(expData.filter(e => e.status === 'active'))
      setCompletedExperiments(expData.filter(e => e.status === 'completed'))
    }
    setLoading(false)
  }

  const generateNewExperiments = async () => {
    setGenerating(true)
    try {
  const existingTitles = library.map(e => e.title).join(', ')
  const data = await callClaude([{
    role: 'user',
    content: `You are a sports science researcher. Generate 3 new recovery experiments based on current sports science research. These should be different from: ${existingTitles}

Return ONLY a JSON array with exactly 3 objects, each with these fields:
[
  {
    "title": "experiment name",
    "description": "one sentence — what question does this answer?",
    "variable": "snake_case_key",
    "icon": "single emoji",
    "category": "sleep|nutrition|training|mental|recovery",
    "instructions": "Days 1-7: [control]. Days 8-14: [test intervention].",
    "duration_days": 14
  }
]
Return only the JSON array, nothing else.`
  }])

  const text = data.content[0].text
  const clean = text.replace(/```json|```/g, '').trim()
  const experiments = JSON.parse(clean)
  const weekOf = new Date().toISOString().split('T')[0]
  for (const exp of experiments) {
    await supabase.from('experiment_library').insert([{
      ...exp,
      is_ai_generated: true,
      week_of: weekOf,
    }])
  }
  fetchAll()
} catch (err) {
  alert('Could not generate experiments right now.')
}
    setGenerating(false)
  }

  const startExperiment = async (exp) => {
    setStarting(true)
    const today = new Date()
    const controlStart = today.toISOString().split('T')[0]
    const controlEnd = new Date(today)
    controlEnd.setDate(today.getDate() + 6)
    const testStart = new Date(today)
    testStart.setDate(today.getDate() + 7)
    const testEnd = new Date(today)
    testEnd.setDate(today.getDate() + 13)

    const { error } = await supabase.from('experiments').insert([{
      user_id: user.id,
      title: exp.title,
      description: exp.description,
      variable: exp.variable,
      control_start: controlStart,
      control_end: controlEnd.toISOString().split('T')[0],
      test_start: testStart.toISOString().split('T')[0],
      test_end: testEnd.toISOString().split('T')[0],
      status: 'active',
    }])

    if (!error) {
      await supabase.from('experiment_library').update({ starts_count: (exp.starts_count || 0) + 1 }).eq('id', exp.id)
      fetchAll()
      setView('active')
    } else {
      alert('Something went wrong starting the experiment.')
    }
    setStarting(false)
  }

  const completeExperiment = async (exp) => {
    const { data: logs } = await supabase
      .from('daily_logs').select('*').eq('user_id', user.id)
      .gte('log_date', exp.control_start).lte('log_date', exp.test_end)

    if (!logs || logs.length < 4) {
      alert('Not enough check-in data to calculate results. Keep logging daily!')
      return
    }

    const controlLogs = logs.filter(l => l.log_date >= exp.control_start && l.log_date <= exp.control_end)
    const testLogs = logs.filter(l => l.log_date >= exp.test_start && l.log_date <= exp.test_end)
    const avg = (arr, key) => arr.length > 0 ? (arr.reduce((s, l) => s + (l[key] || 0), 0) / arr.length).toFixed(1) : 'N/A'

    const result = {
      control: { energy: avg(controlLogs, 'energy'), soreness: avg(controlLogs, 'soreness'), motivation: avg(controlLogs, 'motivation'), sleep_quality: avg(controlLogs, 'sleep_quality') },
      test: { energy: avg(testLogs, 'energy'), soreness: avg(testLogs, 'soreness'), motivation: avg(testLogs, 'motivation'), sleep_quality: avg(testLogs, 'sleep_quality') },
    }

    await supabase.from('experiments').update({ status: 'completed', result_data: result }).eq('id', exp.id)
    setResults({ ...result, title: exp.title })
    fetchAll()
  }

  const featured = library.find(e => e.is_featured)
  const filtered = library.filter(e => category === 'all' || e.category === category)
  const activeVariables = activeExperiments.map(e => e.variable || e.title)

  const tabs = [
    { key: 'browse', label: 'Browse' },
    { key: 'active', label: `Active (${activeExperiments.length})` },
    { key: 'completed', label: `Results (${completedExperiments.length})` },
  ]

  return (
    <div className="screen">
      <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Experiments Lab</p>
      <p style={{ color: '#4a6080', fontSize: '13px', margin: '0 0 20px' }}>Run controlled tests to find what works for your body</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setView(tab.key)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', backgroundColor: view === tab.key ? '#0ea5e9' : '#0d1520', color: view === tab.key ? 'white' : '#4a6080', transition: 'all 0.2s' }}>{tab.label}</button>
        ))}
      </div>

      {results && (
        <div style={{ background: '#0d1520', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '0.5px solid #2ecc7140' }}>
          <p style={{ color: '#2ecc71', fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>Results: {results.title}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Energy', control: results.control.energy, test: results.test.energy },
              { label: 'Soreness', control: results.control.soreness, test: results.test.soreness, lower: true },
              { label: 'Motivation', control: results.control.motivation, test: results.test.motivation },
              { label: 'Sleep Quality', control: results.control.sleep_quality, test: results.test.sleep_quality },
            ].map((metric, i) => {
              const diff = parseFloat(metric.test) - parseFloat(metric.control)
              const improved = metric.lower ? diff < 0 : diff > 0
              const color = improved ? '#2ecc71' : diff === 0 ? '#4a6080' : '#e74c3c'
              return (
                <div key={i} style={{ background: '#111820', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ color: '#4a6080', fontSize: '11px', margin: '0 0 8px' }}>{metric.label}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#8aa0b8', fontSize: '18px', fontWeight: '700', margin: '0' }}>{metric.control}</p>
                      <p style={{ color: '#2a3a4a', fontSize: '10px', margin: '0' }}>Control</p>
                    </div>
                    <p style={{ color, fontSize: '14px', fontWeight: '700', margin: '0' }}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}</p>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color, fontSize: '18px', fontWeight: '700', margin: '0' }}>{metric.test}</p>
                      <p style={{ color: '#2a3a4a', fontSize: '10px', margin: '0' }}>Test</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <button onClick={() => setResults(null)} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #1e2a3a', borderRadius: '10px', color: '#4a6080', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}>
            Close Results
          </button>
        </div>
      )}

      {view === 'browse' && (
        <div>
          {/* Featured Experiment */}
          {featured && (
            <div style={{ background: 'linear-gradient(135deg, #0ea5e915, #9b59b615)', borderRadius: '16px', padding: '18px', marginBottom: '16px', border: '0.5px solid #0ea5e940' }}>
              <p style={{ color: '#f59e0b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px', fontWeight: '700' }}>Featured this week</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '32px' }}>{featured.icon}</span>
                <div>
                  <p style={{ color: '#f0f6ff', fontSize: '16px', fontWeight: '700', margin: '0 0 4px' }}>{featured.title}</p>
                  <p style={{ color: '#8aa0b8', fontSize: '13px', margin: '0' }}>{featured.description}</p>
                </div>
              </div>
              <button
                onClick={() => startExperiment(featured)}
                disabled={activeVariables.includes(featured.variable)}
                style={{ width: '100%', padding: '12px', background: activeVariables.includes(featured.variable) ? '#1e2a3a' : '#0ea5e9', color: activeVariables.includes(featured.variable) ? '#4a6080' : 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: activeVariables.includes(featured.variable) ? 'not-allowed' : 'pointer' }}>
                {activeVariables.includes(featured.variable) ? 'Already Active' : 'Start Featured Experiment'}
              </button>
            </div>
          )}

          {/* Generate New Button */}
          <button
            onClick={generateNewExperiments}
            disabled={generating}
            style={{ width: '100%', padding: '13px', background: generating ? '#1e2a3a' : '#9b59b615', border: '1px solid #9b59b630', borderRadius: '12px', color: generating ? '#4a6080' : '#9b59b6', fontSize: '14px', fontWeight: '600', cursor: generating ? 'not-allowed' : 'pointer', marginBottom: '16px' }}>
            {generating ? 'Generating new experiments...' : 'Generate New Experiments with AI'}
          </button>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)} style={{ padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap', backgroundColor: category === cat.key ? '#0ea5e9' : '#0d1520', color: category === cat.key ? 'white' : '#4a6080', transition: 'all 0.2s' }}>{cat.label}</button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: '#4a6080', textAlign: 'center', padding: '40px' }}>Loading experiments...</p>
          ) : (
            filtered.filter(e => !e.is_featured).map(exp => (
              <ExperimentCard key={exp.id} exp={exp} onStart={startExperiment} isActive={activeVariables.includes(exp.variable)} />
            ))
          )}
        </div>
      )}

      {view === 'active' && (
        <div>
          {activeExperiments.length === 0 ? (
            <div style={{ background: '#0d1520', borderRadius: '16px', padding: '40px 20px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
              <p style={{ fontSize: '40px', marginBottom: '12px' }}>🔬</p>
              <p style={{ color: '#f0f6ff', fontWeight: '600', marginBottom: '8px' }}>No active experiments</p>
              <p style={{ color: '#4a6080', fontSize: '14px' }}>Browse experiments and start one to begin tracking</p>
            </div>
          ) : (
            activeExperiments.map(exp => (
              <ActiveExperimentCard key={exp.id} exp={exp} onComplete={completeExperiment} />
            ))
          )}
        </div>
      )}

      {view === 'completed' && (
        <div>
          {completedExperiments.length === 0 ? (
            <div style={{ background: '#0d1520', borderRadius: '16px', padding: '40px 20px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
              <p style={{ color: '#f0f6ff', fontWeight: '600', marginBottom: '8px' }}>No completed experiments yet</p>
              <p style={{ color: '#4a6080', fontSize: '14px' }}>Complete a 14-day experiment to see your results</p>
            </div>
          ) : (
            completedExperiments.map(exp => (
              <div key={exp.id} style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', marginBottom: '10px', border: '0.5px solid #1e2a3a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: '#f0f6ff', fontSize: '14px', fontWeight: '600', margin: '0' }}>{exp.title}</p>
                  <button onClick={() => setResults({ ...exp.result_data, title: exp.title })} style={{ background: '#0ea5e915', border: '1px solid #0ea5e930', borderRadius: '8px', padding: '5px 12px', color: '#0ea5e9', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    View Results
                  </button>
                </div>
                <p style={{ color: '#4a6080', fontSize: '12px', margin: '6px 0 0' }}>
                  Completed {new Date(exp.test_end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
