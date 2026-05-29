import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
  const colors = {
    success: { bg: '#0d1520', border: '#2ecc7140', icon: '#2ecc71' },
    error: { bg: '#0d1520', border: '#e74c3c40', icon: '#e74c3c' },
    warning: { bg: '#0d1520', border: '#f59e0b40', icon: '#f59e0b' },
    info: { bg: '#0d1520', border: '#0ea5e940', icon: '#0ea5e9' },
  }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: 'fixed', top: '20px', left: '50%',
        transform: 'translateX(-50%)',
        width: '90%', maxWidth: '380px',
        zIndex: 9999, display: 'flex',
        flexDirection: 'column', gap: '8px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => {
          const c = colors[toast.type] || colors.info
          return (
            <div key={toast.id} style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              animation: 'slideDown 0.3s ease',
            }}>
              <span style={{ fontSize: '18px' }}>{icons[toast.type]}</span>
              <p style={{ color: '#f0f6ff', fontSize: '14px', margin: 0, fontWeight: '500' }}>{toast.message}</p>
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
