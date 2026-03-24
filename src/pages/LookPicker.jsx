import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Check, RefreshCw, Sparkles, ChevronDown,
  Lock, Truck, CreditCard, ArrowRight,
  Bookmark, BookmarkCheck, ThumbsUp, ThumbsDown,
  Share2, Camera,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { outfitsApi } from '../api/outfits'
import { ordersApi } from '../api/orders'
import { useFeaturedState } from '../hooks/useFeaturedState'
import OutfitChatbot from '../components/OutfitChatbot'

// Build a plain-text snapshot of the current outfit to inject into the AI system prompt
function buildOutfitContext(outfit, effectiveItems, selectedIds, selectedSizes, scope) {
  if (!outfit) return 'No outfit is currently displayed.'
  const itemLines = effectiveItems.map(item => {
    const price    = scope === 'local' ? item.product.price_local : item.product.price_global
    const selected = selectedIds.has(item.product.id)
    const size     = selectedSizes[item.product.id]
    const brand    = item.product.brand?.name ?? ''
    return `  - ${item.role.toUpperCase()}: ${brand} "${item.product.name}" $${price}${size ? ` · size ${size}` : ''}${selected ? '' : ' [not selected]'}`
  })
  const selTotal = effectiveItems
    .filter(i => selectedIds.has(i.product.id))
    .reduce((s, i) => s + Number(scope === 'local' ? i.product.price_local : i.product.price_global), 0)
  return [
    `Outfit: "${outfit.title}" | Mode: ${scope}`,
    outfit.description ? `Description: ${outfit.description}` : '',
    outfit.occasion ? `Occasion: ${outfit.occasion}` : '',
    'Items:',
    ...itemLines,
    `Selected total: $${selTotal.toFixed(0)}`,
  ].filter(Boolean).join('\n')
}

const EASE = [0.76, 0, 0.24, 1]

// Yerevan coordinates — if user is within ~300 km, default to LOCAL
const YEREVAN = { lat: 40.1872, lng: 44.5152 }

