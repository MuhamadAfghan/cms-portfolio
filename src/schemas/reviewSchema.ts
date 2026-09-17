import type { ReviewInput } from '../types/review'

interface ValidationResult {
  valid: boolean
  message?: string
}

export const normalizeReviewInput = (input: ReviewInput): ReviewInput => ({
  name: input.name?.trim() || null,
  role: input.role.trim(),
  company_name: input.company_name?.trim() || null,
  rating: Number(input.rating) || 0,
  review: input.review.trim(),
  is_private: Boolean(input.is_private),
})

export const validateReviewInput = (input: ReviewInput): ValidationResult => {
  if (!input.role.trim()) {
    return { valid: false, message: 'Role is required.' }
  }
  if (!input.review.trim()) {
    return { valid: false, message: 'Review text is required.' }
  }
  if (input.rating < 0 || input.rating > 5) {
    return { valid: false, message: 'Rating must be between 0 and 5.' }
  }
  return { valid: true }
}
