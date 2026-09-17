import { alpha } from '@mui/material/styles'

/**
 * Minimals-derived palette. Each semantic color carries a 5-step scale
 * (lighter → darker), and grey spans 50–900 with base 500 (#919EAB) —
 * the backbone of the Minimals look. Values are extracted (not copied
 * from the licensed package) from Minimal_JavaScript v7.7.0.
 */

export const grey = {
  50: '#FCFDFD',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#1C252E',
  900: '#141A21',
}

export const primary = {
  lighter: '#C8FAD6',
  light: '#5BE49B',
  main: '#00A76F',
  dark: '#007867',
  darker: '#004B50',
  contrastText: '#FFFFFF',
}

export const secondary = {
  lighter: '#EFD6FF',
  light: '#C684FF',
  main: '#8E33FF',
  dark: '#5119B7',
  darker: '#27097A',
  contrastText: '#FFFFFF',
}

export const info = {
  lighter: '#CAFDF5',
  light: '#61F3F3',
  main: '#00B8D9',
  dark: '#006C9C',
  darker: '#003768',
  contrastText: '#FFFFFF',
}

export const success = {
  lighter: '#D3FCD2',
  light: '#77ED8B',
  main: '#22C55E',
  dark: '#118D57',
  darker: '#065E49',
  contrastText: '#FFFFFF',
}

export const warning = {
  lighter: '#FFF5CC',
  light: '#FFD666',
  main: '#FFAB00',
  dark: '#B76E00',
  darker: '#7A4100',
  contrastText: '#1C252E',
}

export const error = {
  lighter: '#FFE9D5',
  light: '#FFAC82',
  main: '#FF5630',
  dark: '#B71D18',
  darker: '#7A0916',
  contrastText: '#FFFFFF',
}

export const common = {
  black: '#000000',
  white: '#FFFFFF',
}

const baseAction = {
  hoverOpacity: 0.08,
  selectedOpacity: 0.08,
  focusOpacity: 0.12,
  activatedOpacity: 0.12,
  disabledOpacity: 0.48,
}

export const lightPalette = {
  mode: 'light' as const,
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  grey,
  divider: alpha(grey[500], 0.2),
  text: {
    primary: grey[800],
    secondary: grey[600],
    disabled: grey[500],
  },
  background: {
    paper: '#FFFFFF',
    default: '#FFFFFF',
    neutral: grey[200],
  },
  action: {
    active: grey[600],
    hover: alpha(grey[500], 0.08),
    selected: alpha(grey[500], 0.16),
    focus: alpha(grey[500], 0.24),
    disabled: alpha(grey[500], 0.8),
    disabledBackground: alpha(grey[500], 0.24),
    ...baseAction,
  },
}

export const darkPalette = {
  mode: 'dark' as const,
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  grey,
  divider: alpha(grey[500], 0.2),
  text: {
    primary: '#FFFFFF',
    secondary: grey[500],
    disabled: grey[600],
  },
  background: {
    paper: grey[800],
    default: grey[900],
    neutral: '#28323D',
  },
  action: {
    active: grey[500],
    hover: alpha(grey[500], 0.08),
    selected: alpha(grey[500], 0.16),
    focus: alpha(grey[500], 0.24),
    disabled: alpha(grey[500], 0.8),
    disabledBackground: alpha(grey[500], 0.24),
    ...baseAction,
  },
}
