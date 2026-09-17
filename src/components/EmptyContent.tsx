import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InboxRoundedIcon from '@mui/icons-material/InboxRounded'
import type { SxProps, Theme } from '@mui/material/styles'

/**
 * Empty state placeholder: icon + title + optional description + optional action.
 * Used when a list has no items.
 */

interface EmptyContentProps {
  title: string
  description?: string
  icon?: React.ElementType
  action?: React.ReactNode
  sx?: SxProps<Theme>
}

const EmptyContent: React.FC<EmptyContentProps> = ({
  title,
  description,
  icon: Icon = InboxRoundedIcon,
  action,
  sx,
}) => (
  <Box
    sx={[
      {
        px: 3,
        py: 8,
        gap: 1.5,
        width: '100%',
        display: 'flex',
        borderRadius: 2,
        textAlign: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        border: (theme) => `1px dashed ${theme.palette.divider}`,
        bgcolor: 'background.neutral',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Box
      sx={{
        width: 64,
        height: 64,
        display: 'flex',
        borderRadius: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.disabled',
        bgcolor: (theme) => theme.palette.action.hover,
      }}
    >
      <Icon sx={{ fontSize: 36 }} />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        {description}
      </Typography>
    )}
    {action && <Box sx={{ mt: 1 }}>{action}</Box>}
  </Box>
)

export default EmptyContent
