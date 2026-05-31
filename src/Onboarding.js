import React, { useState } from 'react'

const slides = [
  {
    icon: '📊',
    title: 'Track What Actually Matters',
    description: 'Log sleep, energy, soreness, stress and hydration every morning in under 60 seconds. Your data tells a story.',
    color: '#0ea5e9',
    bg: '#0ea5e915',
  },
  {
    icon: '🧠',
    title: 'AI That Learns Your Body',
    description: 'Our AI analyzes your patterns and finds what actually improves YOUR performance — not generic advice.',
    color: '#9b59b6',
    bg: '#9b59b615',
  },
  {
    icon: '🔬',
    title: 'Run Controlled Experiments',
    description: 'Test if magnesium improves your sleep, or if cold plunges reduce soreness. Get real data on what works for you.',
    color: '#2ecc71',
    bg: '#2ecc7115',
  },
  {
    icon: '🍎',
    title: 'AI Food Scanner',
    description: 'Snap a photo of any meal and instantly get full nutrition data. Hit your protein and calorie targets every day.',
    color: '#f59e0b',
    bg: '#f59e0b15',
  },
]

export default function Onboarding({ onDone }) {
  const [current, setCurrent] = useState(0)

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1)
    } else {
      onDone()
    }
  }

  const skip = () => onDone()

  const slide = slides[current]
  const isLast = current === slides.length - 1

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080d13',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '60px 32px 48px',
    }}>
      {/* Skip button */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        {!isLast && (
          <button onClick={skip} style={{ background: 'transparent', border: 'none', color: '#4a6080', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>
            Skip
          </button>
        )}
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '340px' }}>
        {/* Icon */}
        <div style={{
          width: '120px', height: '120px', borderRadius: '32px',
          background: slide.bg, border: `1px solid ${slide.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '56px', marginBottom: '40px',
          boxShadow: `0 0 60px ${slide.color}20`
        }}>
          {slide.icon}
        </div>

        <h1 style={{
          color: '#f0f6ff', fontSize: '28px', fontWeight: '800',
          lineHeight: '1.2', margin: '0 0 16px'
        }}>
          {slide.title}
        </h1>

        <p style={{
          color: '#8aa0b8', fontSize: '16px', lineHeight: '1.6', margin: '0'
        }}>
          {slide.description}
        </p>
      </div>

      {/* Bottom section */}
      <div style={{ width: '100%', maxWidth: '340px' }}>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === current ? slide.color : '#1e2a3a',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={next}
          style={{
            width: '100%', padding: '18px',
            background: `linear-gradient(135deg, ${slide.color}, ${slide.color}cc)`,
            color: 'white', border: 'none', borderRadius: '16px',
            fontSize: '17px', fontWeight: '700', cursor: 'pointer',
            boxShadow: `0 8px 32px ${slide.color}40`,
            transition: 'all 0.3s ease',
          }}>
          {isLast ? 'Get Started →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
