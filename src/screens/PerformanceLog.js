import React, { useState } from 'react'
import { supabase } from '../supabase'

const SPORTS = [
  { key: 'football', label: 'Football', icon: '🏈' },
  { key: 'basketball', label: 'Basketball', icon: '🏀' },
  { key: 'tennis', label: 'Tennis', icon: '🎾' },
  { key: 'baseball', label: 'Baseball', icon: '⚾' },
  { key: 'soccer', label: 'Soccer', icon: '⚽' },
  { key: 'lifting', label: 'Lifting', icon: '🏋️' },
  { key: 'running', label: 'Running', icon: '🏃' },
  { key: 'swimming', label: 'Swimming', icon: '🏊' },
  { key: 'cycling', label: 'Cycling', icon: '🚴' },
  { key: 'golf', label: 'Golf', icon: '⛳' },
  { key: 'custom', label: 'Custom', icon: '✏️' },
]

const SPORT_STATS = {
  football: [
    { key: 'completions', label: 'Completions', unit: '', type: 'number', placeholder: '0' },
    { key: 'yards', label: 'Yards', unit: 'yds', type: 'number', placeholder: '0' },
    { key: 'touchdowns', label: 'Touchdowns', unit: 'TDs', type: 'number', placeholder: '0' },
    { key: 'interceptions', label: 'Interceptions', unit: '', type: 'number', placeholder: '0' },
    { key: 'tackles', label: 'Tackles', unit: '', type: 'number', placeholder: '0' },
    { key: 'catches', label: 'Catches', unit: '', type: 'number', placeholder: '0' },
  ],
  basketball: [
    { key: 'points', label: 'Points', unit: 'pts', type: 'number', placeholder: '0' },
    { key: 'rebounds', label: 'Rebounds', unit: 'reb', type: 'number', placeholder: '0' },
    { key: 'assists', label: 'Assists', unit: 'ast', type: 'number', placeholder: '0' },
    { key: 'turnovers', label: 'Turnovers', unit: 'TO', type: 'number', placeholder: '0' },
    { key: 'steals', label: 'Steals', unit: 'stl', type: 'number', placeholder: '0' },
    { key: 'blocks', label: 'Blocks', unit: 'blk', type: 'number', placeholder: '0' },
  ],
  tennis: [
    { key: 'aces', label: 'Aces', unit: '', type: 'number', placeholder: '0' },
    { key: 'winners', label: 'Winners', unit: '', type: 'number', placeholder: '0' },
    { key: 'errors', label: 'Unforced Errors', unit: '', type: 'number', placeholder: '0' },
    { key: 'sets_won', label: 'Sets Won', unit: '', type: 'number', placeholder: '0' },
    { key: 'first_serve_pct', label: 'First Serve %', unit: '%', type: 'number', placeholder: '0' },
  ],
  baseball: [
    { key: 'hits', label: 'Hits', unit: '', type: 'number', placeholder: '0' },
    { key: 'rbis', label: 'RBIs', unit: '', type: 'number', placeholder: '0' },
    { key: 'strikeouts', label: 'Strikeouts', unit: 'K', type: 'number', placeholder: '0' },
    { key: 'walks', label: 'Walks', unit: 'BB', type: 'number', placeholder: '0' },
    { key: 'era', label: 'ERA', unit: '', type: 'decimal', placeholder: '0.00' },
    { key: 'innings', label: 'Innings Pitched', unit: 'IP', type: 'decimal', placeholder: '0.0' },
  ],
  soccer: [
    { key: 'goals', label: 'Goals', unit: '', type: 'number', placeholder: '0' },
    { key: 'assists', label: 'Assists', unit: '', type: 'number', placeholder: '0' },
    { key: 'shots', label: 'Shots', unit: '', type: 'number', placeholder: '0' },
    { key: 'passes', label: 'Passes', unit: '', type: 'number', placeholder: '0' },
    { key: 'distance_km', label: 'Distance', unit: 'km', type: 'decimal', placeholder: '0.0' },
  ],
  lifting: [
    { key: 'main_lift', label: 'Main Lift (e.g. Squat)', unit: '', type: 'text', placeholder: 'Squat' },
    { key: 'weight_lbs', label: 'Top Weight', unit: 'lbs', type: 'number', placeholder: '0' },
    { key: 'sets', label: 'Sets', unit: '', type: 'number', placeholder: '0' },
    { key: 'reps', label: 'Reps (top set)', unit: '', type: 'number', placeholder: '0' },
    { key: 'total_volume', label: 'Total Volume', unit: 'lbs', type: 'number', placeholder: '0' },
    { key: 'pr', label: 'PR today?', unit: '', type: 'toggle', placeholder: '' },
  ],
  running: [
    { key: 'distance_miles', label: 'Distance', unit: 'mi', type: 'decimal', placeholder: '0.0' },
    { key: 'pace_min_mile', label: 'Avg Pace', unit: 'min/mi', type: 'text', placeholder: "8'30\"" },
    { key: 'total_time', label: 'Total Time', unit: 'min', type: 'number', placeholder: '0' },
    { key: 'avg_hr', label: 'Avg Heart Rate', unit: 'bpm', type: 'number', placeholder: '0' },
    { key: 'elevation_ft', label: 'Elevation Gain', unit: 'ft', type: 'number', placeholder: '0' },
  ],
  swimming: [
    { key: 'distance_yards', label: 'Distance', unit: 'yds', type: 'number', placeholder: '0' },
    { key: 'lap_time', label: 'Best Lap Time', unit: 'sec', type: 'decimal', placeholder: '0.0' },
    { key: 'strokes', label: 'Stroke Type', unit: '', type: 'text', placeholder: 'Freestyle' },
    { key: 'laps', label: 'Laps', unit: '', type: 'number', placeholder: '0' },
  ],
  cycling: [
    { key: 'distance_miles', label: 'Distance', unit: 'mi', type: 'decimal', placeholder: '0.0' },
    { key: 'avg_speed', label: 'Avg Speed', unit: 'mph', type: 'decimal', placeholder: '0.0' },
    { key: 'watts', label: 'Avg Power', unit: 'W', type: 'number', placeholder: '0' },
    { key: 'elevation_ft', label: 'Elevation Gain', unit: 'ft', type: 'number', placeholder: '0' },
    { key: 'cadence', label: 'Avg Cadence', unit: 'rpm', type: 'number', placeholder: '0' },
  ],
  golf: [
    { key: 'score', label: 'Score', unit: '', type: 'number', placeholder: '72' },
    { key: 'putts', label: 'Putts', unit: '', type: 'number', placeholder: '0' },
    { key: 'fairways_hit', label: 'Fairways Hit', unit: '', type: 'number', placeholder: '0' },
    { key: 'gir', label: 'Greens in Regulation', unit: '', type: 'number', placeholder: '0' },
    { key: 'driving_distance', label: 'Avg Drive', unit: 'yds', type: 'number', placeholder: '0' },
  ],
  custom: [],
}

