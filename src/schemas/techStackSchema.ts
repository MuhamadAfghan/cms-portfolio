import type { TechStackIconType, TechStackInput } from '../types/techStack'

interface ValidationResult {
  valid: boolean
  message?: string
}

export const normalizeTechStackInput = (
  input: TechStackInput,
): TechStackInput => ({
  name: input.name.trim(),
  type: input.type,
  source: input.source?.trim() || null,
})

export const validateTechStackInput = (
  input: TechStackInput,
): ValidationResult => {
  if (!input.name.trim()) {
    return { valid: false, message: 'Stack name is required.' }
  }

  if (input.type === 'image' || input.type === 'svg') {
    return { valid: true }
  }

  const _exhaustive: TechStackIconType = input.type
  return { valid: false, message: `Unsupported icon type: ${_exhaustive}` }
}
