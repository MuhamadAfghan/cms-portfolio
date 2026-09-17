import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createReview, deleteReview, fetchReviews, updateReview } from '../services/reviewService'
import type { Review, ReviewInput } from '../types/review'

interface ReviewContextValue {
  items: Review[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createItem: (input: ReviewInput) => Promise<Review>
  updateItem: (id: string, input: ReviewInput) => Promise<Review>
  removeItem: (item: Review) => Promise<void>
}

const ReviewContext = createContext<ReviewContextValue | null>(null)

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchReviews()
      setItems(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load reviews.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createItem = useCallback(async (input: ReviewInput) => {
    setError(null)
    const created = await createReview(input)
    setItems((prev) => [created, ...prev])
    return created
  }, [])

  const updateItem = useCallback(async (id: string, input: ReviewInput) => {
    setError(null)
    const updated = await updateReview(id, input)
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
    return updated
  }, [])

  const removeItem = useCallback(async (item: Review) => {
    setError(null)
    await deleteReview(item.id)
    setItems((prev) => prev.filter((entry) => entry.id !== item.id))
  }, [])

  const value = useMemo(
    () => ({ items, loading, error, refresh, createItem, updateItem, removeItem }),
    [items, loading, error, refresh, createItem, updateItem, removeItem],
  )

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
}

export const useReviews = () => {
  const context = useContext(ReviewContext)
  if (!context) {
    throw new Error('useReviews must be used within ReviewProvider')
  }
  return context
}
