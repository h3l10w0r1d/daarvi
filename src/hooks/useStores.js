import { useQuery } from '@tanstack/react-query'
import { storesApi } from '../api/stores'

export function useStores(mode = null) {
  return useQuery({
    queryKey: ['stores', mode],
    queryFn: () => storesApi.list(mode),
    staleTime: 1000 * 60 * 10,
  })
}
