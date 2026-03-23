import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, RefreshCw, Sparkles, ChevronDown, Lock, Truck, CreditCard } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { outfitsApi } from '../api/outfits'
import { ordersApi } from '../api/orders'
import { useFeaturedState } from '../hooks/useFeaturedState'

const EASE = [0.76, 0, 0.24, 1]

const ROLE_LABELS = {
  anchor:    'ANCHOR',
  top:       'TOP',
  bottom:    'BOTTOM',
  shoes:     'SHOES',
  bag:       'BAG',
  accessory: 'ACCESSORY',
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Featured() {
  const { mode, user } = useApp()
  const navigate = useNavigate()

  const {
    scope, setScope,
    selectedIds, toggleSelected, selectAll, deselectAll, selectCore,
    swappedItems, swapItem, resetSelections,
  } = useFeaturedState(mode === 'local' ? 'local' : 'global')

  const [outfits, setOutfits]       = useState([])
  const [activeIdx, setActiveIdx]   = useState(0)
  const [loading, setLoading]       = useState(true)
  const [generating, setGenerating] = useState(false)
  const [swapTarget, setSwapTarget] = useState(null)   // { role, originalId }
  const [swapAlts, setSwapAlts]     = useState([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [genPrefs, setGenPrefs]     = useState({ style: '', budget: '', occasion: '' })
  const [genError, setGenError]     = useState('')

  // ── Fetch outfits when scope changes ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    outfitsApi.list(scope)
      .then(data => {
        if (cancelled) return
        setOutfits(data)
        setActiveIdx(0)
        // Reset selections to core items of first outfit
        if (data.length > 0) {
          const coreIds = data[0].items.filter(i => i.is_core).map(i => i.product.id)
          resetSelections(coreIds)
        }
      })
      .catch(() => {
        if (!cancelled) setOutfits([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [scope])

  const outfit = outfits[activeIdx] ?? null

  // Build the effective item list (apply swaps client-side)
  const effectiveItems = outfit
    ? outfit.items.map(item => {
        const swapped = swappedItems[item.product.id]
        return swapped ? { ...item, product: swapped } : item
      })
    : []

  // ── Totals ────────────────────────────────────────────────────────────────
  const selectedItems = effectiveItems.filter(i => selectedIds.has(i.product.id))
  const total = selectedItems.reduce((sum, i) => {
    const price = scope === 'local' ? i.product.price_local : i.product.price_global
    return sum + (price || 0)
  }, 0)

  // ── Swap helpers ──────────────────────────────────────────────────────────
  const openSwap = async (item) => {
    setSwapTarget({ role: item.role, originalId: item.product.id })
    // Load alternatives: same category, different product
    try {
      const alts = await outfitsApi.list(scope)
      // Collect all products with the same role from all outfits
      const candidates = alts.flatMap(o => o.items)
        .filter(i => i.role === item.role && i.product.id !== item.product.id)
        .map(i => i.product)
      // Deduplicate
      const seen = new Set()
      const unique = candidates.filter(p => {
        if (seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })
      setSwapAlts(unique.slice(0, 4))
    } catch {
      setSwapAlts([])
    }
  }

  const confirmSwap = (newProduct) => {
    if (!swapTarget) return
    swapItem(swapTarget.originalId, newProduct)
    // Update selection: if original was selected, select the new one
    if (selectedIds.has(swapTarget.originalId)) {
      // remove old, add new
      const newSet = new Set(selectedIds)
      newSet.delete(swapTarget.originalId)
      newSet.add(newProduct.id)
      selectAll([...newSet])
    }
    setSwapTarget(null)
    setSwapAlts([])
  }

  // ── Generate outfit ───────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!genPrefs.style && !genPrefs.budget && !genPrefs.occasion) {
      setGenError('Please fill in at least one preference.')
      return
    }
    setGenError('')
    setGenerating(true)
    try {
      const generated = await outfitsApi.generate({ ...genPrefs, scope })
      // Prepend generated outfit to list
      setOutfits(prev => [generated, ...prev])
      setActiveIdx(0)
      const coreIds = generated.items.filter(i => i.is_core).map(i => i.product.id)
      resetSelections(coreIds)
      setGenerateOpen(false)
    } catch (err) {
      setGenError(err?.response?.data?.detail || 'Generation failed. Try different preferences.')
    } finally {
      setGenerating(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black pb-24">

      {/* ── Page header ── */}
      <div className="px-8 md:px-12 pt-8 mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-gold/70 font-sans mb-2">CURATED FOR YOU</p>
          <h1 className="font-serif text-4xl md:text-5xl text-cream">Featured</h1>
        </div>

        {/* Scope switcher — always visible, very prominent */}
        <div className="flex flex-col gap-1">
          <p className="text-[9px] tracking-[0.3em] text-gray/50 font-sans">SHOPPING FROM</p>
          <div className="flex border border-white/15 overflow-hidden">
            {['local', 'global'].map(s => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className="px-7 py-2.5 text-[11px] tracking-[0.2em] font-sans transition-all duration-300"
                style={{
                  background: scope === s
                    ? (s === 'local' ? '#af0000' : '#cca350')
                    : 'transparent',
                  color: scope === s
                    ? (s === 'local' ? '#f4ecdc' : '#000')
                    : '#868686',
                }}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-gray/40 font-sans">
            {scope === 'local'
              ? 'Nearby boutiques · Fast delivery'
              : 'International labels · Worldwide shipping'}
          </p>
        </div>
      </div>

      {/* ── Outfit tabs (if multiple) ── */}
      {!loading && outfits.length > 1 && (
        <div className="px-8 md:px-12 mb-6 flex gap-0 overflow-x-auto">
          {outfits.map((o, i) => (
            <button
              key={o.id}
              onClick={() => {
                setActiveIdx(i)
                const coreIds = o.items.filter(x => x.is_core).map(x => x.product.id)
                resetSelections(coreIds)
              }}
              className={`px-5 py-2.5 text-[11px] tracking-[0.15em] font-sans border-b-2 whitespace-nowrap transition-all duration-200 ${
                activeIdx === i
                  ? 'border-gold text-cream'
                  : 'border-transparent text-gray/50 hover:text-gray'
              }`}
            >
              {o.title}
            </button>
          ))}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-6 mb-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="animate-pulse bg-white/[0.04] aspect-[3/4]" />
            ))}
          </div>
        </div>
      )}

      {/* ── No outfits state ── */}
      {!loading && outfit === null && (
        <div className="px-8 md:px-12 py-20 text-center">
          <p className="text-gray font-sans text-sm mb-2">No featured outfits for {scope} yet.</p>
          <p className="text-gray/50 font-sans text-xs">Use "Create My Outfit" below to generate one.</p>
        </div>
      )}

      {/* ── Outfit content ── */}
      {!loading && outfit && (
        <AnimatePresence mode="wait">
          <motion.div
            key={outfit.id + scope}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="px-8 md:px-12"
          >
            {/* Outfit description */}
            {outfit.description && (
              <p className="text-[13px] text-gray/70 font-body leading-relaxed mb-8 max-w-2xl">
                {outfit.description}
              </p>
            )}

            {/* ── Items grid ── */}
            <div className="grid gap-5"
              style={{
                gridTemplateColumns: effectiveItems.length <= 2
                  ? `repeat(${effectiveItems.length}, 1fr)`
                  : effectiveItems[0]?.role === 'anchor'
                    ? `2fr repeat(${effectiveItems.length - 1}, 1fr)`
                    : `repeat(${effectiveItems.length}, 1fr)`
              }}
            >
              {effectiveItems.map((item) => (
                <OutfitItemCard
                  key={item.product.id}
                  item={item}
                  scope={scope}
                  selected={selectedIds.has(item.product.id)}
                  onToggle={() => toggleSelected(item.product.id)}
                  onSwap={() => openSwap(item)}
                  isAnchor={item.role === 'anchor'}
                />
              ))}
            </div>

            {/* ── Bulk controls ── */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => selectAll(effectiveItems.map(i => i.product.id))}
                className="px-4 py-2 text-[10px] tracking-widest font-sans border border-white/15 text-gray/70 hover:border-gold/40 hover:text-cream transition-all duration-200"
              >
                SELECT ALL
              </button>
              <button
                onClick={deselectAll}
                className="px-4 py-2 text-[10px] tracking-widest font-sans border border-white/15 text-gray/70 hover:border-white/30 hover:text-cream transition-all duration-200"
              >
                DESELECT ALL
              </button>
              <button
                onClick={() => selectCore(effectiveItems.filter(i => i.is_core).map(i => i.product.id))}
                className="px-4 py-2 text-[10px] tracking-widest font-sans border border-gold/30 text-gold/70 hover:border-gold hover:text-gold transition-all duration-200"
              >
                CORE OUTFIT ONLY
              </button>
              <span className="text-[10px] text-gray/30 font-sans ml-auto">
                {selectedIds.size} / {effectiveItems.length} items selected
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Divider ── */}
      <div className="mx-8 md:mx-12 my-10 h-px bg-white/[0.06]" />

      {/* ── Create My Outfit ── */}
      <div className="px-8 md:px-12">
        <button
          onClick={() => setGenerateOpen(p => !p)}
          className="flex items-center gap-3 text-[11px] tracking-[0.2em] font-sans text-gray/60 hover:text-cream transition-colors duration-200 mb-0"
        >
          <Sparkles size={13} className="text-gold" />
          CREATE MY OUTFIT
          <ChevronDown
            size={12}
            className={`transition-transform duration-300 ${generateOpen ? 'rotate-180' : ''}`}
            style={{ opacity: 0.5 }}
          />
        </button>

        <AnimatePresence>
          {generateOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="pt-6 pb-2 max-w-2xl">
                <p className="text-[10px] tracking-[0.25em] text-gray/50 font-sans mb-5">
                  DESCRIBE WHAT YOU'RE LOOKING FOR
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Style */}
                  <div>
                    <label className="block text-[9px] tracking-[0.3em] text-gray/50 font-sans mb-1.5">
                      STYLE
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. dark minimalist"
                      value={genPrefs.style}
                      onChange={e => setGenPrefs(p => ({ ...p, style: e.target.value }))}
                      className="w-full bg-transparent border border-white/10 px-3 py-2.5 text-sm text-cream font-body focus:outline-none focus:border-gold transition-colors placeholder-white/20"
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-[9px] tracking-[0.3em] text-gray/50 font-sans mb-1.5">
                      BUDGET
                    </label>
                    <select
                      value={genPrefs.budget}
                      onChange={e => setGenPrefs(p => ({ ...p, budget: e.target.value }))}
                      className="w-full bg-black border border-white/10 px-3 py-2.5 text-sm text-cream font-body focus:outline-none focus:border-gold transition-colors appearance-none"
                    >
                      <option value="">Any budget</option>
                      <option value="<300">Under $300</option>
                      <option value="300-800">$300 – $800</option>
                      <option value="800+">$800+</option>
                    </select>
                  </div>

                  {/* Occasion */}
                  <div>
                    <label className="block text-[9px] tracking-[0.3em] text-gray/50 font-sans mb-1.5">
                      OCCASION
                    </label>
                    <select
                      value={genPrefs.occasion}
                      onChange={e => setGenPrefs(p => ({ ...p, occasion: e.target.value }))}
                      className="w-full bg-black border border-white/10 px-3 py-2.5 text-sm text-cream font-body focus:outline-none focus:border-gold transition-colors appearance-none"
                    >
                      <option value="">Any occasion</option>
                      <option value="casual">Casual</option>
                      <option value="evening">Evening</option>
                      <option value="work">Work</option>
                      <option value="weekend">Weekend</option>
                    </select>
                  </div>
                </div>

                {genError && (
                  <p className="text-[11px] text-red font-sans mb-3">{genError}</p>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-8 py-3 bg-gold text-black text-[11px] tracking-[0.25em] font-sans hover:bg-cream transition-colors duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {generating && <RefreshCw size={12} className="animate-spin" />}
                  {generating ? 'GENERATING...' : 'GENERATE OUTFIT'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sticky footer ── */}
      <div
        className="fixed bottom-0 left-0 md:left-[220px] right-0 z-30 border-t border-white/[0.08] flex items-center justify-between px-8 h-16"
        style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(16px)' }}
      >
        <div>
          <span className="text-[11px] tracking-[0.15em] text-cream font-sans">
            {selectedIds.size > 0
              ? `${selectedIds.size} ITEM${selectedIds.size > 1 ? 'S' : ''} SELECTED`
              : 'NO ITEMS SELECTED'}
          </span>
          {selectedIds.size > 0 && (
            <span className="ml-3 text-[11px] tracking-[0.15em] text-gold font-sans">
              · ${total.toFixed(0)}
            </span>
          )}
        </div>

        <button
          onClick={() => selectedIds.size > 0 && setCheckoutOpen(true)}
          disabled={selectedIds.size === 0}
          className="px-8 py-2.5 text-[11px] tracking-[0.2em] font-sans transition-all duration-300"
          style={{
            background: selectedIds.size > 0 ? '#cca350' : 'transparent',
            color: selectedIds.size > 0 ? '#000' : '#868686',
            border: selectedIds.size === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          PROCEED TO CHECKOUT →
        </button>
      </div>

      {/* ── Swap modal ── */}
      <AnimatePresence>
        {swapTarget && (
          <SwapModal
            alts={swapAlts}
            scope={scope}
            roleLabel={ROLE_LABELS[swapTarget.role] ?? swapTarget.role.toUpperCase()}
            onSelect={confirmSwap}
            onClose={() => { setSwapTarget(null); setSwapAlts([]) }}
          />
        )}
      </AnimatePresence>

      {/* ── Checkout slide-over ── */}
      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutPanel
            selectedItems={selectedItems}
            scope={scope}
            total={total}
            user={user}
            onClose={() => setCheckoutOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Outfit Item Card
// ─────────────────────────────────────────────────────────────────────────────
function OutfitItemCard({ item, scope, selected, onToggle, onSwap, isAnchor }) {
  const { product, role, is_core } = item
  const price = scope === 'local' ? product.price_local : product.price_global
  const image = product.images?.[0]?.url ?? product.image ?? ''
  const brandName = product.brand?.name ?? product.brand ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="group relative flex flex-col border border-white/[0.06] hover:border-white/15 transition-colors duration-300"
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-neutral-900 ${isAnchor ? 'aspect-[3/4]' : 'aspect-[3/4]'}`}>
        {image && (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}

        {/* Role badge */}
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] tracking-[0.2em] font-sans bg-black/70 text-gold/80 border border-gold/20">
          {ROLE_LABELS[role] ?? role.toUpperCase()}
        </span>

        {/* Core badge */}
        {is_core && (
          <span className="absolute top-3 left-3 px-1.5 py-0.5 text-[8px] tracking-widest font-sans bg-gold/10 text-gold/60 border border-gold/20">
            CORE
          </span>
        )}

        {/* Checkbox overlay */}
        <button
          onClick={onToggle}
          className="absolute bottom-3 left-3 w-6 h-6 border-2 flex items-center justify-center transition-all duration-200"
          style={{
            borderColor: selected ? '#cca350' : 'rgba(255,255,255,0.3)',
            background: selected ? '#cca350' : 'rgba(0,0,0,0.5)',
          }}
        >
          {selected && <Check size={12} color="#000" strokeWidth={3} />}
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col gap-1">
        <p className="text-[9px] tracking-[0.25em] text-gray/50 font-sans">{brandName.toUpperCase()}</p>
        <p className="text-[13px] text-cream font-sans leading-snug">{product.name}</p>
        <p className="text-[13px] text-gold font-sans mt-auto pt-1">${price}</p>

        {/* Swap */}
        <button
          onClick={onSwap}
          className="mt-2 flex items-center gap-1.5 text-[10px] tracking-widest font-sans text-gray/40 hover:text-cream transition-colors duration-200 self-start"
        >
          <RefreshCw size={10} />
          SWAP
        </button>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Swap Modal
// ─────────────────────────────────────────────────────────────────────────────
function SwapModal({ alts, scope, roleLabel, onSelect, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20, clipPath: 'inset(0 0 100% 0)' }}
        animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
        exit={{ opacity: 0, y: 10, clipPath: 'inset(0 0 100% 0)' }}
        transition={{ duration: 0.3, ease: EASE }}
        className="fixed bottom-0 left-0 md:left-[220px] right-0 z-50 border-t border-white/10 p-8"
        style={{ background: 'rgba(4,4,4,0.99)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-widest text-gold font-sans">SWAP {roleLabel}</p>
            <p className="text-[12px] text-gray/50 font-sans mt-0.5">Select a replacement</p>
          </div>
          <button onClick={onClose} className="text-gray/50 hover:text-cream transition-colors">
            <X size={16} />
          </button>
        </div>

        {alts.length === 0 ? (
          <p className="text-[12px] text-gray/40 font-sans py-4">No alternatives found for this scope.</p>
        ) : (
          <div className={`grid gap-4 grid-cols-2 md:grid-cols-4`}>
            {alts.map(product => {
              const price = scope === 'local' ? product.price_local : product.price_global
              const image = product.images?.[0]?.url ?? product.image ?? ''
              const brandName = product.brand?.name ?? product.brand ?? ''
              return (
                <button
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="group text-left border border-white/[0.06] hover:border-gold/40 transition-colors duration-300 overflow-hidden"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-neutral-900">
                    {image && (
                      <img src={image} alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[9px] tracking-widest text-gray/50 font-sans">{brandName.toUpperCase()}</p>
                    <p className="text-[12px] text-cream font-sans leading-snug mt-0.5">{product.name}</p>
                    <p className="text-[12px] text-gold font-sans mt-1">${price}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </motion.div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkout Slide-Over Panel
// ─────────────────────────────────────────────────────────────────────────────
function CheckoutPanel({ selectedItems, scope, total, user, onClose }) {
  const [step, setStep]             = useState('summary') // 'summary' | 'payment' | 'confirmed'
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]             = useState({
    firstName: '', lastName: '', email: '', address: '', city: '', country: '', zip: '',
    card: '', expiry: '', cvv: '',
  })
  const update = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleConfirm = async () => {
    if (user) {
      setSubmitting(true)
      try {
        await ordersApi.create({
          mode: scope,
          items: selectedItems.map(i => ({
            product_id: i.product.id,
            size: i.product.sizes?.[0] ?? 'ONE SIZE',
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
        console.warn('Order API failed:', e)
      } finally {
        setSubmitting(false)
      }
    }
    setStep('confirmed')
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 bg-black z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.38, ease: EASE }}
        className="fixed right-0 top-0 h-full w-full md:w-[500px] z-50 overflow-y-auto"
        style={{ background: 'rgba(4,4,4,0.99)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06]">
          <div>
            <p className="text-[10px] tracking-widest text-gold font-sans">
              {step === 'confirmed' ? 'ORDER PLACED' : 'CHECKOUT'}
            </p>
            <p className="text-[12px] text-gray/40 font-sans mt-0.5">
              {step === 'confirmed' ? '' : `${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} · $${total.toFixed(0)}`}
            </p>
          </div>
          {step !== 'confirmed' && (
            <button onClick={onClose} className="text-gray/50 hover:text-cream transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="px-8 py-6">
          <AnimatePresence mode="wait">
            {step === 'confirmed' ? (
              <ConfirmedStep onClose={onClose} />
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                {/* Step tabs */}
                <div className="flex gap-0 mb-8 border-b border-white/[0.06]">
                  {['summary', 'payment'].map((s, i) => (
                    <button
                      key={s}
                      onClick={() => step === 'payment' && s === 'summary' && setStep('summary')}
                      className={`px-5 py-3 text-[10px] tracking-[0.2em] font-sans border-b-2 transition-all duration-200 -mb-px ${
                        step === s ? 'border-gold text-cream' : 'border-transparent text-gray/40'
                      }`}
                    >
                      {`0${i + 1} ${s === 'summary' ? 'DELIVERY' : 'PAYMENT'}`}
                    </button>
                  ))}
                </div>

                {/* Item summary (always visible at top) */}
                <div className="space-y-3 mb-8 pb-6 border-b border-white/[0.06]">
                  {selectedItems.map((item, i) => {
                    const price = scope === 'local' ? item.product.price_local : item.product.price_global
                    const image = item.product.images?.[0]?.url ?? item.product.image ?? ''
                    const brandName = item.product.brand?.name ?? item.product.brand ?? ''
                    return (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-12 aspect-[3/4] flex-shrink-0 overflow-hidden bg-neutral-900">
                          {image && <img src={image} alt={item.product.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] tracking-widest text-gray/50 font-sans">{brandName.toUpperCase()}</p>
                          <p className="text-[12px] text-cream font-sans mt-0.5 leading-snug truncate">{item.product.name}</p>
                          <p className="text-[10px] text-gray/40 font-sans mt-0.5 capitalize">{item.role}</p>
                        </div>
                        <p className="text-[13px] text-cream font-sans flex-shrink-0">${price}</p>
                      </div>
                    )
                  })}
                  <div className="flex justify-between pt-2">
                    <span className="text-[10px] tracking-widest text-gray font-sans">TOTAL</span>
                    <span className="text-lg font-serif text-cream">${total.toFixed(0)}</span>
                  </div>
                </div>

                {/* Form */}
                {step === 'summary' && (
                  <PanelDeliveryForm form={form} update={update} onNext={() => setStep('payment')} />
                )}
                {step === 'payment' && (
                  <PanelPaymentForm
                    form={form}
                    update={update}
                    submitting={submitting}
                    onConfirm={handleConfirm}
                  />
                )}
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
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="py-16 text-center"
    >
      <motion.div
        className="w-14 h-14 bg-gold flex items-center justify-center mx-auto mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.15 }}
      >
        <Check size={24} className="text-black" />
      </motion.div>
      <p className="text-[10px] tracking-[0.4em] text-gold font-sans mb-3">ORDER PLACED</p>
      <h2 className="font-serif text-3xl text-cream mb-3">Thank you.</h2>
      <p className="text-sm text-gray font-body leading-relaxed mb-8">
        Your outfit order has been received. A confirmation email is on its way.
      </p>
      <button
        onClick={onClose}
        className="px-8 py-3 bg-gold text-black text-xs tracking-[0.25em] font-sans hover:bg-cream transition-colors"
      >
        BACK TO FEATURED
      </button>
    </motion.div>
  )
}

function PanelDeliveryForm({ form, update, onNext }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onNext() }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <PanelField label="FIRST NAME" value={form.firstName} onChange={v => update('firstName', v)} required />
        <PanelField label="LAST NAME"  value={form.lastName}  onChange={v => update('lastName', v)}  required />
      </div>
      <PanelField label="EMAIL"   type="email" value={form.email}   onChange={v => update('email', v)}   required />
      <PanelField label="ADDRESS"              value={form.address} onChange={v => update('address', v)} required />
      <div className="grid grid-cols-2 gap-3">
        <PanelField label="CITY"        value={form.city}    onChange={v => update('city', v)}    required />
        <PanelField label="POSTAL CODE" value={form.zip}     onChange={v => update('zip', v)}     required />
      </div>
      <PanelField label="COUNTRY" value={form.country} onChange={v => update('country', v)} required />
      <button
        type="submit"
        className="mt-2 w-full py-3.5 bg-gold text-black text-xs tracking-[0.25em] font-sans flex items-center justify-center gap-2 hover:bg-cream transition-colors group"
      >
        CONTINUE TO PAYMENT
        <Truck size={12} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  )
}

function PanelPaymentForm({ form, update, onConfirm, submitting }) {
  const fmt = {
    card:   v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(),
    expiry: v => {
      const d = v.replace(/\D/g, '').slice(0, 4)
      return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d
    },
  }
  return (
    <form onSubmit={e => { e.preventDefault(); onConfirm() }} className="space-y-4">
      <div className="border border-white/10 p-4 space-y-3">
        <p className="text-[9px] tracking-[0.3em] text-gray/50 font-sans">CARD DETAILS</p>
        <PanelField label="CARD NUMBER" value={form.card}
          onChange={v => update('card', fmt.card(v))} placeholder="0000 0000 0000 0000" required />
        <div className="grid grid-cols-2 gap-3">
          <PanelField label="EXPIRY" value={form.expiry}
            onChange={v => update('expiry', fmt.expiry(v))} placeholder="MM / YY" required />
          <PanelField label="CVV" value={form.cvv}
            onChange={v => update('cvv', v.replace(/\D/g, '').slice(0, 4))} placeholder="•••" required />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Lock size={9} className="text-gray/30" />
        <p className="text-[9px] tracking-widest text-gray/30 font-sans">256-bit SSL encrypted</p>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 bg-gold text-black text-xs tracking-[0.25em] font-sans flex items-center justify-center gap-2 hover:bg-cream transition-colors disabled:opacity-50"
      >
        <CreditCard size={12} />
        {submitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
      </button>
    </form>
  )
}

function PanelField({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div className="group">
      <label className="block text-[9px] tracking-[0.25em] text-gray/50 font-sans mb-1.5 group-focus-within:text-gold transition-colors">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-transparent border border-white/10 px-3 py-2.5 text-sm text-cream font-body focus:outline-none focus:border-gold transition-colors placeholder-white/15"
      />
    </div>
  )
}
