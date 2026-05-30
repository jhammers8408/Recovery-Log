import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { ShoppingBag } from 'lucide-react'

export default function ProductRecommendation({ actions, tags, title, compact }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, []) // eslint-disable-line

  const fetchProducts = async () => {
    let data = []

    if (actions && actions.length > 0) {
      for (const action of actions) {
        const { data: result } = await supabase
          .from('affiliate_products')
          .select('*')
          .contains('recovery_actions', [action])
          .limit(1)
        if (result && result.length > 0) {
          data = [...data, ...result]
          break
        }
      }
    }

    if (data.length === 0 && tags && tags.length > 0) {
      for (const tag of tags) {
        const { data: result } = await supabase
          .from('affiliate_products')
          .select('*')
          .contains('tags', [tag])
          .limit(compact ? 1 : 2)
        if (result && result.length > 0) {
          data = [...data, ...result]
          break
        }
      }
    }

    if (data.length === 0) {
      const { data: featured } = await supabase
        .from('affiliate_products')
        .select('*')
        .eq('is_featured', true)
        .limit(compact ? 1 : 2)
      if (featured) data = featured
    }

    setProducts(compact ? data.slice(0, 1) : data.slice(0, 2))
  }

  if (products.length === 0) return null

  if (compact) {
    const product = products[0]
    return (
      <div
        onClick={() => window.open(product.amazon_url, '_blank')}
        style={{
          background: '#111820',
          borderRadius: '12px',
          padding: '12px 14px',
          marginTop: '10px',
          border: '0.5px solid #f59e0b30',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.15s'
        }}>
        <ShoppingBag size={16} color="#f59e0b" />
        <div style={{ flex: 1 }}>
          <p style={{ color: '#f0f6ff', fontSize: '12px', fontWeight: '600', margin: '0 0 1px' }}>{product.name}</p>
          <p style={{ color: '#4a6080', fontSize: '11px', margin: '0' }}>{product.brand} · View on Amazon</p>
        </div>
        <p style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '700', margin: '0' }}>{product.price_range}</p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{ color: '#4a6080', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>
        {title || 'Recommended for this'}
      </p>
      {products.map(product => (
        <div
          key={product.id}
          onClick={() => window.open(product.amazon_url, '_blank')}
          style={{
            background: '#0d1520',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '8px',
            border: '0.5px solid #f59e0b30',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.15s'
          }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f59e0b15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShoppingBag size={18} color="#f59e0b" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#f0f6ff', fontSize: '14px', fontWeight: '600', margin: '0 0 2px' }}>{product.name}</p>
            <p style={{ color: '#4a6080', fontSize: '12px', margin: '0 0 4px' }}>{product.brand} · {product.price_range}</p>
            <p style={{ color: '#8aa0b8', fontSize: '12px', margin: '0', lineHeight: '1.4' }}>{product.description}</p>
          </div>
          <p style={{ color: '#0ea5e9', fontSize: '12px', fontWeight: '600', margin: '0', whiteSpace: 'nowrap' }}>View →</p>
        </div>
      ))}
      <p style={{ color: '#2a3a4a', fontSize: '10px', textAlign: 'center', margin: '4px 0 0' }}>
        As an Amazon Associate we earn from qualifying purchases
      </p>
    </div>
  )
}