import React from 'react'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import { Link as RouterLink } from 'react-router-dom'
import type { SxProps, Theme } from '@mui/material/styles'

/**
 * Consistent page header: title + optional breadcrumbs + optional action slot
 * (e.g. an "Add new" button). Used across all dashboard pages.
 */

export interface Crumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: string
  breadcrumbs?: Crumb[]
  action?: React.ReactNode
  sx?: SxProps<Theme>
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, action, sx }) => (
  <Box
    sx={[
      {
        mb: 4,
        gap: 2,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={
            <Box
              component="span"
              sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }}
            />
          }
          sx={{ mt: 1 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            if (isLast || !crumb.href) {
              return (
                <Typography
                  key={crumb.label}
                  variant="body2"
                  sx={{ color: isLast ? 'text.disabled' : 'text.primary' }}
                >
                  {crumb.label}
                </Typography>
              )
            }
            return (
              <Link
                key={crumb.label}
                component={RouterLink}
                to={crumb.href}
                variant="body2"
                underline="hover"
                color="inherit"
              >
                {crumb.label}
              </Link>
            )
          })}
        </Breadcrumbs>
      )}
    </Box>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Box>
)

export default PageHeader
