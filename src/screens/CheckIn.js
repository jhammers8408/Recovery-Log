import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const nutritionOptions = [
  'High protein', 'High carb', 'Low carb', 'High fat',
  'Intermittent fasting', 'Ate clean', 'Cheat meal', 'Skipped meals'
]

function SliderRow({ label, value, min, max, step, unit, onChange, color }) {
  const pct = ((value - min) / (max - min)) * 100
  const c = color || '#0ea5e9'
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <p style={{ color: '#f0f6ff', fontSize: '13px', margin: 0 }}>{label}</p>
        <p style={{ color: c, fontSize: '13px', fontWeight: '600', margin: 0 }}>{value}{unit}</p>
      </div>
      <input type="range" min={min} max={max} step={step || 1} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: c }} />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#0d1520', borderRadius: '14px', padding: '16px', marginBottom: '10px', border: '0.5px solid #1e2a3a' }}>
      <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 14px' }}>{title}</p>
      {children}
    </div>
  )
}

export default function CheckIn({ user, onDone }) {
  const [streak, setStreak] = useState(0)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const [sleep_hours, setSleepHours] = useState(7)
  const [sleep_quality, setSleepQuality] = useState(7)
  const [energy, setEnergy] = useState(7)
  const [soreness, setSoreness] = useState(3)
  const [motivation, setMotivation] = useState(7)
  const [stress, setStress] = useState(3)
  const [mood, setMood] = useState(7)
  const [hydration, setHydration] = useState(7)
  const [water_oz, setWaterOz] = useState(64)
  const [bodyweight, setBodyweight] = useState('')
  const [nutrition_tags, setNutritionTags] = useState([])
  const [notes, setNotes] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    checkTodayAndStreak()
  }, []) // eslint-disable-line

  const checkTodayAndStreak = async () => {
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('log_date')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(30)

    if (!logs) return

    if (logs.some(l => l.log_date === today)) {
      setAlreadyDone(true)
    }

    let s = 0
    const check = new Date()
    for (let i = 0; i < 30; i++) {
      const d = check.toISOString().split('T')[0]
      if (logs.some(l => l.log_date === d)) {
        s++
        check.setDate(check.getDate() - 1)
      } else break
    }
    setStreak(s)
  }

  const toggleNutrition = (tag) => {
    setNutritionTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const getSliderColor = (key, value) => {
    if (key === 'soreness' || key === 'stress') {
      if (value <= 3) return '#2ecc71'
      if (value <= 6) return '#f59e0b'
      return '#e74c3c'
    }
    if (value >= 8) return '#2ecc71'
    if (value >= 5) return '#0ea5e9'
    return '#f59e0b'
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const { error } = await supabase.from('daily_logs').insert([{
      user_id: user.id,
      log_date: today,
      sleep_hours,
      sleep_quality,
      energy,
      soreness,
      motivation,
      stress,
      mood,
      hydration,
      water_oz,
      bodyweight: bodyweight || null,
      nutrition_tags,
      notes,
    }])
    if (!error) {
      setDone(true)
      setTimeout(() => onDone(), 1500)
    } else {
      alert('Something went wrong, try again.')
    }
    setSubmitting(false)
  }

  if (done) return (
    <div className="screen" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#f0f6ff', marginBottom: '8px' }}>Check-in complete!</h2>
      <p style={{ color: '#4a6080' }}>Day {streak + 1} logged. Keep the streak alive.</p>
    </div>
  )

  if (alreadyDone) return (
    <div className="screen" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#f0f6ff', marginBottom: '8px' }}>Already checked in today!</h2>
      <p style={{ color: '#4a6080', marginBottom: '24px' }}>Come back tomorrow to keep your streak going.</p>
      <div style={{ background: '#0ea5e915', border: '1px solid #0ea5e930', borderRadius: '14px', padding: '16px', display: 'inline-block' }}>
        <p style={{ color: '#0ea5e9', fontSize: '32px', fontWeight: '800', margin: '0' }}>{streak}</p>
        <p style={{ color: '#4a6080', fontSize: '12px', margin: '4px 0 0' }}>day streak</p>
      </div>
    </div>
  )

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="screen">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Morning Check-In</p>
          <p style={{ color: '#4a6080', fontSize: '13px', margin: '0' }}>{dateStr}</p>
        </div>
        {streak > 0 && (
          <div style={{ background: '#0ea5e915', border: '1px solid #0ea5e930', borderRadius: '12px', padding: '8px 12px', textAlign: 'center' }}>
            <p style={{ color: '#0ea5e9', fontSize: '18px', fontWeight: '700', margin: '0' }}>{streak}</p>
            <p style={{ color: '#4a6080', fontSize: '9px', margin: '0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>day streak</p>
          </div>
        )}
      </div>

      <Section title="Sleep">
        <SliderRow label="Hours slept" value={sleep_hours} min={3} max={12} step={0.5} unit="h" onChange={setSleepHours} color={getSliderColor('sleep', sleep_hours)} />
        <SliderRow label="Sleep quality" value={sleep_quality} min={1} max={10} unit="/10" onChange={setSleepQuality} color={getSliderColor('sleep_quality', sleep_quality)} />
      </Section>

      <Section title="Body & Energy">
        <SliderRow label="Energy level" value={energy} min={1} max={10} unit="/10" onChange={setEnergy} color={getSliderColor('energy', energy)} />
        <SliderRow label="Muscle soreness" value={soreness} min={1} max={10} unit="/10" onChange={setSoreness} color={getSliderColor('soreness', soreness)} />
        <SliderRow label="Motivation" value={motivation} min={1} max={10} unit="/10" onChange={setMotivation} color={getSliderColor('motivation', motivation)} />
        <SliderRow label="Stress level" value={stress} min={1} max={10} unit="/10" onChange={setStress} color={getSliderColor('stress', stress)} />
        <SliderRow label="Mood" value={mood} min={1} max={10} unit="/10" onChange={setMood} color={getSliderColor('mood', mood)} />
      </Section>

      <Section title="Nutrition & Hydration">
        <SliderRow label="Water consumed" value={water_oz} min={0} max={200} step={4} unit=" oz" onChange={setWaterOz} color="#0ea5e9" />
        <div style={{ marginBottom: '14px' }}>
          <p style={{ color: '#f0f6ff', fontSize: '13px', margin: '0 0 8px' }}>Nutrition today</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {nutritionOptions.map(tag => (
              <div key={tag}
                onClick={() => toggleNutrition(tag)}
                style={{
                  padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                  background: nutrition_tags.includes(tag) ? '#0ea5e915' : '#1a1a2e',
                  border: `1px solid ${nutrition_tags.includes(tag) ? '#0ea5e9' : '#1e2a3a'}`,
                  color: nutrition_tags.includes(tag) ? '#0ea5e9' : '#4a6080',
                  fontWeight: nutrition_tags.includes(tag) ? '600' : '400',
                  transition: 'all 0.15s'
                }}>{tag}</div>
            ))}
          </div>
        </div>
        <div>
          <p style={{ color: '#f0f6ff', fontSize: '13px', margin: '0 0 8px' }}>Bodyweight <span style={{ color: '#4a6080', fontWeight: '400' }}>(optional)</span></p>
          <input
            type="number"
            placeholder="lbs"
            value={bodyweight}
            onChange={e => setBodyweight(e.target.value)}
            style={{
              width: '100%', background: '#111820', border: '1px solid #1e2a3a',
              borderRadius: '10px', padding: '12px', color: 'white', fontSize: '15px', outline: 'none'
            }}
          />
        </div>
      </Section>

      <Section title="Notes">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anything else worth noting today? Injury, travel, sick, big game..."
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
          fontSize: '16px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.7 : 1, marginTop: '8px'
        }}>
        {submitting ? 'Saving...' : 'Complete Check-In →'}
      </button>

    </div>
  )
}
