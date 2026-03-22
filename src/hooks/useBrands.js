import { useQuery } from '@tanstack/react-query'
import { brandsApi } from '../api/brands'

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: brandsApi.list,
    staleTime: 1000 * 60 * 10,
  })
}

export function useBrand(idOrSlug) {
  return useQuery({
    queryKey: ['brand', idOrSlug],
    queryFn: () => brandsApi.get(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 1000 * 60 * 10,
  })
}
