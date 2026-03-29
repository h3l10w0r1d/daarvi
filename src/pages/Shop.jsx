import { useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Search, ChevronDown, ChevronUp, SlidersHorizontal,
  ShoppingBag, User, Menu, X, Twitter, Instagram, Youtube,
  Heart, Star,
} from 'lucide-react'
import { products } from '../data/mockData'
import { useApp } from '../context/AppContext'

// ── Design tokens (exact Figma) ──────────────────────────────────────
const G    = { fontFamily: 'Geist, sans-serif' }
const BLUE = '#2563eb'
const C_DARK  = '#0a0a0a'
const C_MID   = '#737373'
const C_LIGHT = '#f5f5f5'
const C_BORDER = '#e8e8e8'

// ── Filter config (from Figma) ────────────────────────────────────────
const CATEGORIES = ['All', 'T-Shirts', 'Shirts', 'Hoodies', 'Jackets', 'Sweaters']

const FILTER_GROUPS = [
  { id: 'brand',    label: 'Brand',       items: ['Nike','Adidas','Puma','Reebok','New Balance'] },
  { id: 'material', label: 'Material',    items: ['Cotton','Polyester','Wool','Linen'] },
  { id: 'fit',      label: 'Fit',         items: ['Regular Fit','Slim Fit','Relaxed Fit','Oversized'] },
  { id: 'price',    label: 'Price Range', items: ['Under $50','$50 – $100','$100 – $150','Over $150'] },
  { id: 'color',    label: 'Color',       items: ['Black','White','Red','Blue','Green','Yellow'] },
  { id: 'size',     label: 'Size',        items: ['XXS','XS','S','M','L','XL','XXL','XXXL'] },
]

