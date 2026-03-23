import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'daarvi_featured_state_v2'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage quota or private mode — silently ignore
  }
}

/**
 * Persists the Featured page's full interaction state to localStorage.
 *
 * Returns:
 *   scope / setScope
 *   selectedIds        — Set<string>
 *   toggleSelected(id)
 *   selectAll(ids)
 *   deselectAll()
 *   selectCore(coreIds)
 *   swappedItems       — { [originalProductId]: newProduct }
 *   swapItem(originalId, newProduct)
 *   resetSelections(coreIds)
 *   selectedSizes      — { [productId]: string }  (size picker)
 *   setSizeForProduct(productId, size)
 *   recentlyViewed     — Array<{ id, title, scope, heroImage }>
 *   addToRecentlyViewed(outfit)
 *   savedOutfitIds     — Set<string>  (local bookmark cache)
 *   toggleLocalSave(id)
 *   outfitRatings      — { [outfitId]: 'up' | 'down' }
 *   setOutfitRating(outfitId, rating)
 *   clearFeatured()
 */
export function useFeaturedState(defaultScope = 'global') {
  const saved = loadState()

  const [scope, _setScope] = useState(saved?.scope ?? defaultScope)
  const [selectedIds, _setSelectedIds] = useState(() => new Set(saved?.selectedIds ?? []))
  const [swappedItems, _setSwappedItems] = useState(saved?.swappedItems ?? {})
  const [selectedSizes, _setSelectedSizes] = useState(saved?.selectedSizes ?? {})
  const [recentlyViewed, _setRecentlyViewed] = useState(saved?.recentlyViewed ?? [])
  const [savedOutfitIds, _setSavedOutfitIds] = useState(() => new Set(saved?.savedOutfitIds ?? []))
  const [outfitRatings, _setOutfitRatings] = useState(saved?.outfitRatings ?? {})

  // Persist whenever anything changes
  useEffect(() => {
    saveState({
      scope,
      selectedIds: [...selectedIds],
      swappedItems,
      selectedSizes,
      recentlyViewed,
      savedOutfitIds: [...savedOutfitIds],
      outfitRatings,
    })
  }, [scope, selectedIds, swappedItems, selectedSizes, recentlyViewed, savedOutfitIds, outfitRatings])

  // ── Scope ──────────────────────────────────────────────────────────────────
  const setScope = useCallback((s) => _setScope(s), [])

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleSelected = useCallback((id) => {
    _setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback((ids) => _setSelectedIds(new Set(ids)), [])
  const deselectAll = useCallback(() => _setSelectedIds(new Set()), [])
  const selectCore = useCallback((coreIds) => _setSelectedIds(new Set(coreIds)), [])

  // ── Swaps ─────────────────────────────────────────────────────────────────
  const swapItem = useCallback((originalId, newProduct) => {
    _setSwappedItems(prev => ({ ...prev, [originalId]: newProduct }))
  }, [])

  const resetSelections = useCallback((coreIds) => {
    _setSelectedIds(new Set(coreIds))
    _setSwappedItems({})
    _setSelectedSizes({})
  }, [])

  // ── Size picker ───────────────────────────────────────────────────────────
  const setSizeForProduct = useCallback((productId, size) => {
    _setSelectedSizes(prev => ({ ...prev, [productId]: size }))
  }, [])

  // ── Recently viewed ───────────────────────────────────────────────────────
  const addToRecentlyViewed = useCallback((outfit) => {
    if (!outfit?.id || outfit.id === '__generated__') return
    _setRecentlyViewed(prev => {
      const filtered = prev.filter(o => o.id !== outfit.id)
      const entry = {
        id: outfit.id,
        title: outfit.title,
        scope: outfit.scope,
        heroImage: outfit.hero_image ?? null,
        anchorImage: outfit.items?.find(i => i.role === 'anchor')?.product?.images?.[0]?.url ?? null,
      }
      return [entry, ...filtered].slice(0, 8)
    })
  }, [])

  // ── Saved outfits (local cache) ───────────────────────────────────────────
  const toggleLocalSave = useCallback((id) => {
    _setSavedOutfitIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  // Override local saved IDs from server (called after API fetch)
  const setSavedOutfitIds = useCallback((ids) => {
    _setSavedOutfitIds(new Set(ids))
  }, [])

  // ── Ratings ───────────────────────────────────────────────────────────────
  const setOutfitRating = useCallback((outfitId, rating) => {
    _setOutfitRatings(prev => ({ ...prev, [outfitId]: rating }))
  }, [])

  // ── Clear all ─────────────────────────────────────────────────────────────
  const clearFeatured = useCallback(() => {
    _setScope(defaultScope)
    _setSelectedIds(new Set())
    _setSwappedItems({})
    _setSelectedSizes({})
    _setRecentlyViewed([])
    _setSavedOutfitIds(new Set())
    _setOutfitRatings({})
    localStorage.removeItem(STORAGE_KEY)
  }, [defaultScope])

  return {
    scope, setScope,
    selectedIds, toggleSelected, selectAll, deselectAll, selectCore,
    swappedItems, swapItem,
    resetSelections,
    selectedSizes, setSizeForProduct,
    recentlyViewed, addToRecentlyViewed,
    savedOutfitIds, toggleLocalSave, setSavedOutfitIds,
    outfitRatings, setOutfitRating,
    clearFeatured,
  }
}
