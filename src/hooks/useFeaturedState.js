import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'daarvi_featured_state'

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
 * Persists the Featured page's scope, selected product IDs, and swapped items
 * to localStorage so state survives page refresh.
 *
 * Returns:
 *   scope, setScope
 *   selectedIds  — Set<string>
 *   toggleSelected(id)
 *   selectAll(ids)
 *   deselectAll()
 *   selectCore(coreIds)
 *   swappedItems — { [originalProductId]: newProduct }
 *   swapItem(originalId, newProduct)
 *   clearFeatured()  — resets everything
 */
export function useFeaturedState(defaultScope = 'global') {
  const saved = loadState()

  const [scope, _setScope] = useState(saved?.scope ?? defaultScope)
  const [selectedIds, _setSelectedIds] = useState(
    () => new Set(saved?.selectedIds ?? [])
  )
  const [swappedItems, _setSwappedItems] = useState(saved?.swappedItems ?? {})

  // Persist whenever anything changes
  useEffect(() => {
    saveState({
      scope,
      selectedIds: [...selectedIds],
      swappedItems,
    })
  }, [scope, selectedIds, swappedItems])

  const setScope = useCallback((s) => _setScope(s), [])

  const toggleSelected = useCallback((id) => {
    _setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback((ids) => {
    _setSelectedIds(new Set(ids))
  }, [])

  const deselectAll = useCallback(() => {
    _setSelectedIds(new Set())
  }, [])

  const selectCore = useCallback((coreIds) => {
    _setSelectedIds(new Set(coreIds))
  }, [])

  const swapItem = useCallback((originalId, newProduct) => {
    _setSwappedItems(prev => ({ ...prev, [originalId]: newProduct }))
  }, [])

  const resetSelections = useCallback((coreIds) => {
    _setSelectedIds(new Set(coreIds))
    _setSwappedItems({})
  }, [])

  const clearFeatured = useCallback(() => {
    _setScope(defaultScope)
    _setSelectedIds(new Set())
    _setSwappedItems({})
    localStorage.removeItem(STORAGE_KEY)
  }, [defaultScope])

  return {
    scope,
    setScope,
    selectedIds,
    toggleSelected,
    selectAll,
    deselectAll,
    selectCore,
    swappedItems,
    swapItem,
    resetSelections,
    clearFeatured,
  }
}