const PHYSICAL_METRICS = {
  football: ['explosiveness', 'agility', 'arm_strength', 'conditioning'],
  basketball: ['vertical', 'quickness', 'conditioning', 'explosiveness'],
  tennis: ['footwork', 'reaction_time', 'endurance', 'consistency'],
  baseball: ['hand_eye', 'arm_strength', 'speed', 'focus'],
  soccer: ['stamina', 'agility', 'touch', 'explosiveness'],
  lifting: ['strength', 'power', 'technique', 'recovery_between_sets'],
  running: ['endurance', 'perceived_effort', 'mental_toughness', 'cadence_feel'],
  swimming: ['endurance', 'technique', 'breathing', 'turn_speed'],
  cycling: ['endurance', 'power_output', 'cadence_feel', 'mental_toughness'],
  golf: ['focus', 'consistency', 'distance_control', 'short_game'],
  custom: ['explosiveness', 'endurance', 'technique', 'focus'],
}

const METRIC_LABELS = {
  explosiveness: 'Explosiveness',
  agility: 'Agility',
  arm_strength: 'Arm Strength',
  conditioning: 'Conditioning',
  vertical: 'Vertical Jump Feel',
  quickness: 'Quickness',
  footwork: 'Footwork',
  reaction_time: 'Reaction Time',
  endurance: 'Endurance',
  consistency: 'Consistency',
  hand_eye: 'Hand-Eye Coordination',
  speed: 'Speed',
  focus: 'Focus',
  stamina: 'Stamina',
  touch: 'Ball Touch',
  strength: 'Strength',
  power: 'Power Output',
  technique: 'Technique',
  recovery_between_sets: 'Recovery Between Sets',
  perceived_effort: 'Perceived Effort',
  mental_toughness: 'Mental Toughness',
  cadence_feel: 'Cadence Feel',
  breathing: 'Breathing Control',
  turn_speed: 'Turn Speed',
  power_output: 'Power Output',
  distance_control: 'Distance Control',
  short_game: 'Short Game',
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', marginBottom: '10px', border: '0.5px solid #1e2a3a' }}>
      <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>{title}</p>
      {children}
    </div>
  )
}

