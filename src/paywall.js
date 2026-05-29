import React from 'react'

export default function Paywall({ feature, onClose }) {
  const features = {
    ai_insights: {
      title: 'AI Analysis',
      description: 'Unlock personalized AI insights that analyze your recovery patterns and tell you exactly what\'s working for your body.',
      icon: '🧠',
      perks: [
        'Deep pattern detection across all your data',
        'Personalized coaching recommendations',
        'Burnout risk detection',
        'Weekly recovery intelligence reports',
      ]
    },
    experiments: {
      title: 'Unlimited Experiments',
      description: 'You\'ve used your 3 free experiments. Upgrade to run unlimited controlled tests and discover exactly what works for you.',
      icon: '🔬',
      perks: [
        'Unlimited simultaneous experiments',
        'AI-generated experiments weekly',
        'Advanced result analysis',
        'Full experiment history',
      ]
    }
  }

  const content = features[feature] || features.ai_insights

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'flex-end',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#0d1520',
        borderRadius: '24px 24px 0 0',
        padding: '32px 24px 48px',
        width: '100%',
        border: '0.5px solid #1e2a3a',
        animation: 'slideUp 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#0ea5e915', border: '1px solid #0ea5e930', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              {content.icon}
            </div>
            <div>
              <p style={{ color: '#f0f6ff', fontSize: '18px', fontWeight: '700', margin: '0 0 2px' }}>{content.title}</p>
              <p style={{ color: '#0ea5e9', fontSize: '12px', fontWeight: '600', margin: '0' }}>Pro Feature</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#1e2a3a', border: 'none', color: '#8aa0b8', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>

        <p style={{ color: '#8aa0b8', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>{content.description}</p>

        <div style={{ background: '#111820', borderRadius: '14px', padding: '16px', marginBottom: '24px', border: '0.5px solid #1e2a3a' }}>
          <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>What you get with Pro</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {content.perks.map((perk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0ea5e915', border: '1px solid #0ea5e930', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#0ea5e9', fontSize: '11px' }}>✓</span>
                </div>
                <p style={{ color: '#f0f6ff', fontSize: '13px', margin: '0' }}>{perk}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0ea5e915, #9b59b615)', borderRadius: '14px', padding: '16px', marginBottom: '20px', border: '0.5px solid #0ea5e930', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '800', margin: '0' }}>$4.99</p>
            <p style={{ color: '#4a6080', fontSize: '12px', margin: '0' }}>per month · cancel anytime</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#2ecc71', fontSize: '12px', fontWeight: '600', margin: '0 0 2px' }}>7 days free</p>
            <p style={{ color: '#4a6080', fontSize: '11px', margin: '0' }}>then $4.99/mo</p>
          </div>
        </div>

        <button style={{
          width: '100%', padding: '16px',
          background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
          color: 'white', border: 'none', borderRadius: '14px',
          fontSize: '16px', fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 4px 20px #0ea5e930', marginBottom: '12px'
        }}>
          Start Free Trial
        </button>

        <p style={{ color: '#4a6080', fontSize: '12px', textAlign: 'center', margin: '0' }}>
          No charge for 7 days. Cancel anytime.
        </p>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
