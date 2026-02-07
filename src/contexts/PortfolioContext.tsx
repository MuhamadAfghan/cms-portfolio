import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createPortfolio,
  deletePortfolio,
  fetchPortfolios,
  updatePortfolio,
} from '../services/portfolioService'
import type {
  PortfolioInput,
  PortfolioWithRelations,
} from '../types/portfolio'

interface PortfolioContextValue {
  items: PortfolioWithRelations[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createItem: (
    input: PortfolioInput,
    options?: { images?: File[]; techStackIds?: string[] },
  ) => Promise<PortfolioWithRelations>
  updateItem: (
    id: string,
    input: PortfolioInput,
    options?: {
      images?: File[]
      techStackIds?: string[]
      removedImages?: { id: string; url: string }[]
    },
  ) => Promise<PortfolioWithRelations>
  removeItem: (item: PortfolioWithRelations) => Promise<void>
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<PortfolioWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPortfolios()
      setItems(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load portfolios.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createItem = useCallback(
    async (
      input: PortfolioInput,
      options?: { images?: File[]; techStackIds?: string[] },
    ) => {
      setError(null)
      const created = await createPortfolio(input, options)
      setItems((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const updateItem = useCallback(
    async (
      id: string,
      input: PortfolioInput,
      options?: {
        images?: File[]
        techStackIds?: string[]
        removedImages?: { id: string; url: string }[]
      },
    ) => {
      setError(null)
      const updated = await updatePortfolio(id, input, options)
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
      return updated
    },
    [],
  )

  const removeItem = useCallback(async (item: PortfolioWithRelations) => {
    setError(null)
    await deletePortfolio(item)
    setItems((prev) => prev.filter((entry) => entry.id !== item.id))
  }, [])

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      refresh,
      createItem,
      updateItem,
      removeItem,
    }),
    [items, loading, error, refresh, createItem, updateItem, removeItem],
  )

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}

export const usePortfolios = () => {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolios must be used within PortfolioProvider')
  }
  return context
}
