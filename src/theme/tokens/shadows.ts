import { alpha } from '@mui/material/styles'

import { grey, info, error, common, primary, success, warning, secondary } from './palette'

/**
 * Minimals-derived custom shadows. The `card` shadow (a faint 2px halo plus a
 * soft 24px drop) is what gives Minimals cards their floating feel. Contained
 * buttons use the color-matched shadows on hover.
 */

export interface CustomShadows {
  z1: string
  z4: string
  z8: string
  z12: string
  z16: string
  z20: string
  z24: string
  dialog: string
  card: string
  dropdown: string
  primary: string
  secondary: string
  info: string
  success: string
  warning: string
  error: string
}

const colorShadow = (color: string) => `0 8px 16px 0 ${alpha(color, 0.24)}`

const createCustomShadows = (base: string): CustomShadows => ({
  z1: `0 1px 2px 0 ${alpha(base, 0.16)}`,
  z4: `0 4px 8px 0 ${alpha(base, 0.16)}`,
  z8: `0 8px 16px 0 ${alpha(base, 0.16)}`,
  z12: `0 12px 24px -4px ${alpha(base, 0.16)}`,
  z16: `0 16px 32px -4px ${alpha(base, 0.16)}`,
  z20: `0 20px 40px -4px ${alpha(base, 0.16)}`,
  z24: `0 24px 48px 0 ${alpha(base, 0.16)}`,
  dialog: `-40px 40px 80px -8px ${alpha(common.black, 0.24)}`,
  card: `0 0 2px 0 ${alpha(base, 0.2)}, 0 12px 24px -4px ${alpha(base, 0.12)}`,
  dropdown: `0 0 2px 0 ${alpha(base, 0.24)}, -20px 20px 40px -4px ${alpha(base, 0.24)}`,
  primary: colorShadow(primary.main),
  secondary: colorShadow(secondary.main),
  info: colorShadow(info.main),
  success: colorShadow(success.main),
  warning: colorShadow(warning.main),
  error: colorShadow(error.main),
})

export const customShadows = {
  light: createCustomShadows(grey[500]),
  dark: createCustomShadows(common.black),
}
