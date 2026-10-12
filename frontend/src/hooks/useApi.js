import { useCallback, useEffect, useRef, useState } from 'react'

export function useApi(fetcher, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const load = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!immediate) return
    let active = true
    setLoading(true)
    setError(null)
    fetcherRef
      .current()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err) => {
        if (active) setError(err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, reload: load, setData }
}
