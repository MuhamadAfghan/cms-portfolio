import React from 'react'
import Box from '@mui/material/Box'
import { alpha, type SxProps, type Theme } from '@mui/material/styles'

/**
 * Minimals-style status badge. Default variant is `soft` (tinted background),
 * used for statuses like Draft/Published/Featured.
 */

export type LabelColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

export type LabelVariant = 'filled' | 'outlined' | 'soft'

interface LabelProps {
  children: React.ReactNode
  color?: LabelColor
  variant?: LabelVariant
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  sx?: SxProps<Theme>
}

const buildColorStyles = (
  theme: Theme,
  color: LabelColor,
  variant: LabelVariant,
): Record<string, unknown> => {
  if (color === 'default') {
    if (variant === 'filled') {
      return {
        color: theme.palette.common.white,
        backgroundColor: theme.palette.text.primary,
      }
    }
    if (variant === 'outlined') {
      return {
        color: theme.palette.text.primary,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
      }
    }
    return {
      color: theme.palette.text.secondary,
      backgroundColor: alpha(theme.palette.grey[500], 0.16),
    }
  }

  const paletteColor = theme.palette[color]
  if (variant === 'filled') {
    return { color: paletteColor.contrastText, backgroundColor: paletteColor.main }
  }
  if (variant === 'outlined') {
    return { color: paletteColor.main, border: `1px solid ${paletteColor.main}` }
  }
  return {
    color: theme.palette.mode === 'light' ? paletteColor.dark : paletteColor.light,
    backgroundColor: alpha(paletteColor.main, 0.16),
  }
}

const Label: React.FC<LabelProps> = ({
  children,
  color = 'default',
  variant = 'soft',
  startIcon,
  endIcon,
  sx,
}) => (
  <Box
    component="span"
    sx={[
      (theme) => ({
        height: 24,
        minWidth: 24,
        lineHeight: 0,
        borderRadius: 1,
        cursor: 'default',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        justifyContent: 'center',
        px: 0.75,
        gap: 0.75,
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'capitalize',
        ...buildColorStyles(theme, color, variant),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {startIcon && <Box sx={{ display: 'inline-flex', '& svg': { fontSize: 16 } }}>{startIcon}</Box>}
    {children}
    {endIcon && <Box sx={{ display: 'inline-flex', '& svg': { fontSize: 16 } }}>{endIcon}</Box>}
  </Box>
)

export default Label
