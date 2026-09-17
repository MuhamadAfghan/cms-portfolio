import { createTheme } from '@mui/material/styles'

import { typography } from './tokens/typography'
import { componentsOverrides } from './overrides'
import { lightPalette, darkPalette } from './tokens/palette'
import { customShadows, type CustomShadows } from './tokens/shadows'

/**
 * Theme assembly. Palette, typography and custom shadows come from the
 * Minimals-derived tokens in ./tokens. Component overrides live in ./overrides
 * (added in a later phase). Two modes: dark (default) and light (cupcake→light).
 */

export type ThemeMode = 'dark' | 'light'

/* ------------------------------------------------------------------ */
/* Type augmentation: extra palette steps + theme.customShadows.       */
/* ------------------------------------------------------------------ */
declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter: string
    darker: string
  }
  interface SimplePaletteColorOptions {
    lighter?: string
    darker?: string
  }
  interface TypeBackground {
    neutral: string
  }
  interface Theme {
    customShadows: CustomShadows
  }
  interface ThemeOptions {
    customShadows?: CustomShadows
  }
}

const shared = {
  typography,
  shape: { borderRadius: 8 },
  components: componentsOverrides,
} as const

export const darkTheme = createTheme({
  ...shared,
  palette: darkPalette,
  customShadows: customShadows.dark,
})

export const lightTheme = createTheme({
  ...shared,
  palette: lightPalette,
  customShadows: customShadows.light,
})

export const themes: Record<ThemeMode, typeof darkTheme> = {
  dark: darkTheme,
  light: lightTheme,
}
