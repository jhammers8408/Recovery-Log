import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function getRecoveryScore(log) {
  if (!log) return null
  return Math.round(
    (log.sleep_quality * 0.3 +
    log.energy * 0.25 +
    (10 - log.soreness) * 0.2 +
    log.hydration * 0.15 +
    log.motivation * 0.1) * 10
  )
}

function getScoreColor(score) {
  if (score >= 80) return '#2ecc71'
  if (score >= 60) return '#0ea5e9'
  if (score >= 40) return '#f59e0b'
  return '#e74c3c'
}

export default function Journal({ user }) {
  const [logs, setLogs] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [currentMonth]) // eslint-disable-line

  const fetchLogs = async () => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', start.toISOString().split('T')[0])
      .lte('log_date', end.toISOString().split('T')[0])

    if (data) setLogs(data)
    setLoading(false)
  }

  const handleDayClick = (dateStr) => {
    const log = logs.find(l => l.log_date === dateStr)
    setSelectedDate(dateStr)
    setSelectedLog(log || null)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    setSelectedDate(null)
    setSelectedLog(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    setSelectedDate(null)
    setSelectedLog(null)
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const today = new Date().toISOString().split('T')[0]
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const logDates = new Set(logs.map(l => l.log_date))

  const score = selectedLog ? getRecoveryScore(selectedLog) : null
  const scoreColor = score ? getScoreColor(score) : '#4a6080'

  return (
    <div className="screen">

      <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Training Journal</p>
      <p style={{ color: '#4a6080', fontSize: '13px', margin: '0 0 20px' }}>Tap any day to see your log</p>

      <div style={{ background: '#0d1520', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '0.5px solid #1e2a3a' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ color: '#f0f6ff', fontSize: '16px', fontWeight: '500', margin: 0 }}>{monthName}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={prevMonth} style={{ background: '#1e2a3a', border: 'none', color: '#f0f6ff', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>‹</button>
            <button onClick={nextMonth} style={{ background: '#1e2a3a', border: 'none', color: '#f0f6ff', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>›</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <p key={i} style={{ color: '#4a6080', fontSize: '11px', textAlign: 'center', margin: 0, paddingBottom: '4px' }}>{d}</p>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const hasLog = logDates.has(dateStr)
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDate
            const isFuture = dateStr > today

            return (
              <div
                key={day}
                onClick={() => !isFuture && handleDayClick(dateStr)}
                style={{
                  height: '36px', borderRadius: '8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: isFuture ? 'default' : 'pointer',
                  background: isSelected ? '#0ea5e9' : hasLog ? '#0ea5e920' : isToday ? '#1e2a3a' : 'transparent',
                  border: isToday && !isSelected ? '1px solid #0ea5e950' : '1px solid transparent',
                  transition: 'all 0.15s'
                }}>
                <p style={{
                  color: isSelected ? '#fff' : hasLog ? '#0ea5e9' : isFuture ? '#2a3a4a' : '#8aa0b8',
                  fontSize: '13px', fontWeight: hasLog || isSelected ? '700' : '400', margin: 0
                }}>{day}</p>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '0.5px solid #1e2a3a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#0ea5e920', border: '1px solid #0ea5e9' }} />
            <p style={{ color: '#4a6080', fontSize: '11px', margin: 0 }}>Logged</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#1e2a3a', border: '1px solid #0ea5e950' }} />
            <p style={{ color: '#4a6080', fontSize: '11px', margin: 0 }}>Today</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'transparent' }} />
            <p style={{ color: '#4a6080', fontSize: '11px', margin: 0 }}>No log</p>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div style={{ background: '#0d1520', borderRadius: '16px', padding: '16px', border: `0.5px solid ${selectedLog ? '#0ea5e940' : '#1e2a3a'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ color: '#f0f6ff', fontSize: '15px', fontWeight: '500', margin: 0 }}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            {score && (
              <div style={{ background: `${scoreColor}15`, border: `1px solid ${scoreColor}40`, borderRadius: '8px', padding: '4px 10px' }}>
                <p style={{ color: scoreColor, fontSize: '12px', fontWeight: '600', margin: 0 }}>Score: {score}</p>
              </div>
            )}
          </div>

          {selectedLog ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Sleep', value: `${selectedLog.sleep_hours}h — ${selectedLog.sleep_quality}/10` },
                { label: 'Energy', value: `${selectedLog.energy}/10` },
                { label: 'Soreness', value: `${selectedLog.soreness}/10` },
                { label: 'Motivation', value: `${selectedLog.motivation}/10` },
                { label: 'Stress', value: `${selectedLog.stress}/10` },
                { label: 'Mood', value: `${selectedLog.mood || '—'}/10` },
                { label: 'Water', value: selectedLog.water_oz ? `${selectedLog.water_oz} oz` : '—' },
                { label: 'Bodyweight', value: selectedLog.bodyweight ? `${selectedLog.bodyweight} lbs` : '—' },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ color: '#4a6080', fontSize: '11px', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ color: '#f0f6ff', fontSize: '13px', fontWeight: '500', margin: 0 }}>{item.value}</p>
                </div>
              ))}
              {selectedLog.nutrition_tags && selectedLog.nutrition_tags.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: '#4a6080', fontSize: '11px', margin: '0 0 6px' }}>Nutrition</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedLog.nutrition_tags.map(tag => (
                      <div key={tag} style={{ background: '#0ea5e915', border: '1px solid #0ea5e930', borderRadius: '8px', padding: '3px 10px' }}>
                        <p style={{ color: '#0ea5e9', fontSize: '11px', margin: 0 }}>{tag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedLog.notes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: '#4a6080', fontSize: '11px', margin: '0 0 4px' }}>Notes</p>
                  <p style={{ color: '#8aa0b8', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>"{selectedLog.notes}"</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#4a6080', fontSize: '14px', margin: 0 }}>No check-in logged for this day.</p>
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div style={{ background: '#0d1520', borderRadius: '16px', padding: '24px', border: '0.5px solid #1e2a3a', textAlign: 'center' }}>
          <p style={{ color: '#4a6080', fontSize: '14px', margin: 0 }}>Tap a day on the calendar to see your log</p>
        </div>
      )}

    </div>
  )
}
