import React from 'react'

export function SkeletonBlock({ width, height, borderRadius, style }) {
  return (
    <div style={{
      width: width || '100%',
      height: height || '16px',
      borderRadius: borderRadius || '8px',
      background: 'linear-gradient(90deg, #0d1520 25%, #1e2a3a 50%, #0d1520 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style
    }} />
  )
}

export function HomeScreenSkeleton() {
  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <SkeletonBlock width="80px" height="12px" style={{ marginBottom: '8px' }} />
          <SkeletonBlock width="140px" height="22px" />
        </div>
        <SkeletonBlock width="44px" height="44px" borderRadius="50%" />
      </div>
      <SkeletonBlock height="160px" borderRadius="20px" style={{ marginBottom: '12px' }} />
      <SkeletonBlock height="80px" borderRadius="16px" style={{ marginBottom: '12px' }} />
      <SkeletonBlock height="60px" borderRadius="16px" style={{ marginBottom: '12px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <SkeletonBlock height="90px" borderRadius="14px" />
        <SkeletonBlock height="90px" borderRadius="14px" />
        <SkeletonBlock height="90px" borderRadius="14px" />
        <SkeletonBlock height="90px" borderRadius="14px" />
      </div>
      <SkeletonBlock height="100px" borderRadius="16px" />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

export function InsightsScreenSkeleton() {
  return (
    <div style={{ padding: '20px 16px' }}>
      <SkeletonBlock width="120px" height="22px" style={{ marginBottom: '8px' }} />
      <SkeletonBlock width="200px" height="13px" style={{ marginBottom: '20px' }} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <SkeletonBlock height="40px" borderRadius="10px" />
        <SkeletonBlock height="40px" borderRadius="10px" />
        <SkeletonBlock height="40px" borderRadius="10px" />
      </div>
      <SkeletonBlock height="160px" borderRadius="16px" style={{ marginBottom: '12px' }} />
      <SkeletonBlock height="80px" borderRadius="14px" style={{ marginBottom: '10px' }} />
      <SkeletonBlock height="80px" borderRadius="14px" style={{ marginBottom: '10px' }} />
      <SkeletonBlock height="80px" borderRadius="14px" />
    </div>
  )
}
