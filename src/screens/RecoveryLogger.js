import React, { useState } from 'react'
import { supabase } from '../supabase'
import ProductRecommendation from '../ProductRecommendation'

const recoveryOptions = [
  { key: 'ice_bath', label: 'Ice Bath', emoji: '🧊' },
  { key: 'sauna', label: 'Sauna', emoji: '🔥' },
  { key: 'massage_gun', label: 'Massage Gun', emoji: '🔫' },
  { key: 'stretching', label: 'Stretching', emoji: '🧘' },
  { key: 'mobility', label: 'Mobility Work', emoji: '🔄' },
  { key: 'cold_shower', label: 'Cold Shower', emoji: '🚿' },
  { key: 'compression', label: 'Compression', emoji: '🦵' },
  { key: 'nap', label: 'Nap', emoji: '💤' },
  { key: 'meditation', label: 'Meditation', emoji: '🧠' },
  { key: 'protein_shake', label: 'Protein Shake', emoji: '🥤' },
  { key: 'electrolytes', label: 'Electrolytes', emoji: '⚡' },
  { key: 'magnesium', label: 'Magnesium', emoji: '💊' },
  { key: 'creatine', label: 'Creatine', emoji: '💪' },
  { key: 'foam_roll', label: 'Foam Roll', emoji: '🎯' },
  { key: 'walk', label: 'Light Walk', emoji: '🚶' },
  { key: 'swimming', label: 'Swimming', emoji: '🏊' },
  { key: 'yoga', label: 'Yoga', emoji: '🧘' },
  { key: 'sleep_early', label: 'Early Sleep', emoji: '🌙' },
]

export default function RecoveryLogger({ user, onDone, priorities }) {
  const [selected, setSelected] = useState([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const toggle = (key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const handleSubmit = async () => {
    if (selected.length === 0) return alert('Please select at least one recovery action')
    setSubmitting(true)
    const { error } = await supabase.from('recovery_actions').insert([{
      user_id: user.id,
      log_date: new Date().toISOString().split('T')[0],
      actions: selected,
      notes,
    }])
    if (!error) {
      setDone(true)
      setTimeout(() => onDone(), 1200)
    } else {
      alert('Something went wrong.')
    }
    setSubmitting(false)
  }

  if (done) return (
    <div className="screen" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>💪</div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#f0f6ff', marginBottom: '8px' }}>Recovery logged!</h2>
      <p style={{ color: '#4a6080' }}>{selected.length} actions tracked.</p>
    </div>
  )

  const priorityKeys = priorities ? priorities.map(p => p.action) : []
  const recommendedOptions = recoveryOptions.filter(o => priorityKeys.includes(o.key))
  const otherOptions = recoveryOptions.filter(o => !priorityKeys.includes(o.key))

  return (
    <div className="screen">
      <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Recovery Logger</p>
      <p style={{ color: '#4a6080', fontSize: '13px', margin: '0 0 20px' }}>What did you do to recover today?</p>

      {/* Smart Recommendations */}
      {recommendedOptions.length > 0 && (
        <div style={{
          background: '#0d1520', borderRadius: '14px', padding: '16px',
          marginBottom: '10px', border: '0.5px solid #0ea5e930'
        }}>
          <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>
            Recommended for you today
          </p>
          <p style={{ color: '#4a6080', fontSize: '12px', margin: '0 0 12px' }}>
            Based on your recent check-in data
          </p>
          <div className="chip-grid">
            {recommendedOptions.map(opt => (
              <div
                key={opt.key}
                className={`chip ${selected.includes(opt.key) ? 'selected' : ''}`}
                onClick={() => toggle(opt.key)}
                style={{ position: 'relative', borderColor: selected.includes(opt.key) ? '#0ea5e9' : '#0ea5e940' }}>
                {opt.emoji} {opt.label}
                <span style={{ marginLeft: '4px', fontSize: '10px', color: '#0ea5e9', fontWeight: '700' }}>★</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Recovery Options */}
      <div style={{
        background: '#0d1520', borderRadius: '14px', padding: '16px',
        marginBottom: '10px', border: '0.5px solid #1e2a3a'
      }}>
        <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>
          All recovery actions
        </p>
        <div className="chip-grid">
          {otherOptions.map(opt => (
            <div
              key={opt.key}
              className={`chip ${selected.includes(opt.key) ? 'selected' : ''}`}
              onClick={() => toggle(opt.key)}>
              {opt.emoji} {opt.label}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Count & Notes */}
      {selected.length > 0 && (
  <div style={{
    background: '#0d1520', borderRadius: '14px', padding: '16px',
    marginBottom: '10px', border: '0.5px solid #1e2a3a'
  }}>
    <p style={{ color: '#0ea5e9', fontSize: '13px', fontWeight: '600', margin: '0 0 10px' }}>
      {selected.length} action{selected.length > 1 ? 's' : ''} selected
    </p>
    <textarea
      value={notes}
      onChange={e => setNotes(e.target.value)}
      placeholder="Any notes about your recovery today? (optional)"
      style={{
        width: '100%', backgroundColor: '#111820', border: '1px solid #1e2a3a',
        borderRadius: '10px', padding: '12px', color: 'white', fontSize: '14px',
        resize: 'none', minHeight: '80px', outline: 'none', lineHeight: '1.5'
      }}
    />
    <ProductRecommendation
      actions={selected}
      title="Recommended gear for your recovery"
    />
  </div>
)}

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={submitting}
        style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
        {submitting ? 'Saving...' : `Log ${selected.length > 0 ? selected.length : ''} Recovery Actions →`}
      </button>
    </div>
  )
}
