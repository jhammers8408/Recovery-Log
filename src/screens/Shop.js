import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { ShoppingBag } from 'lucide-react'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'recovery_tools', label: 'Recovery' },
  { key: 'supplements', label: 'Supplements' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'performance_gear', label: 'Performance' },
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

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.open(product.amazon_url, '_blank')}
      style={{
        background: '#0d1520',
        borderRadius: '14px',
        padding: '14px',
        border: `0.5px solid ${hovered ? '#0ea5e940' : '#1e2a3a'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0ea5e915', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShoppingBag size={16} color="#0ea5e9" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ color: priceColors[product.price_range] || '#4a6080', fontSize: '13px', fontWeight: '700' }}>{product.price_range}</span>
          {product.is_featured && (
            <span style={{ background: '#f59e0b15', border: '1px solid #f59e0b30', borderRadius: '4px', padding: '1px 6px', fontSize: '9px', color: '#f59e0b' }}>Featured</span>
          )}
        </div>
      </div>

      <div>
        <p style={{ color: '#f0f6ff', fontSize: '13px', fontWeight: '600', margin: '0 0 2px', lineHeight: '1.3' }}>{product.name}</p>
        <p style={{ color: '#4a6080', fontSize: '11px', margin: '0' }}>{product.brand}</p>
      </div>

      <p style={{ color: '#8aa0b8', fontSize: '11px', lineHeight: '1.4', margin: '0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>

      <div style={{ background: '#0ea5e9', borderRadius: '8px', padding: '7px', textAlign: 'center', marginTop: 'auto' }}>
        <p style={{ color: 'white', fontSize: '11px', fontWeight: '600', margin: '0' }}>View on Amazon →</p>
      </div>
    </div>
  )
}

export default function Shop({ user, recommendedActions }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [recommended, setRecommended] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { fetchProducts() }, [category]) // eslint-disable-line

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase.from('affiliate_products').select('*').order('is_featured', { ascending: false })
    if (category !== 'all') query = query.eq('category', category)
    const { data } = await query
    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    if (recommendedActions && recommendedActions.length > 0) fetchRecommended()
  }, [recommendedActions]) // eslint-disable-line

  const fetchRecommended = async () => {
    if (!recommendedActions || recommendedActions.length === 0) return
    const { data } = await supabase
      .from('affiliate_products')
      .select('*')
      .contains('recovery_actions', [recommendedActions[0]?.action])
      .limit(2)
    if (data) setRecommended(data)
  }

  const filtered = products.filter(p =>
    search === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="screen">
      <p style={{ color: '#f0f6ff', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Recovery Shop</p>
      <p style={{ color: '#4a6080', fontSize: '13px', margin: '0 0 16px' }}>Curated gear and supplements for athletes</p>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search products..."
        style={{
          width: '100%', background: '#0d1520', border: '1px solid #1e2a3a',
          borderRadius: '12px', padding: '12px 14px', color: 'white',
          fontSize: '14px', outline: 'none', marginBottom: '14px'
        }}
      />

      {/* Recommended */}
      {recommended.length > 0 && search === '' && (
        <div style={{ background: 'linear-gradient(135deg, #0ea5e915, #9b59b615)', borderRadius: '14px', padding: '14px', marginBottom: '16px', border: '0.5px solid #0ea5e930' }}>
          <p style={{ color: '#0ea5e9', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px', fontWeight: '700' }}>Recommended for you today</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {recommended.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setCategory(cat.key)} style={{
            padding: '7px 12px', borderRadius: '20px', border: 'none',
            cursor: 'pointer', fontWeight: '600', fontSize: '11px',
            whiteSpace: 'nowrap',
            backgroundColor: category === cat.key ? '#0ea5e9' : '#0d1520',
            color: category === cat.key ? 'white' : '#4a6080',
            transition: 'all 0.2s'
          }}>{cat.label}</button>
        ))}
      </div>

      {/* Product Count */}
      <p style={{ color: '#4a6080', fontSize: '12px', margin: '0 0 12px' }}>{filtered.length} products</p>

      {loading ? (
        <p style={{ color: '#4a6080', textAlign: 'center', padding: '40px' }}>Loading products...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#4a6080', textAlign: 'center', padding: '40px' }}>No products found</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <p style={{ color: '#2a3a4a', fontSize: '10px', textAlign: 'center', margin: '16px 0 0' }}>
        As an Amazon Associate we earn from qualifying purchases
      </p>
    </div>
  )
}
