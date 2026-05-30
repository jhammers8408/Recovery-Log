import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'recovery_tools', label: 'Recovery Tools' },
  { key: 'supplements', label: 'Supplements' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'wearables', label: 'Wearables' },
]

const priceColors = {
  '$': '#2ecc71',
  '$$': '#0ea5e9',
  '$$$': '#f59e0b',
  '$$$$': '#e74c3c',
}

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    window.open(product.amazon_url, '_blank')
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{
        background: '#0d1520',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '12px',
        border: `0.5px solid ${hovered ? '#0ea5e940' : '#1e2a3a'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none'
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#f0f6ff', fontSize: '15px', fontWeight: '600', margin: '0 0 3px' }}>{product.name}</p>
          <p style={{ color: '#4a6080', fontSize: '12px', margin: '0' }}>{product.brand}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ color: priceColors[product.price_range] || '#4a6080', fontSize: '13px', fontWeight: '700' }}>{product.price_range}</span>
          {product.is_featured && (
            <span style={{ background: '#f59e0b15', border: '1px solid #f59e0b30', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: '#f59e0b' }}>Featured</span>
          )}
        </div>
      </div>

      <p style={{ color: '#8aa0b8', fontSize: '13px', lineHeight: '1.5', margin: '0 0 12px' }}>{product.description}</p>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {product.tags?.map(tag => (
          <span key={tag} style={{ background: '#0ea5e910', border: '1px solid #0ea5e920', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: '#0ea5e9', textTransform: 'capitalize' }}>{tag.replace(/_/g, ' ')}</span>
        ))}
      </div>

      <div style={{ background: '#0ea5e9', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
        <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: '0' }}>View on Amazon →</p>
      </div>

      <p style={{ color: '#2a3a4a', fontSize: '10px', textAlign: 'center', margin: '8px 0 0' }}>
        As an Amazon Associate we earn from qualifying purchases
      </p>
    </div>
  )
}

export default function Shop({ user, recommendedActions }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [recommended, setRecommended] = useState([])

  useEffect(() => { fetchProducts() }, [category]) // eslint-disable-line

  const fetchProducts = async () => {
    let query = supabase.from('affiliate_products').select('*').order('is_featured', { ascending: false })
    if (category !== 'all') query = query.eq('category', category)
    const { data } = await query
    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    if (recommendedActions && recommendedActions.length > 0) {
      fetchRecommended()
    }
  }, [recommendedActions]) // eslint-disable-line

  const fetchRecommended = async () => {
    if (!recommendedActions || recommendedActions.length === 0) return
    const { data } = await supabase
      .from('affiliate_products')
      .select('*')
      .overlaps('recovery_actions', recommendedActions.map(a => a.action))
      .limit(3)
    if (data) setRecommended(data)
  }

  return (
    <div className="screen">
      <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Recovery Shop</p>
      <p style={{ color: '#4a6080', fontSize: '13px', margin: '0 0 20px' }}>Curated gear and supplements for athletes</p>

      {recommended.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #0ea5e915, #9b59b615)', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '0.5px solid #0ea5e930' }}>
          <p style={{ color: '#0ea5e9', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px', fontWeight: '700' }}>Recommended for you today</p>
          {recommended.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setCategory(cat.key)} style={{ padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap', backgroundColor: category === cat.key ? '#0ea5e9' : '#0d1520', color: category === cat.key ? 'white' : '#4a6080', transition: 'all 0.2s' }}>
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#4a6080', textAlign: 'center', padding: '40px' }}>Loading products...</p>
      ) : (
        products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  )
}