const SORT_OPTIONS = ['Featured', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Best Selling']

// ─────────────────────────────────────────────────────────────────────
export default function Shop() {
  const { category = 'all' } = useParams()
  const { cartCount, addToCart, user } = useApp()
  const navigate = useNavigate()

  // filter state
  const [activeCategory, setActiveCategory] = useState('All')
  const [checked, setChecked]   = useState({})         // { brand: ['Nike'], size: ['M'] }
  const [filterSearch, setFilterSearch] = useState('')
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(FILTER_GROUPS.map(g => [g.id, true])))
  const [sortBy, setSortBy]     = useState('Featured')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const toggleCheck = (groupId, item) => {
    setChecked(prev => {
      const curr = prev[groupId] ?? []
      return { ...prev, [groupId]: curr.includes(item) ? curr.filter(i => i !== item) : [...curr, item] }
    })
  }

  const clearAll = () => setChecked({})

  const activeFilterCount = Object.values(checked).flat().length

  const toggleGroup = id => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }))

  // apply filters to products
  const displayed = useMemo(() => {
    let list = [...products]
    // category filter
    if (activeCategory !== 'All') {
      list = list.filter(p =>
        p.category?.toLowerCase().includes(activeCategory.toLowerCase()) ||
        p.name?.toLowerCase().includes(activeCategory.toLowerCase())
      )
    }
    // size filter
    const sizes = checked.size ?? []
    if (sizes.length) list = list.filter(p => p.sizes?.some(s => sizes.includes(s)))
    // price filter
    const prices = checked.price ?? []
    if (prices.length) {
      list = list.filter(p => prices.some(pr => {
        const v = p.priceGlobal ?? p.priceLocal ?? 0
        if (pr === 'Under $50')     return v < 50
        if (pr === '$50 – $100')    return v >= 50 && v < 100
        if (pr === '$100 – $150')   return v >= 100 && v < 150
        if (pr === 'Over $150')     return v >= 150
        return true
      }))
    }
    // sort
    if (sortBy === 'Price: Low to High')  list.sort((a,b) => (a.priceGlobal??0) - (b.priceGlobal??0))
    if (sortBy === 'Price: High to Low')  list.sort((a,b) => (b.priceGlobal??0) - (a.priceGlobal??0))
    return list
  }, [activeCategory, checked, sortBy])

  return (
    <div style={{ ...G, minHeight: '100vh', background: '#fff' }}>

      {/* ── Announcement banner ── */}
      <div style={{ background: BLUE, height: 48 }} className="flex items-center">
        <div className="max-w-[1440px] w-full mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Twitter size={16} color={C_LIGHT} strokeWidth={1.5} className="cursor-pointer opacity-90 hover:opacity-100 transition-opacity" />
            <Instagram size={16} color={C_LIGHT} strokeWidth={1.5} className="cursor-pointer opacity-90 hover:opacity-100 transition-opacity" />
            <Youtube size={16} color={C_LIGHT} strokeWidth={1.5} className="cursor-pointer opacity-90 hover:opacity-100 transition-opacity" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: C_LIGHT }}>Free shipping on orders over $75</span>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1" style={{ fontSize: 14, fontWeight: 500, color: C_LIGHT }}>USD <ChevronDown size={14} color={C_LIGHT} /></button>
            <button className="flex items-center gap-1" style={{ fontSize: 14, fontWeight: 500, color: C_LIGHT }}>English <ChevronDown size={14} color={C_LIGHT} /></button>
          </div>
        </div>
      </div>

      {/* ── Store navbar ── */}
      <header style={{ background: '#fff', borderBottom: `1px solid ${C_BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between" style={{ height: 64 }}>
          <Link to="/" style={{ ...G, fontSize: 20, fontWeight: 700, letterSpacing: '0.1em', color: C_DARK, textDecoration: 'none' }}>
            DAARVI
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {['Women','Men','Kids','Accessories','Store Locator'].map(label => (
              <Link key={label} to={`/shop/${label.toLowerCase()}`}
                style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, padding: '8px 14px', textDecoration: 'none', borderRadius: 6 }}
                className="hover:bg-gray-50 transition-colors"
              >{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-md hover:bg-gray-50 transition-colors">
              <Search size={18} color={C_DARK} strokeWidth={1.5} />
            </button>
            <Link to={user ? '/home' : '/login'} className="flex w-9 h-9 items-center justify-center rounded-md hover:bg-gray-50 transition-colors">
              <User size={18} color={C_DARK} strokeWidth={1.5} />
            </Link>
            <Link to={user ? '/checkout' : '/login'} className="relative flex w-9 h-9 items-center justify-center rounded-md hover:bg-gray-50 transition-colors">
              <ShoppingBag size={18} color={C_DARK} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: BLUE, color: '#fff', fontSize: 10, fontWeight: 700 }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button className="md:hidden flex w-9 h-9 items-center justify-center" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              <Menu size={20} color={C_DARK} />
            </button>
          </div>
        </div>
        {mobileNavOpen && (
          <div style={{ background: '#fff', borderTop: `1px solid ${C_BORDER}` }} className="md:hidden px-6 py-4 flex flex-col gap-3">
            {['Women','Men','Kids','Accessories','Store Locator'].map(label => (
              <Link key={label} to={`/shop/${label.toLowerCase()}`}
                onClick={() => setMobileNavOpen(false)}
                style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, textDecoration: 'none', paddingBottom: 8, borderBottom: `1px solid ${C_BORDER}` }}
              >{label}</Link>
            ))}
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <div className="max-w-[1440px] mx-auto px-8 py-12">

        {/* ── Page title row ── */}
        <div className="flex items-center justify-between mb-12">
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: C_DARK, letterSpacing: '-1px', margin: 0 }}>
            Women's Wear
          </h1>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg border"
              style={{ borderColor: C_BORDER, fontSize: 14, fontWeight: 500, color: C_DARK }}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                style={{ ...G, borderColor: C_BORDER, fontSize: 14, fontWeight: 500, color: C_DARK, background: '#fff' }}
              >
                {sortBy} <ChevronDown size={14} color={C_MID} style={{ transform: showSortMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>
              {showSortMenu && (
                <div
                  className="absolute right-0 top-full mt-1 z-20 rounded-lg overflow-hidden"
                  style={{ background: '#fff', border: `1px solid ${C_BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 200 }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => { setSortBy(opt); setShowSortMenu(false) }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      style={{ ...G, fontSize: 14, fontWeight: opt === sortBy ? 500 : 400, color: opt === sortBy ? BLUE : C_DARK }}
                    >{opt}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main layout: sidebar + grid ── */}
        <div className="flex gap-10">

          {/* ── LEFT: Filter sidebar ── */}
          <aside className="hidden md:flex flex-col gap-6 flex-shrink-0" style={{ width: 280 }}>

            {/* Filters header */}
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 24, fontWeight: 600, color: C_DARK }}>
                Filters {activeFilterCount > 0 && <span style={{ color: C_MID }}>({activeFilterCount})</span>}
              </span>
              {activeFilterCount > 0 && (
                <button onClick={clearAll}
                  className="px-3 py-1 rounded-lg"
                  style={{ background: '#f0f0f0', fontSize: 12, fontWeight: 500, color: C_DARK }}
                >Clear all</button>
              )}
            </div>

            {/* Search filters */}
            <div className="relative">
              <Search size={16} color={C_MID} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                placeholder="Search filters"
                style={{ ...G, width: '100%', height: 36, paddingLeft: 36, paddingRight: 12, border: `1px solid ${C_BORDER}`, borderRadius: 8, fontSize: 14, fontWeight: 400, color: C_DARK, background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e => e.target.style.borderColor = C_BORDER}
              />
            </div>

            {/* Category list */}
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="text-left px-0 py-1.5"
                  style={{ ...G, fontSize: 16, fontWeight: 500, color: cat === activeCategory ? BLUE : C_MID, background: 'none', border: 'none', cursor: 'pointer' }}
                >{cat}</button>
              ))}
            </div>

            {/* Separator */}
            <div style={{ height: 1, background: C_BORDER }} />

            {/* Collapsible filter groups */}
            {FILTER_GROUPS.map(group => {
              const visibleItems = filterSearch
                ? group.items.filter(i => i.toLowerCase().includes(filterSearch.toLowerCase()))
                : group.items
              if (filterSearch && visibleItems.length === 0) return null
              const groupChecked = checked[group.id] ?? []
              const isOpen = openGroups[group.id]
              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between py-3"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span style={{ ...G, fontSize: 16, fontWeight: 600, color: C_DARK }}>
                      {group.label}{groupChecked.length > 0 && ` (${groupChecked.length})`}
                    </span>
                    {isOpen
                      ? <ChevronUp size={18} color={C_MID} />
                      : <ChevronDown size={18} color={C_MID} />
                    }
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-3 pb-2">
                      {visibleItems.map(item => {
                        const isChecked = groupChecked.includes(item)
                        return (
                          <label key={item} className="flex items-center gap-3 cursor-pointer">
                            <div
                              onClick={() => toggleCheck(group.id, item)}
                              style={{
                                width: 16, height: 16, borderRadius: 4, border: `1px solid ${isChecked ? BLUE : C_BORDER}`,
                                background: isChecked ? BLUE : '#fff', flexShrink: 0, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}
                            >
                              {isChecked && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span
                              onClick={() => toggleCheck(group.id, item)}
                              style={{ ...G, fontSize: 14, fontWeight: 500, color: isChecked ? C_DARK : C_MID }}
                            >{item}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                  <div style={{ height: 1, background: C_BORDER, marginTop: 4 }} />
                </div>
              )
            })}
          </aside>

          {/* ── RIGHT: Product grid ── */}
          <main className="flex-1 min-w-0">
            {/* Result count */}
            <p style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, marginBottom: 24 }}>
              {displayed.length} products
            </p>
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
              {displayed.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            {displayed.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div style={{ width: 48, height: 48, background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SlidersHorizontal size={20} color={C_MID} />
                </div>
                <p style={{ ...G, fontSize: 16, fontWeight: 500, color: C_DARK }}>No products found</p>
                <p style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID }}>Try adjusting your filters</p>
                <button onClick={clearAll} style={{ ...G, fontSize: 14, fontWeight: 500, color: BLUE, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-80 h-full bg-white flex flex-col overflow-y-auto" style={{ padding: 24 }}>
            <div className="flex items-center justify-between mb-6">
              <span style={{ fontSize: 20, fontWeight: 600, color: C_DARK }}>Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)}><X size={20} color={C_DARK} /></button>
            </div>
            {FILTER_GROUPS.map(group => {
              const groupChecked = checked[group.id] ?? []
              return (
                <div key={group.id} className="mb-4">
                  <p style={{ fontSize: 14, fontWeight: 600, color: C_DARK, marginBottom: 12 }}>{group.label}</p>
                  <div className="flex flex-col gap-3">
                    {group.items.map(item => {
                      const isChecked = groupChecked.includes(item)
                      return (
                        <label key={item} className="flex items-center gap-3 cursor-pointer" onClick={() => toggleCheck(group.id, item)}>
                          <div style={{ width: 16, height: 16, borderRadius: 4, border: `1px solid ${isChecked ? BLUE : C_BORDER}`, background: isChecked ? BLUE : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isChecked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          <span style={{ ...G, fontSize: 14, fontWeight: 500, color: isChecked ? C_DARK : C_MID }}>{item}</span>
                        </label>
                      )
                    })}
                  </div>
                  <div style={{ height: 1, background: C_BORDER, marginTop: 16 }} />
                </div>
              )
            })}
            <button onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full py-2.5 rounded-lg"
              style={{ ...G, background: BLUE, color: '#fff', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}
            >Show {displayed.length} results</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Product card (Figma: 275×503) ────────────────────────────────────
function ProductCard({ product, index }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [adding, setAdding] = useState(false)
  const { addToCart } = useApp()

  const handleAdd = async () => {
    setAdding(true)
    await addToCart?.(product)
    setTimeout(() => setAdding(false), 800)
  }

  const isBestSeller = index < 3
  const hasDiscount  = product.priceGlobal && product.priceLocal && product.priceGlobal > product.priceLocal
  const displayPrice = product.priceGlobal ?? product.priceLocal ?? 0
  const comparePrice = hasDiscount ? product.priceGlobal : null

  return (
    <div
      className="group flex flex-col"
      style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C_BORDER}` }}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: '#f5f5f5' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge */}
        {isBestSeller && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full"
            style={{ background: BLUE, color: '#fff', fontSize: 12, fontWeight: 500, fontFamily: 'Geist, sans-serif' }}>
            Best seller
          </div>
        )}
        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted) }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: wishlisted ? BLUE : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}
        >
          <Heart size={14} color={wishlisted ? '#fff' : C_DARK} fill={wishlisted ? '#fff' : 'none'} />
        </button>
      </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4" style={{ flex: 1 }}>
        {/* Category */}
        <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 400, color: C_MID }}>
          {product.category ?? 'Clothing'}
        </span>
        {/* Name */}
        <Link to={`/product/${product.id}`}
          style={{ fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 500, color: C_DARK, textDecoration: 'none', lineHeight: 1.4 }}
          className="hover:text-blue-600 transition-colors"
        >
          {product.name}
        </Link>
        {/* Description */}
        <p style={{ fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 400, color: C_MID, lineHeight: 1.5, margin: 0 }}
          className="line-clamp-2">
          {product.description ?? 'Premium quality crafted for everyday style.'}
        </p>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Price row */}
        <div className="flex items-center gap-2 mt-1">
          <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 18, fontWeight: 500, color: C_DARK }}>
            ${product.priceLocal ?? displayPrice}
          </span>
          {comparePrice && (
            <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 18, fontWeight: 400, color: C_MID, textDecoration: 'line-through' }}>
              ${comparePrice}
            </span>
          )}
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          disabled={adding}
          className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg transition-all"
          style={{
            fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 500,
            height: 36, background: adding ? '#e5e7eb' : C_DARK,
            color: adding ? C_MID : '#fff', border: 'none', cursor: adding ? 'default' : 'pointer',
            borderRadius: 6, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!adding) e.currentTarget.style.background = '#1a1a1a' }}
          onMouseLeave={e => { if (!adding) e.currentTarget.style.background = C_DARK }}
        >
          <ShoppingBag size={14} />
          {adding ? 'Added!' : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}