const ROLE_LABELS = {
  anchor:    'Statement piece',
  top:       'Top',
  bottom:    'Bottom',
  shoes:     'Shoes',
  bag:       'Bag',
  accessory: 'Accessory',
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LookPicker() {
  const { user } = useApp()
  const navigate = useNavigate()

  const {
    scope, setScope,
    selectedIds, toggleSelected, selectAll, deselectAll, selectCore,
    swappedItems, swapItem,
    resetSelections,
    selectedSizes, setSizeForProduct,
    recentlyViewed, addToRecentlyViewed,
    savedOutfitIds, toggleLocalSave, setSavedOutfitIds,
    outfitRatings, setOutfitRating,
  } = useFeaturedState('global')

  const [outfits, setOutfits]             = useState([])
  const [activeIdx, setActiveIdx]         = useState(0)
  const [loading, setLoading]             = useState(true)
  const [generating, setGenerating]       = useState(false)
  const [swapTarget, setSwapTarget]       = useState(null)
  const [swapAlts, setSwapAlts]           = useState([])
  const [swapLoading, setSwapLoading]     = useState(false)
  const [checkoutOpen, setCheckoutOpen]   = useState(false)
  const [generateOpen, setGenerateOpen]   = useState(false)
  const [shareToast, setShareToast]       = useState(false)
  const [genPrefs, setGenPrefs]           = useState({ style: '', budget: '', occasion: '' })
  const [genError, setGenError]           = useState('')

  // ── 7. Location-based scope default (runs once, only when no saved state) ──
  useEffect(() => {
    const hasSaved = !!localStorage.getItem('daarvi_featured_state_v2')
    if (hasSaved || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const dLat = coords.latitude  - YEREVAN.lat
        const dLng = coords.longitude - YEREVAN.lng
        const dist  = Math.sqrt(dLat * dLat + dLng * dLng)
        if (dist < 3) setScope('local')   // within ~300 km → Yerevan area
      },
      () => {} // permission denied or unavailable — silently stay on global
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch outfits on scope change ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    outfitsApi.list(scope)
      .then(data => {
        if (cancelled) return
        setOutfits(data)
        setActiveIdx(0)
        if (data.length > 0) {
          const coreIds = data[0].items.filter(i => i.is_core).map(i => i.product.id)
          resetSelections(coreIds)
        }
      })
      .catch(() => { if (!cancelled) setOutfits([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [scope]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync saved outfit IDs from server (if logged in) ─────────────────────
  useEffect(() => {
    if (!user) return
    outfitsApi.getSavedIds()
      .then(ids => setSavedOutfitIds(ids))
      .catch(() => {})
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const outfit = outfits[activeIdx] ?? null

  // Apply client-side swaps + track recently viewed
  useEffect(() => {
    if (outfit) addToRecentlyViewed(outfit)
  }, [outfit?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveItems = outfit
    ? outfit.items.map(item => {
        const swapped = swappedItems[item.product.id]
        return swapped ? { ...item, product: swapped } : item
      })
    : []

  // Totals
  const selectedItems = effectiveItems.filter(i => selectedIds.has(i.product.id))
  const total = selectedItems.reduce((sum, i) => {
    return sum + Number(scope === 'local' ? i.product.price_local : i.product.price_global)
  }, 0)

  // ── 8. "Complete the look" nudge ──────────────────────────────────────────
  const firstMissingCore = effectiveItems.find(
    i => i.is_core && !selectedIds.has(i.product.id)
  ) ?? null

  // ── Outfit title + hero image ─────────────────────────────────────────────
  const heroImage = outfit?.hero_image
    ?? effectiveItems.find(i => i.role === 'anchor')?.product?.images?.[0]?.url
    ?? null

  // ── Save / unsave ─────────────────────────────────────────────────────────
  const handleSaveToggle = async () => {
    if (!outfit) return
    const isSaved = savedOutfitIds.has(outfit.id)
    toggleLocalSave(outfit.id)   // optimistic
    try {
      if (isSaved) {
        await outfitsApi.unsave(outfit.id)
      } else {
        await outfitsApi.save(outfit.id)
      }
    } catch {
      toggleLocalSave(outfit.id)  // revert on error
    }
  }

  // ── 10. Share ─────────────────────────────────────────────────────────────
  const handleShare = () => {
    if (!outfit) return
    const url = `${window.location.origin}/featured?outfit=${outfit.id}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2200)
  }

  // ── Swap ──────────────────────────────────────────────────────────────────
  const openSwap = async (item) => {
    setSwapTarget(item)
    setSwapAlts([])
    setSwapLoading(true)
    try {
      const alts = await outfitsApi.alternatives({
        role: item.role,
        scope,
        excludeId: item.product.id,
        limit: 6,
      })
      setSwapAlts(alts)
    } catch {
      setSwapAlts([])
    } finally {
      setSwapLoading(false)
    }
  }

  const confirmSwap = (newProduct) => {
    if (!swapTarget) return
    const oldId = swapTarget.product.id
    swapItem(oldId, newProduct)
    // Keep selection in sync
    if (selectedIds.has(oldId)) {
      const next = new Set(selectedIds)
      next.delete(oldId)
      next.add(newProduct.id)
      selectAll([...next])
    }
    setSwapTarget(null)
    setSwapAlts([])
  }

  // ── 6. Rating ─────────────────────────────────────────────────────────────
  const handleRate = async (rating) => {
    if (!outfit || !user) return
    const current = outfitRatings[outfit.id]
    const next = current === rating ? null : rating   // toggle off if same
    setOutfitRating(outfit.id, next)
    try {
      if (next) await outfitsApi.rate(outfit.id, next)
    } catch {
      setOutfitRating(outfit.id, current)  // revert
    }
  }

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!genPrefs.style && !genPrefs.budget && !genPrefs.occasion) {
      setGenError('Fill in at least one field.')
      return
    }
    setGenError('')
    setGenerating(true)
    try {
      const generated = await outfitsApi.generate({ ...genPrefs, scope })
      setOutfits(prev => [generated, ...prev])
      setActiveIdx(0)
      resetSelections(generated.items.filter(i => i.is_core).map(i => i.product.id))
      setGenerateOpen(false)
    } catch (err) {
      setGenError(err?.response?.data?.detail || 'Generation failed. Try different preferences.')
    } finally {
      setGenerating(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black">

      {/* ── Sticky top bar ────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-white/[0.07]"
        style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(16px)' }}>

        <div className="px-6 md:px-10 h-14 flex items-center justify-between gap-4">
          <h1 className="font-serif text-xl text-cream tracking-wide">Look Picker</h1>

          {/* ── 1/2/7. Scope pill toggle ──────────────────────────────────── */}
          <div className="flex items-center gap-1 border border-white/10 p-1 rounded-sm">
            {['local', 'global'].map(s => (
              <button key={s} onClick={() => setScope(s)}
                className="px-5 py-1.5 text-[11px] tracking-[0.18em] font-sans rounded-sm transition-all duration-250"
                style={{
                  background: scope === s ? (s === 'local' ? '#af0000' : '#cca350') : 'transparent',
                  color: scope === s ? (s === 'local' ? '#f4ecdc' : '#000') : '#868686',
                }}>
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Outfit tabs */}
        {!loading && outfits.length > 1 && (
          <div className="flex px-6 md:px-10 border-t border-white/[0.05] overflow-x-auto">
            {outfits.map((o, i) => (
              <button key={o.id}
                onClick={() => {
                  setActiveIdx(i)
                  resetSelections(o.items.filter(x => x.is_core).map(x => x.product.id))
                }}
                className={`px-5 py-2.5 text-[11px] tracking-[0.12em] font-sans border-b-2 whitespace-nowrap transition-all duration-200 ${
                  activeIdx === i ? 'border-gold text-cream' : 'border-transparent text-gray/40 hover:text-gray'
                }`}>
                {o.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 pt-6 pb-32">

        {/* Scope context hint */}
        <p className="text-[11px] text-gray/40 font-sans mb-5">
          {scope === 'local'
            ? '📍 Nearby boutiques · Fast delivery · Local pricing'
            : '🌍 International labels · Worldwide shipping · Global pricing'}
        </p>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            <div className="animate-pulse w-full h-48 bg-white/[0.04] mb-5" />
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="animate-pulse flex gap-4 p-4 border border-white/[0.04]">
                <div className="w-20 h-20 bg-white/[0.05] flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 bg-white/[0.05] rounded w-1/4" />
                  <div className="h-3 bg-white/[0.05] rounded w-1/2" />
                  <div className="h-2 bg-white/[0.05] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No outfits */}
        {!loading && !outfit && (
          <div className="py-16 text-center">
            <p className="text-gray font-sans text-sm mb-1">No outfits yet for {scope} mode.</p>
            <p className="text-gray/40 font-sans text-xs">Use "Create My Outfit" below to generate one.</p>
          </div>
        )}

        {!loading && outfit && (
          <AnimatePresence mode="wait">
            <motion.div key={outfit.id + scope}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}>

              {/* ── 2. Hero image ─────────────────────────────────────────── */}
              {heroImage && (
                <div className="relative w-full mb-6 overflow-hidden"
                  style={{ height: 'clamp(180px, 30vw, 320px)' }}>
                  <img src={heroImage} alt={outfit.title}
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                  <div className="absolute bottom-0 left-0 px-6 pb-5">
                    <p className="text-[10px] tracking-[0.35em] text-gold/80 font-sans mb-1">
                      {outfit.occasion?.toUpperCase() ?? 'THE LOOK'}
                    </p>
                    <h2 className="font-serif text-2xl md:text-3xl text-cream">{outfit.title}</h2>
                  </div>
                  {/* Save + share buttons overlaid on hero */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <ActionIcon onClick={handleShare} title="Copy link">
                      {shareToast ? <Check size={14} className="text-gold" /> : <Share2 size={14} />}
                    </ActionIcon>
                    <ActionIcon onClick={handleSaveToggle} title="Save outfit">
                      {savedOutfitIds.has(outfit.id)
                        ? <BookmarkCheck size={14} className="text-gold" />
                        : <Bookmark size={14} />}
                    </ActionIcon>
                  </div>
                </div>
              )}

              {/* Outfit header (no hero image fallback) */}
              {!heroImage && (
                <div className="flex items-start justify-between mb-5">
                  <div>
                    {outfit.occasion && (
                      <p className="text-[9px] tracking-[0.35em] text-gold/70 font-sans mb-1">
                        {outfit.occasion.toUpperCase()}
                      </p>
                    )}
                    <h2 className="font-serif text-2xl text-cream">{outfit.title}</h2>
                    {outfit.description && (
                      <p className="text-[12px] text-gray/50 font-body mt-1 leading-relaxed max-w-lg">
                        {outfit.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <ActionIcon onClick={handleShare} title="Copy link">
                      {shareToast ? <Check size={14} className="text-gold" /> : <Share2 size={14} />}
                    </ActionIcon>
                    <ActionIcon onClick={handleSaveToggle} title="Save outfit">
                      {savedOutfitIds.has(outfit.id)
                        ? <BookmarkCheck size={14} className="text-gold" />
                        : <Bookmark size={14} />}
                    </ActionIcon>
                  </div>
                </div>
              )}

              {/* Style tags */}
              {outfit.style_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {outfit.style_tags.map(tag => (
                    <span key={tag}
                      className="text-[9px] tracking-[0.2em] font-sans px-2.5 py-1 border border-white/[0.08] text-gray/40">
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

              {/* ── 8. "Complete the look" nudge ──────────────────────────── */}
              <AnimatePresence>
                {firstMissingCore && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between px-4 py-3 mb-5 border"
                    style={{ borderColor: 'rgba(204,163,80,0.2)', background: 'rgba(204,163,80,0.04)' }}>
                    <p className="text-[11px] font-sans text-gold/80">
                      Complete the look — add the{' '}
                      <span className="text-cream">{ROLE_LABELS[firstMissingCore.role]}</span>
                      {' '}for{' '}
                      <span className="text-cream">
                        ${scope === 'local'
                          ? firstMissingCore.product.price_local
                          : firstMissingCore.product.price_global}
                      </span>
                    </p>
                    <button
                      onClick={() => toggleSelected(firstMissingCore.product.id)}
                      className="text-[10px] tracking-[0.2em] font-sans text-gold border border-gold/30 px-3 py-1 hover:bg-gold/10 transition-colors">
                      ADD
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Bulk controls ─────────────────────────────────────────── */}
              <div className="flex items-center gap-2 mb-4">
                <BulkBtn onClick={() => selectAll(effectiveItems.map(i => i.product.id))}>Select all</BulkBtn>
                <Dot />
                <BulkBtn onClick={deselectAll}>Deselect all</BulkBtn>
                <Dot />
                <BulkBtn gold onClick={() => selectCore(effectiveItems.filter(i => i.is_core).map(i => i.product.id))}>
                  Core look only
                </BulkBtn>
              </div>

              {/* ── Item rows ─────────────────────────────────────────────── */}
              <div className="divide-y divide-white/[0.06]">
                {effectiveItems.map((item, idx) => (
                  <OutfitRow
                    key={item.product.id}
                    item={item}
                    scope={scope}
                    selected={selectedIds.has(item.product.id)}
                    selectedSize={selectedSizes[item.product.id] ?? null}
                    onToggle={() => toggleSelected(item.product.id)}
                    onSwap={() => openSwap(item)}
                    onSelectSize={(size) => setSizeForProduct(item.product.id, size)}
                    onTryOn={() => {
                      const img = item.product.images?.[0]?.url ?? item.product.image ?? ''
                      navigate(`/try-on?garment=${encodeURIComponent(img)}`)
                    }}
                    index={idx}
                  />
                ))}
              </div>

              {/* ── 6. Rating ─────────────────────────────────────────────── */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-3">
                <p className="text-[10px] tracking-[0.2em] font-sans text-gray/40">RATE THIS LOOK</p>
                <RatingBtn
                  active={outfitRatings[outfit.id] === 'up'}
                  onClick={() => handleRate('up')}
                  color="text-emerald-400">
                  <ThumbsUp size={13} />
                </RatingBtn>
                <RatingBtn
                  active={outfitRatings[outfit.id] === 'down'}
                  onClick={() => handleRate('down')}
                  color="text-red-400">
                  <ThumbsDown size={13} />
                </RatingBtn>
                {!user && (
                  <p className="text-[10px] text-gray/30 font-sans ml-1">Sign in to rate</p>
                )}
              </div>

              {/* ── Total + checkout ──────────────────────────────────────── */}
              <div className="mt-5 pt-5 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-gray/40 font-sans">
                    {selectedIds.size} of {effectiveItems.length} items selected
                  </p>
                  {selectedIds.size > 0 && (
                    <p className="text-2xl font-serif text-cream mt-0.5">${total.toFixed(0)}</p>
                  )}
                  {/* ── 5. Size warning ──────────────────────────────────── */}
                  {selectedItems.some(i => {
                    const sizes = i.product.sizes ?? []
                    return sizes.length > 0 && !selectedSizes[i.product.id]
                  }) && (
                    <p className="text-[10px] text-amber-400 font-sans mt-1 flex items-center gap-1">
                      ⚠ Some items need a size before checkout
                    </p>
                  )}
                </div>
                <button
                  onClick={() => selectedIds.size > 0 && setCheckoutOpen(true)}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-2.5 px-8 py-3.5 text-[11px] tracking-[0.2em] font-sans transition-all duration-300"
                  style={{
                    background: selectedIds.size > 0 ? '#cca350' : 'transparent',
                    color: selectedIds.size > 0 ? '#000' : '#555',
                    border: selectedIds.size === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
                  }}>
                  CHECKOUT
                  {selectedIds.size > 0 && <ArrowRight size={13} />}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="my-10 h-px bg-white/[0.05]" />

        {/* ── Create My Outfit ──────────────────────────────────────────────── */}
        <div>
          <button onClick={() => setGenerateOpen(p => !p)}
            className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 border border-gold/30 flex items-center justify-center group-hover:border-gold transition-colors duration-200">
              <Sparkles size={13} className="text-gold" />
            </div>
            <span className="text-[12px] tracking-[0.18em] font-sans text-cream/70 group-hover:text-cream transition-colors duration-200">
              CREATE MY OUTFIT
            </span>
            <ChevronDown size={12}
              className={`text-gray/40 transition-transform duration-300 ml-1 ${generateOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {generateOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}
                className="overflow-hidden">
                <div className="pt-6 max-w-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] tracking-[0.3em] text-gray/40 font-sans mb-2">
                        DESCRIBE YOUR STYLE
                      </label>
                      <input type="text"
                        placeholder="e.g. dark minimalist, romantic, streetwear…"
                        value={genPrefs.style}
                        onChange={e => setGenPrefs(p => ({ ...p, style: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm text-cream font-body focus:outline-none focus:border-gold/60 transition-colors placeholder-white/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] tracking-[0.3em] text-gray/40 font-sans mb-2">BUDGET</label>
                        <select value={genPrefs.budget}
                          onChange={e => setGenPrefs(p => ({ ...p, budget: e.target.value }))}
                          className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-cream font-body focus:outline-none focus:border-gold/60 appearance-none">
                          <option value="">Any</option>
                          <option value="<300">Under $300</option>
                          <option value="300-800">$300 – $800</option>
                          <option value="800+">$800+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] tracking-[0.3em] text-gray/40 font-sans mb-2">OCCASION</label>
                        <select value={genPrefs.occasion}
                          onChange={e => setGenPrefs(p => ({ ...p, occasion: e.target.value }))}
                          className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-cream font-body focus:outline-none focus:border-gold/60 appearance-none">
                          <option value="">Any</option>
                          <option value="casual">Casual</option>
                          <option value="evening">Evening</option>
                          <option value="work">Work</option>
                          <option value="weekend">Weekend</option>
                        </select>
                      </div>
                    </div>
                    {genError && <p className="text-[11px] text-red font-sans">{genError}</p>}
                    <button onClick={handleGenerate} disabled={generating}
                      className="w-full py-3.5 bg-gold text-black text-[11px] tracking-[0.22em] font-sans hover:bg-cream transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
                      {generating && <RefreshCw size={12} className="animate-spin" />}
                      {generating ? 'GENERATING…' : 'GENERATE OUTFIT'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 9. Recently viewed ────────────────────────────────────────────── */}
        {recentlyViewed.filter(o => o.id !== outfit?.id).length > 0 && (
          <RecentlyViewedStrip
            items={recentlyViewed.filter(o => o.id !== outfit?.id)}
            onSelect={(id) => {
              const idx = outfits.findIndex(o => o.id === id)
              if (idx >= 0) {
                setActiveIdx(idx)
                resetSelections(outfits[idx].items.filter(i => i.is_core).map(i => i.product.id))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          />
        )}
      </div>

      {/* ── Swap modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {swapTarget && (
          <SwapModal
            item={swapTarget}
            alts={swapAlts}
            loading={swapLoading}
            scope={scope}
            onSelect={confirmSwap}
            onClose={() => { setSwapTarget(null); setSwapAlts([]) }}
          />
        )}
      </AnimatePresence>

      {/* ── Checkout panel ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutPanel
            selectedItems={selectedItems}
            selectedSizes={selectedSizes}
            scope={scope}
            total={total}
            user={user}
            onClose={() => setCheckoutOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Aria AI stylist chatbot ─────────────────────────────────────────── */}
      <OutfitChatbot
        outfitContext={buildOutfitContext(outfit, effectiveItems, selectedIds, selectedSizes, scope)}
        scope={scope}
        onAction={(action) => {
          if (action.type === 'DISPLAY_OUTFIT') {
            const newOutfit = action.outfit
            setOutfits(prev => [newOutfit, ...prev.filter(o => o.id !== newOutfit.id)])
            setActiveIdx(0)
            const coreIds = newOutfit.items.filter(i => i.is_core).map(i => i.product.id)
            resetSelections(coreIds)
          } else if (action.type === 'SWAP_ITEM') {
            const currentItem = effectiveItems.find(i => i.role === action.role)
            if (currentItem) {
              const oldId = currentItem.product.id
              swapItem(oldId, action.product)
              if (selectedIds.has(oldId)) {
                const next = new Set(selectedIds)
                next.delete(oldId)
                next.add(action.product.id)
                selectAll([...next])
              }
            }
          }
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────
function ActionIcon({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title}
      className="w-8 h-8 flex items-center justify-center text-gray/50 hover:text-cream transition-colors duration-200"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {children}
    </button>
  )
}

function BulkBtn({ onClick, gold, children }) {
  return (
    <button onClick={onClick}
      className={`text-[10px] tracking-widest font-sans underline underline-offset-2 transition-colors ${
        gold ? 'text-gold/60 hover:text-gold' : 'text-gray/50 hover:text-cream'
      }`}>
      {children}
    </button>
  )
}

function Dot() {
  return <span className="text-gray/20">·</span>
}

function RatingBtn({ onClick, active, color, children }) {
  return (
    <button onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center border transition-all duration-200 ${
        active ? `border-current ${color}` : 'border-white/10 text-gray/30 hover:border-white/30 hover:text-gray/60'
      }`}>
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart-style item row (features 1, 3, 5)
// ─────────────────────────────────────────────────────────────────────────────
function OutfitRow({ item, scope, selected, selectedSize, onToggle, onSwap, onSelectSize, onTryOn, index }) {
  const { product, role, is_core } = item
  const price      = Number(scope === 'local' ? product.price_local : product.price_global)
  const image      = product.images?.[0]?.url ?? product.image ?? ''
  const brandName  = product.brand?.name ?? product.brand ?? ''
  const sizes      = product.sizes?.map(s => s.size) ?? []
  const needsSize  = sizes.length > 0 && !selectedSize

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay: index * 0.05 }}
      className="py-4 transition-colors duration-200 cursor-pointer group"
      style={{
        background: selected ? 'rgba(204,163,80,0.04)' : 'transparent',
        borderLeft: selected ? '2px solid #cca350' : '2px solid transparent',
        paddingLeft: selected ? '14px' : '16px',
      }}
      onClick={onToggle}>

      <div className="flex items-center gap-4">
        {/* Big checkbox */}
        <div className="flex-shrink-0 w-7 h-7 border-2 flex items-center justify-center transition-all duration-200"
          style={{
            borderColor: selected ? '#cca350' : 'rgba(255,255,255,0.2)',
            background: selected ? '#cca350' : 'transparent',
          }}
          onClick={e => { e.stopPropagation(); onToggle() }}>
          {selected && <Check size={14} color="#000" strokeWidth={3} />}
        </div>

        {/* Product image */}
        <div className="w-20 h-20 flex-shrink-0 overflow-hidden bg-neutral-900">
          {image && (
            <img src={image} alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
          <p className="text-[10px] tracking-[0.2em] text-gray/50 font-sans">{brandName.toUpperCase()}</p>
          <p className="text-[14px] text-cream font-sans mt-0.5 leading-snug truncate">{product.name}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[9px] tracking-widest font-sans px-2 py-0.5"
              style={{
                background: is_core ? 'rgba(204,163,80,0.1)' : 'rgba(255,255,255,0.04)',
                color: is_core ? '#cca350' : '#868686',
                border: `1px solid ${is_core ? 'rgba(204,163,80,0.25)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              {ROLE_LABELS[role] ?? role}
            </span>
            <button onClick={e => { e.stopPropagation(); onSwap() }}
              className="flex items-center gap-1 text-[10px] tracking-widest font-sans text-gray/40 hover:text-cream transition-colors duration-200">
              <RefreshCw size={10} />
              Swap
            </button>
            {/* ── 3. Try On (anchor only) ──── */}
            {role === 'anchor' && (
              <button onClick={e => { e.stopPropagation(); onTryOn() }}
                className="flex items-center gap-1 text-[10px] tracking-widest font-sans text-gray/40 hover:text-gold transition-colors duration-200">
                <Camera size={10} />
                Try On
              </button>
            )}
          </div>

          {/* ── 1. Size picker ── */}
          {sizes.length > 0 && (
            <div className="flex gap-1.5 mt-2.5 flex-wrap" onClick={e => e.stopPropagation()}>
              {sizes.map(sz => (
                <button key={sz}
                  onClick={() => onSelectSize(selectedSize === sz ? null : sz)}
                  className="text-[10px] font-sans px-2 py-0.5 border transition-all duration-150"
                  style={{
                    borderColor: selectedSize === sz ? '#cca350' : 'rgba(255,255,255,0.12)',
                    color:       selectedSize === sz ? '#cca350' : '#868686',
                    background:  selectedSize === sz ? 'rgba(204,163,80,0.08)' : 'transparent',
                  }}>
                  {sz}
                </button>
              ))}
              {/* ── 5. Size warning ── */}
              {needsSize && selected && (
                <span className="text-[9px] font-sans text-amber-400 self-center ml-1">Pick a size</span>
              )}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex-shrink-0 text-right" onClick={e => e.stopPropagation()}>
          <p className={`text-[16px] font-sans transition-colors duration-200 ${selected ? 'text-gold' : 'text-cream/70'}`}>
            ${price}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Recently viewed strip
// ─────────────────────────────────────────────────────────────────────────────
function RecentlyViewedStrip({ items, onSelect }) {
  return (
    <div className="mt-10">
      <p className="text-[9px] tracking-[0.35em] text-gray/40 font-sans mb-4">RECENTLY VIEWED</p>
      <div className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {items.map(o => {
          const thumb = o.heroImage ?? o.anchorImage
          return (
            <button key={o.id} onClick={() => onSelect(o.id)}
              className="flex-shrink-0 w-28 group text-left">
              <div className="w-28 h-36 bg-neutral-900 overflow-hidden border border-white/[0.06] group-hover:border-white/20 transition-colors duration-200">
                {thumb
                  ? <img src={thumb} alt={o.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  : <div className="w-full h-full bg-white/[0.04]" />}
              </div>
              <p className="text-[10px] text-gray/60 font-sans mt-1.5 leading-tight truncate group-hover:text-cream transition-colors">{o.title}</p>
              <p className="text-[9px] tracking-widest font-sans mt-0.5"
                style={{ color: o.scope === 'local' ? '#af0000' : '#cca350' }}>
                {o.scope.toUpperCase()}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Swap modal — bottom sheet
// ─────────────────────────────────────────────────────────────────────────────
function SwapModal({ item, alts, loading: altsLoading, scope, onSelect, onClose }) {
  const roleLabel = ROLE_LABELS[item.role] ?? item.role
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.32, ease: EASE }}
        className="fixed bottom-0 left-0 md:left-[220px] right-0 z-50 border-t border-white/10"
        style={{ background: 'rgba(6,6,6,0.99)', backdropFilter: 'blur(20px)' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 md:px-10 pt-5 pb-8">
          <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-5" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[12px] tracking-[0.2em] font-sans text-cream">Swap {roleLabel}</p>
              <p className="text-[11px] text-gray/40 font-sans mt-0.5">
                Currently: <span className="text-gray/60">{item.product.name}</span>
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray/40 hover:text-cream transition-colors">
              <X size={16} />
            </button>
          </div>

          {altsLoading ? (
            <div className="py-6 text-center">
              <RefreshCw size={20} className="text-gray/20 mx-auto mb-2 animate-spin" />
              <p className="text-[11px] text-gray/30 font-sans">Loading alternatives…</p>
            </div>
          ) : alts.length === 0 ? (
            <p className="text-center py-6 text-[11px] text-gray/30 font-sans">No alternatives found for this role.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {alts.map(product => {
                const price     = scope === 'local' ? product.price_local : product.price_global
                const image     = product.images?.[0]?.url ?? product.image ?? ''
                const brandName = product.brand?.name ?? product.brand ?? ''
                return (
                  <button key={product.id} onClick={() => onSelect(product)}
                    className="group text-left border border-white/[0.07] hover:border-gold/50 transition-all duration-300 overflow-hidden">
                    <div className="aspect-square overflow-hidden bg-neutral-900">
                      {image && (
                        <img src={image} alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[9px] tracking-widest text-gray/40 font-sans truncate">{brandName.toUpperCase()}</p>
                      <p className="text-[12px] text-cream font-sans mt-0.5 leading-snug line-clamp-2">{product.name}</p>
                      <p className="text-[13px] text-gold font-sans mt-1.5">${price}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Checkout slide-over panel
// ─────────────────────────────────────────────────────────────────────────────
function CheckoutPanel({ selectedItems, selectedSizes, scope, total, user, onClose }) {
  const [step, setStep]             = useState('summary')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]             = useState({
    firstName: '', lastName: '', email: '',
    address: '', city: '', country: '', zip: '',
    card: '', expiry: '', cvv: '',
  })
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const handleConfirm = async () => {
    if (user) {
      setSubmitting(true)
      try {
        await ordersApi.create({
          mode: scope,
          items: selectedItems.map(i => ({
            product_id: i.product.id,
            size: selectedSizes[i.product.id] ?? i.product.sizes?.[0]?.size ?? 'ONE SIZE',
            color: i.product.colors?.[0]?.name ?? 'DEFAULT',
            qty: 1,
            price: scope === 'local' ? i.product.price_local : i.product.price_global,
          })),
          shipping_name: `${form.firstName} ${form.lastName}`.trim(),
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_country: form.country,
        })
      } catch (e) {
        console.warn('Order failed:', e)
      } finally {
        setSubmitting(false)
      }
    }
    setStep('confirmed')
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ duration: 0.38, ease: EASE }}
        className="fixed right-0 top-0 h-full w-full md:w-[480px] z-50 overflow-y-auto"
        style={{ background: '#050505', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
          <div>
            <p className="text-[11px] tracking-[0.25em] font-sans text-gold">
              {step === 'confirmed' ? 'ORDER PLACED' : 'CHECKOUT'}
            </p>
            {step !== 'confirmed' && (
              <p className="text-[12px] text-gray/40 font-sans mt-0.5">
                {selectedItems.length} items · ${total.toFixed(0)}
              </p>
            )}
          </div>
          {step !== 'confirmed' && (
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray/40 hover:text-cream transition-colors">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="px-8 py-6">
          <AnimatePresence mode="wait">
            {step === 'confirmed' ? (
              <ConfirmedStep key="confirmed" onClose={onClose} />
            ) : (
              <motion.div key={step}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22, ease: EASE }}>

                {/* Step tabs */}
                <div className="flex gap-1 mb-7">
                  {['Delivery', 'Payment'].map((label, i) => {
                    const s    = ['summary', 'payment'][i]
                    const done = step === 'payment' && s === 'summary'
                    return (
                      <button key={s}
                        onClick={() => done && setStep('summary')}
                        className="flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.18em] font-sans border transition-all duration-200"
                        style={{
                          borderColor: step === s ? '#cca350' : done ? 'rgba(204,163,80,0.3)' : 'rgba(255,255,255,0.08)',
                          color: step === s ? '#cca350' : done ? 'rgba(204,163,80,0.6)' : '#555',
                          cursor: done ? 'pointer' : 'default',
                        }}>
                        {done ? <Check size={10} /> : <span style={{ opacity: 0.5 }}>{i + 1}</span>}
                        {label}
                      </button>
                    )
                  })}
                </div>

                {/* Mini item list */}
                <div className="space-y-2.5 mb-6 pb-5 border-b border-white/[0.06]">
                  {selectedItems.map((item, i) => {
                    const price = scope === 'local' ? item.product.price_local : item.product.price_global
                    const image = item.product.images?.[0]?.url ?? item.product.image ?? ''
                    const sz    = selectedSizes[item.product.id]
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-11 h-11 flex-shrink-0 overflow-hidden bg-neutral-900">
                          {image && <img src={image} alt={item.product.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-cream font-sans truncate">{item.product.name}</p>
                          <p className="text-[10px] text-gray/40 font-sans mt-0.5">
                            {ROLE_LABELS[item.role] ?? item.role}
                            {sz && <span className="ml-2 text-gold/60">{sz}</span>}
                          </p>
                        </div>
                        <p className="text-[13px] text-cream font-sans flex-shrink-0">${price}</p>
                      </div>
                    )
                  })}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] tracking-widest text-gray/40 font-sans">TOTAL</span>
                    <span className="text-xl font-serif text-cream">${total.toFixed(0)}</span>
                  </div>
                </div>

                {step === 'summary' && <PanelDeliveryForm form={form} update={update} onNext={() => setStep('payment')} />}
                {step === 'payment' && <PanelPaymentForm form={form} update={update} submitting={submitting} onConfirm={handleConfirm} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}

function ConfirmedStep({ onClose }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="py-16 text-center">
      <motion.div className="w-14 h-14 bg-gold flex items-center justify-center mx-auto mb-6"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.15 }}>
        <Check size={24} className="text-black" />
      </motion.div>
      <p className="text-[10px] tracking-[0.4em] text-gold font-sans mb-3">ORDER PLACED</p>
      <h2 className="font-serif text-3xl text-cream mb-3">Thank you.</h2>
      <p className="text-sm text-gray/70 font-body leading-relaxed mb-8">
        Your featured outfit has been ordered.<br />A confirmation email is on its way.
      </p>
      <button onClick={onClose}
        className="px-8 py-3 bg-gold text-black text-xs tracking-[0.25em] font-sans hover:bg-cream transition-colors">
        BACK TO FEATURED
      </button>
    </motion.div>
  )
}

function PanelDeliveryForm({ form, update, onNext }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onNext() }} className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3">
        <PField label="FIRST NAME" value={form.firstName} onChange={v => update('firstName', v)} required />
        <PField label="LAST NAME"  value={form.lastName}  onChange={v => update('lastName', v)}  required />
      </div>
      <PField label="EMAIL" type="email" value={form.email} onChange={v => update('email', v)} required />
      <PField label="ADDRESS"      value={form.address} onChange={v => update('address', v)} required />
      <div className="grid grid-cols-2 gap-3">
        <PField label="CITY" value={form.city} onChange={v => update('city', v)} required />
        <PField label="ZIP"  value={form.zip}  onChange={v => update('zip', v)}  required />
      </div>
      <PField label="COUNTRY" value={form.country} onChange={v => update('country', v)} required />
      <button type="submit"
        className="w-full py-3.5 bg-gold text-black text-[11px] tracking-[0.22em] font-sans flex items-center justify-center gap-2 hover:bg-cream transition-colors mt-2 group">
        CONTINUE TO PAYMENT <Truck size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </form>
  )
}

function PanelPaymentForm({ form, update, onConfirm, submitting }) {
  const fmtCard   = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExpiry = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0,2)} / ${d.slice(2)}` : d }
  return (
    <form onSubmit={e => { e.preventDefault(); onConfirm() }} className="space-y-3.5">
      <div className="border border-white/[0.08] p-4 space-y-3">
        <p className="text-[9px] tracking-[0.3em] text-gray/40 font-sans">CARD DETAILS</p>
        <PField label="CARD NUMBER" value={form.card}
          onChange={v => update('card', fmtCard(v))} placeholder="0000 0000 0000 0000" required />
        <div className="grid grid-cols-2 gap-3">
          <PField label="EXPIRY" value={form.expiry} onChange={v => update('expiry', fmtExpiry(v))} placeholder="MM / YY" required />
          <PField label="CVV"    value={form.cvv}    onChange={v => update('cvv', v.replace(/\D/g,'').slice(0,4))} placeholder="•••" required />
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-40">
        <Lock size={9} className="text-gray" />
        <p className="text-[9px] tracking-widest text-gray font-sans">256-bit SSL encrypted</p>
      </div>
      <button type="submit" disabled={submitting}
        className="w-full py-3.5 bg-gold text-black text-[11px] tracking-[0.22em] font-sans flex items-center justify-center gap-2 hover:bg-cream transition-colors disabled:opacity-50">
        <CreditCard size={12} />
        {submitting ? 'PLACING ORDER…' : 'PLACE ORDER'}
      </button>
    </form>
  )
}

function PField({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div className="group">
      <label className="block text-[9px] tracking-[0.25em] text-gray/40 font-sans mb-1.5 group-focus-within:text-gold transition-colors">
        {label}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full bg-transparent border border-white/[0.09] px-3 py-2.5 text-sm text-cream font-body focus:outline-none focus:border-gold/60 transition-colors placeholder-white/15" />
    </div>
  )
}
