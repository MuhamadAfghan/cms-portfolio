import { alpha, type Components, type Theme } from '@mui/material/styles'

/**
 * Minimals-derived global component overrides. Cards float (customShadows.card),
 * buttons have no default elevation but gain a color-matched shadow on hover and
 * a `soft` variant, inputs/paper/chip/menu/tooltip/alert are tuned for a calm,
 * consistent surface system. Callbacks receive the built theme, so
 * theme.customShadows and the extended palette are available here.
 */

// Enable <Button variant="soft" />
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true
  }
}

// Enable <Chip variant="soft" />
declare module '@mui/material/Chip' {
  interface ChipPropsVariantOverrides {
    soft: true
  }
}

const PALETTE_COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const

export const componentsOverrides: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      '*': { boxSizing: 'border-box' },
      html: { height: '100%', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
      body: { height: '100%', backgroundColor: theme.palette.background.default },
      '#root': { height: '100%' },
      // Softer, theme-aware scrollbar.
      '*::-webkit-scrollbar': { width: 8, height: 8 },
      '*::-webkit-scrollbar-thumb': {
        borderRadius: 8,
        backgroundColor: alpha(theme.palette.grey[500], 0.32),
      },
      '*::-webkit-scrollbar-thumb:hover': {
        backgroundColor: alpha(theme.palette.grey[500], 0.48),
      },
      // Respect the user's reduced-motion preference: near-instant, non-looping.
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    }),
  },

  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: { backgroundImage: 'none' },
      outlined: ({ theme }) => ({ borderColor: alpha(theme.palette.grey[500], 0.16) }),
    },
  },

  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        position: 'relative',
        zIndex: 0,
        boxShadow: theme.customShadows.card,
        borderRadius: Number(theme.shape.borderRadius) * 2,
      }),
    },
  },
  MuiCardHeader: {
    defaultProps: {
      slotProps: {
        title: { variant: 'h6' },
        subheader: { variant: 'body2', sx: { mt: 0.5 } },
      },
    },
    styleOverrides: {
      root: ({ theme }) => ({ padding: theme.spacing(3, 3, 0) }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: ({ theme }) => ({ padding: theme.spacing(3) }),
    },
  },

  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { fontWeight: 700 },
    },
    variants: [
      // Contained: color-matched soft shadow on hover.
      ...PALETTE_COLORS.map((color) => ({
        props: { variant: 'contained' as const, color },
        style: ({ theme }: { theme: Theme }) => ({
          '&:hover': { boxShadow: theme.customShadows[color] },
        }),
      })),
      // Outlined: subtle current-color ring on hover.
      {
        props: { variant: 'outlined' as const },
        style: ({ theme }: { theme: Theme }) => ({
          borderColor: alpha(theme.palette.grey[500], 0.32),
          '&:hover': {
            borderColor: 'currentColor',
            backgroundColor: theme.palette.action.hover,
          },
        }),
      },
      // Soft: tinted background, no border.
      ...PALETTE_COLORS.map((color) => ({
        props: { variant: 'soft' as const, color },
        style: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.mode === 'light' ? theme.palette[color].dark : theme.palette[color].light,
          backgroundColor: alpha(theme.palette[color].main, 0.16),
          '&:hover': { backgroundColor: alpha(theme.palette[color].main, 0.32) },
        }),
      })),
    ],
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(theme.palette.grey[500], 0.2),
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(theme.palette.grey[500], 0.32),
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.text.primary,
          borderWidth: 1,
        },
      }),
    },
  },

  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 600 },
    },
    variants: [
      {
        props: { variant: 'soft' as const },
        style: ({ theme }: { theme: Theme }) => ({
          border: 'none',
          color: theme.palette.text.secondary,
          backgroundColor: alpha(theme.palette.grey[500], 0.16),
          '&:hover': { backgroundColor: alpha(theme.palette.grey[500], 0.24) },
        }),
      },
      ...PALETTE_COLORS.map((color) => ({
        props: { variant: 'soft' as const, color },
        style: ({ theme }: { theme: Theme }) => ({
          border: 'none',
          color: theme.palette.mode === 'light' ? theme.palette[color].dark : theme.palette[color].light,
          backgroundColor: alpha(theme.palette[color].main, 0.16),
        }),
      })),
    ],
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }) => ({
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 800 : 700],
        fontWeight: 600,
      }),
      arrow: ({ theme }) => ({
        color: theme.palette.grey[theme.palette.mode === 'light' ? 800 : 700],
      }),
    },
  },

  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({ boxShadow: theme.customShadows.dropdown }),
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: { borderRadius: 6, margin: '0 4px' },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: { borderRadius: 8, fontWeight: 500 },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        boxShadow: theme.customShadows.dialog,
        borderRadius: Number(theme.shape.borderRadius) * 2,
      }),
    },
  },
}
