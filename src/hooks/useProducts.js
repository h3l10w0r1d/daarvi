import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { productsApi } from '../api/products'

const PAGE_SIZE = 24
const STALE = 1000 * 60 * 5 // 5 min

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
    staleTime: STALE,
  })
}

/**
 * Paginated variant for the Home feed.
 * Uses offset/limit. getNextPageParam returns undefined when a page
 * returns fewer items than PAGE_SIZE, signalling no more pages.
 */
export function useProductsInfinite(params = {}) {
  return useInfiniteQuery({
    queryKey: ['products-infinite', params],
    queryFn: ({ pageParam }) =>
      productsApi.list({ ...params, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,   // required by react-query v5
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.length * PAGE_SIZE
    },
    staleTime: STALE,
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useRecommended(style = '', limit = 4) {
  return useQuery({
    queryKey: ['recommended', style, limit],
    queryFn: () => productsApi.recommended(style, limit),
    staleTime: STALE,
  })
}
