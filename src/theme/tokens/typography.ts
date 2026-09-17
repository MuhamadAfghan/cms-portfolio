import type { TypographyVariantsOptions } from '@mui/material/styles'

/**
 * Minimals-derived typography. Public Sans for body/UI, Barlow for the
 * large display headings (h1–h3). Heading sizes scale up at breakpoints
 * (matching Minimals' responsiveFontSizes).
 */

const PRIMARY_FONT = '"Public Sans Variable", "Public Sans", system-ui, sans-serif'
const SECONDARY_FONT = '"Barlow", "Public Sans Variable", system-ui, sans-serif'

const pxToRem = (value: number) => `${value / 16}rem`

// Standard MUI breakpoints, expressed as raw media queries so we don't need
// a theme instance at token-definition time.
const up = (px: number) => `@media (min-width:${px}px)`
const SM = 600
const MD = 900
const LG = 1200

type ResponsiveSizes = { sm?: number; md?: number; lg?: number }

const responsiveFontSizes = ({ sm, md, lg }: ResponsiveSizes) => ({
  ...(sm !== undefined && { [up(SM)]: { fontSize: pxToRem(sm) } }),
  ...(md !== undefined && { [up(MD)]: { fontSize: pxToRem(md) } }),
  ...(lg !== undefined && { [up(LG)]: { fontSize: pxToRem(lg) } }),
})

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
}

export const typography: TypographyVariantsOptions = {
  fontFamily: PRIMARY_FONT,
  fontWeightLight: fontWeight.light,
  fontWeightRegular: fontWeight.regular,
  fontWeightMedium: fontWeight.medium,
  fontWeightBold: fontWeight.bold,
  h1: {
    fontFamily: SECONDARY_FONT,
    fontWeight: fontWeight.extraBold,
    lineHeight: 80 / 64,
    fontSize: pxToRem(40),
    ...responsiveFontSizes({ sm: 52, md: 58, lg: 64 }),
  },
  h2: {
    fontFamily: SECONDARY_FONT,
    fontWeight: fontWeight.extraBold,
    lineHeight: 64 / 48,
    fontSize: pxToRem(32),
    ...responsiveFontSizes({ sm: 40, md: 44, lg: 48 }),
  },
  h3: {
    fontFamily: SECONDARY_FONT,
    fontWeight: fontWeight.bold,
    lineHeight: 1.5,
    fontSize: pxToRem(24),
    ...responsiveFontSizes({ sm: 26, md: 30, lg: 32 }),
  },
  h4: {
    fontWeight: fontWeight.bold,
    lineHeight: 1.5,
    fontSize: pxToRem(20),
    ...responsiveFontSizes({ md: 24 }),
  },
  h5: {
    fontWeight: fontWeight.bold,
    lineHeight: 1.5,
    fontSize: pxToRem(18),
    ...responsiveFontSizes({ sm: 19 }),
  },
  h6: {
    fontWeight: fontWeight.semiBold,
    lineHeight: 28 / 18,
    fontSize: pxToRem(17),
    ...responsiveFontSizes({ sm: 18 }),
  },
  subtitle1: {
    fontWeight: fontWeight.semiBold,
    lineHeight: 1.5,
    fontSize: pxToRem(16),
  },
  subtitle2: {
    fontWeight: fontWeight.semiBold,
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
  },
  body1: {
    lineHeight: 1.5,
    fontSize: pxToRem(16),
  },
  body2: {
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
  },
  caption: {
    lineHeight: 1.5,
    fontSize: pxToRem(12),
  },
  overline: {
    fontWeight: fontWeight.bold,
    lineHeight: 1.5,
    fontSize: pxToRem(12),
    textTransform: 'uppercase',
  },
  button: {
    fontWeight: fontWeight.bold,
    lineHeight: 24 / 14,
    fontSize: pxToRem(14),
    textTransform: 'none',
  },
}
