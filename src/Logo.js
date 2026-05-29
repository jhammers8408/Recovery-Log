import React from 'react'

export function LogoIcon({ size = 48, borderRadius = 16 }) {
  const s = size
  const cx = s / 2
  const r = s * 0.34
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={s} height={s} rx={borderRadius} fill="#0d1520"/>
      <circle cx={cx} cy={cx} r={r + 10} fill="#0ea5e908"/>
      <path
        d={`M ${cx - r * 0.84} ${cx + r * 0.54} A ${r} ${r} 0 1 1 ${cx + r * 0.84} ${cx + r * 0.54}`}
        fill="none" stroke="#0ea5e9" strokeWidth={s * 0.09} strokeLinecap="round"
      />
      <polyline
        points={`${cx + r * 0.5},${cx + r * 0.88} ${cx + r * 0.84},${cx + r * 0.54} ${cx + r * 1.1},${cx + r * 0.72}`}
        fill="none" stroke="#0ea5e9" strokeWidth={s * 0.09} strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx={cx} cy={cx} r={s * 0.1} fill="#38bdf8"/>
      <circle cx={cx} cy={cx} r={s * 0.04} fill="#080d13"/>
    </svg>
  )
}

export function LogoFull({ size = 48 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <LogoIcon size={size} borderRadius={size * 0.3} />
      <div>
        <div style={{ lineHeight: 1 }}>
          <span style={{ color: '#f0f6ff', fontSize: size * 0.45, fontWeight: '800', letterSpacing: '-0.5px' }}>Recovery</span>
          <span style={{ color: '#0ea5e9', fontSize: size * 0.45, fontWeight: '800', letterSpacing: '-0.5px' }}>Log</span>
        </div>
        <div style={{ color: '#4a6080', fontSize: size * 0.17, letterSpacing: '1.5px', marginTop: '2px' }}>PERFORMANCE INTELLIGENCE</div>
      </div>
    </div>
  )
}
