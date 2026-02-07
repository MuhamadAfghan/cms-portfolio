import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createTechStack, deleteTechStack, fetchTechStacks, updateTechStack } from '../services/techStackService'
import type { TechStack, TechStackInput } from '../types/techStack'

interface TechStackContextValue {
  items: TechStack[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createItem: (
    input: TechStackInput,
    options?: { imageFile?: File | null; svgCode?: string },
  ) => Promise<TechStack>
  updateItem: (
    id: string,
    input: TechStackInput,
    options?: {
      imageFile?: File | null
      svgCode?: string
      previousSource?: string | null
    },
  ) => Promise<TechStack>
  removeItem: (item: TechStack) => Promise<void>
}

const TechStackContext = createContext<TechStackContextValue | null>(null)

export const TechStackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<TechStack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTechStacks()
      setItems(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tech stacks.'
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
      input: TechStackInput,
      options?: { imageFile?: File | null; svgCode?: string },
    ) => {
      setError(null)
      const created = await createTechStack(input, options)
      setItems((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const updateItem = useCallback(
    async (
      id: string,
      input: TechStackInput,
      options?: {
        imageFile?: File | null
        svgCode?: string
        previousSource?: string | null
      },
    ) => {
      setError(null)
      const updated = await updateTechStack(id, input, options)
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
      return updated
    },
    [],
  )

  const removeItem = useCallback(async (item: TechStack) => {
    setError(null)
    await deleteTechStack(item.id, item.source)
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

  return <TechStackContext.Provider value={value}>{children}</TechStackContext.Provider>
}

export const useTechStacks = () => {
  const context = useContext(TechStackContext)
  if (!context) {
    throw new Error('useTechStacks must be used within TechStackProvider')
  }
  return context
}
