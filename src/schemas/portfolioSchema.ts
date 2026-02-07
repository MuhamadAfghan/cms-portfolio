import type { PortfolioInput, PortfolioStatus } from '../types/portfolio'

interface ValidationResult {
  valid: boolean
  message?: string
}

const normalizeStatus = (value: string): PortfolioStatus =>
  value === 'published' ? 'published' : 'draft'

export const normalizePortfolioInput = (
  input: PortfolioInput,
): PortfolioInput => ({
  title: input.title.trim(),
  slug: input.slug?.trim() || null,
  summary: input.summary?.trim() || null,
  content: input.content?.trim() || null,
  link_demo: input.link_demo?.trim() || null,
  link_github: input.link_github?.trim() || null,
  status: normalizeStatus(input.status),
  featured: Boolean(input.featured),
})

export const validatePortfolioInput = (
  input: PortfolioInput,
): ValidationResult => {
  if (!input.title.trim()) {
    return { valid: false, message: 'Title is required.' }
  }

  if (input.status !== 'draft' && input.status !== 'published') {
    return { valid: false, message: 'Status must be draft or published.' }
  }

  return { valid: true }
}
