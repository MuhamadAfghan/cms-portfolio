import type { TechStack } from './techStack'

export type PortfolioStatus = 'draft' | 'published'

export interface Portfolio {
  id: string
  title: string
  slug: string | null
  summary: string | null
  content: string | null
  link_demo: string | null
  link_github: string | null
  status: PortfolioStatus
  featured: boolean
  created_at?: string
  updated_at?: string
}

export interface PortfolioImage {
  id: string
  url: string
  sort_order: number | null
}

export interface PortfolioWithRelations extends Portfolio {
  images: PortfolioImage[]
  techStacks: TechStack[]
}

export interface PortfolioInput {
  title: string
  slug?: string | null
  summary?: string | null
  content?: string | null
  link_demo?: string | null
  link_github?: string | null
  status: PortfolioStatus
  featured: boolean
}