function SliderRow({ label, value, onChange }) {
  const getColor = (v) => {
    if (v >= 8) return '#2ecc71'
    if (v >= 5) return '#0ea5e9'
    return '#f59e0b'
  }
  const color = getColor(value)
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <p style={{ color: '#f0f6ff', fontSize: '13px', margin: 0 }}>{label}</p>
        <p style={{ color, fontSize: '13px', fontWeight: '600', margin: 0 }}>{value}/10</p>
      </div>
      <input type="range" min={1} max={10} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: color }} />
    </div>
  )
}

export default function PerformanceLog({ user, onDone }) {
  const [sport, setSport] = useState(null)
  const [customSport, setCustomSport] = useState('')
  const [sportStats, setSportStats] = useState({})
  const [physicalMetrics, setPhysicalMetrics] = useState({})
  const [overallRating, setOverallRating] = useState(7)
  const [fatigue, setFatigue] = useState(3)
  const [confidence, setConfidence] = useState(7)
  const [duration, setDuration] = useState(60)
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSportSelect = (key) => {
    setSport(key)
    setSportStats({})
    const metrics = PHYSICAL_METRICS[key] || []
    const initial = {}
    metrics.forEach(m => initial[m] = 7)
    setPhysicalMetrics(initial)
  }

  const updateStat = (key, value) => {
    setSportStats(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!sport) return alert('Please select a sport first')
    setSubmitting(true)

    const { error } = await supabase.from('performance_logs').insert([{
      user_id: user.id,
      log_date: new Date().toISOString().split('T')[0],
      sport: sport === 'custom' ? customSport || 'Custom' : SPORTS.find(s => s.key === sport)?.label,
      custom_sport: sport === 'custom' ? customSport : null,
      performance_rating: overallRating,
      confidence,
      fatigue,
      sport_stats: sportStats,
      duration_minutes: duration,
      location,
      notes,
      explosiveness: physicalMetrics.explosiveness || null,
      focus: physicalMetrics.focus || null,
    }])

    if (!error) {
      setDone(true)
      setTimeout(() => onDone(), 1500)
    } else {
      alert('Something went wrong.')
    }
    setSubmitting(false)
  }

  if (done) return (
    <div className="screen" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>⚡</div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#f0f6ff', marginBottom: '8px' }}>Performance logged!</h2>
      <p style={{ color: '#4a6080' }}>Keep tracking to unlock insights.</p>
    </div>
  )

  const selectedSport = SPORTS.find(s => s.key === sport)
  const stats = sport ? SPORT_STATS[sport] : []
  const metrics = sport ? PHYSICAL_METRICS[sport] : []

  return (
    <div className="screen">
      <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Performance Log</p>
      <p style={{ color: '#4a6080', fontSize: '13px', margin: '0 0 20px' }}>Track your session in detail</p>

      {/* Sport Selector */}
      <Section title="Sport / Activity">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {SPORTS.map(s => (
            <div
              key={s.key}
              onClick={() => handleSportSelect(s.key)}
              style={{
                padding: '10px 6px', borderRadius: '12px', textAlign: 'center',
                border: `1px solid ${sport === s.key ? '#0ea5e9' : '#1e2a3a'}`,
                background: sport === s.key ? '#0ea5e915' : 'transparent',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
              <p style={{ fontSize: '20px', margin: '0 0 4px' }}>{s.icon}</p>
              <p style={{ color: sport === s.key ? '#0ea5e9' : '#4a6080', fontSize: '11px', fontWeight: sport === s.key ? '600' : '400', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
        {sport === 'custom' && (
          <input
            type="text"
            placeholder="Enter your sport or activity..."
            value={customSport}
            onChange={e => setCustomSport(e.target.value)}
            style={{
              width: '100%', background: '#111820', border: '1px solid #1e2a3a',
              borderRadius: '10px', padding: '12px', color: 'white', fontSize: '14px',
              outline: 'none', marginTop: '12px'
            }}
          />
        )}
      </Section>

      {sport && (
        <>
          {/* Session Info */}
          <Section title="Session Info">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <p style={{ color: '#4a6080', fontSize: '12px', margin: '0 0 6px' }}>Duration (min)</p>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value))}
                  style={{
                    width: '100%', background: '#111820', border: '1px solid #1e2a3a',
                    borderRadius: '10px', padding: '10px', color: 'white', fontSize: '14px', outline: 'none'
                  }}
                />
              </div>
              <div>
                <p style={{ color: '#4a6080', fontSize: '12px', margin: '0 0 6px' }}>Location</p>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Gym, field, track..."
                  style={{
                    width: '100%', background: '#111820', border: '1px solid #1e2a3a',
                    borderRadius: '10px', padding: '10px', color: 'white', fontSize: '14px', outline: 'none'
                  }}
                />
              </div>
            </div>
          </Section>

          {/* Sport-Specific Stats */}
          {stats.length > 0 && (
            <Section title={`${selectedSport?.label} Stats`}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {stats.map(stat => (
                  <div key={stat.key}>
                    <p style={{ color: '#4a6080', fontSize: '12px', margin: '0 0 6px' }}>
                      {stat.label} {stat.unit ? <span style={{ color: '#2a3a4a' }}>({stat.unit})</span> : ''}
                    </p>
                    {stat.type === 'toggle' ? (
                      <div
                        onClick={() => updateStat(stat.key, !sportStats[stat.key])}
                        style={{
                          background: sportStats[stat.key] ? '#0ea5e915' : '#111820',
                          border: `1px solid ${sportStats[stat.key] ? '#0ea5e9' : '#1e2a3a'}`,
                          borderRadius: '10px', padding: '10px', textAlign: 'center',
                          cursor: 'pointer', color: sportStats[stat.key] ? '#0ea5e9' : '#4a6080',
                          fontSize: '13px', fontWeight: '600'
                        }}>
                        {sportStats[stat.key] ? 'Yes!' : 'No'}
                      </div>
                    ) : (
                      <input
                        type={stat.type === 'text' ? 'text' : 'number'}
                        step={stat.type === 'decimal' ? '0.1' : '1'}
                        placeholder={stat.placeholder}
                        value={sportStats[stat.key] || ''}
                        onChange={e => updateStat(stat.key, e.target.value)}
                        style={{
                          width: '100%', background: '#111820', border: '1px solid #1e2a3a',
                          borderRadius: '10px', padding: '10px', color: 'white',
                          fontSize: '14px', outline: 'none'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Physical Metrics */}
          <Section title="Physical Metrics">
            <SliderRow label="Overall Performance" value={overallRating} onChange={setOverallRating} />
            <SliderRow label="Confidence" value={confidence} onChange={setConfidence} />
            <SliderRow
              label="Fatigue"
              value={fatigue}
              onChange={setFatigue}
            />
            {metrics.map(m => (
              <SliderRow
                key={m}
                label={METRIC_LABELS[m] || m}
                value={physicalMetrics[m] || 7}
                onChange={val => setPhysicalMetrics(prev => ({ ...prev, [m]: val }))}
              />
            ))}
          </Section>

          {/* Notes */}
          <Section title="Notes">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Highlights, struggles, PRs, what clicked today..."
              style={{
                width: '100%', background: '#111820', border: '1px solid #1e2a3a',
                borderRadius: '10px', padding: '12px', color: 'white', fontSize: '14px',
                resize: 'none', minHeight: '80px', outline: 'none', lineHeight: '1.5'
              }}
            />
          </Section>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '16px', background: '#0ea5e9',
              color: 'white', border: 'none', borderRadius: '14px',
              fontSize: '16px', fontWeight: '700',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1, marginTop: '8px'
            }}>
            {submitting ? 'Saving...' : 'Log Performance →'}
          </button>
        </>
      )}

      {!sport && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4a6080' }}>
          <p style={{ fontSize: '14px' }}>Select a sport above to see specific metrics</p>
        </div>
      )}
    </div>
  )
}
