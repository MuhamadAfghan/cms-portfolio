import React from 'react'
import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import WorkIcon from '@mui/icons-material/Work'
import PublishIcon from '@mui/icons-material/Publish'
import StarIcon from '@mui/icons-material/Star'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { usePortfolios } from '../contexts/PortfolioContext'
import { useTechStacks } from '../contexts/TechStackContext'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/PageHeader'
import { getAuthUser } from '../lib/auth'

type WidgetColor = 'primary' | 'info' | 'warning' | 'success'

interface WidgetProps {
  title: string
  total: number
  caption?: string
  color: WidgetColor
  icon: React.ElementType
}

const WidgetSummary: React.FC<WidgetProps> = ({ title, total, caption, color, icon: Icon }) => {
  const theme = useTheme()

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box
          sx={{
            width: 48,
            height: 48,
            mb: 2,
            display: 'flex',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${color}.dark`,
            bgcolor: alpha(theme.palette[color].main, 0.16),
          }}
        >
          <Icon />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {total}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        {caption && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

const WidgetSkeleton: React.FC = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
      <Skeleton variant="text" width={64} height={48} />
      <Skeleton variant="text" width="60%" />
    </CardContent>
  </Card>
)

const DashboardPage: React.FC = () => {
  const username = getAuthUser() || 'Admin'
  const { items: portfolios, loading: portfoliosLoading } = usePortfolios()
  const { items: techStacks, loading: techStacksLoading } = useTechStacks()

  const loading = portfoliosLoading || techStacksLoading
  const publishedCount = portfolios.filter((p) => p.status === 'published').length
  const featuredCount = portfolios.filter((p) => p.featured).length

  const widgets: WidgetProps[] = [
    { title: 'Total Portfolios', total: portfolios.length, color: 'primary', icon: WorkIcon },
    {
      title: 'Published',
      total: publishedCount,
      caption: `${portfolios.length - publishedCount} draft`,
      color: 'success',
      icon: PublishIcon,
    },
    { title: 'Featured', total: featuredCount, color: 'warning', icon: StarIcon },
    { title: 'Tech Stacks', total: techStacks.length, color: 'info', icon: AccountTreeIcon },
  ]

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <PageHeader title="Dashboard" />

        <Card
          sx={{
            mb: 4,
            color: 'primary.contrastText',
            background: (t) =>
              `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
          }}
        >
          <CardContent sx={{ py: { xs: 3, md: 5 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Welcome back, {username} 👋
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9, maxWidth: 480 }}>
              Here's an overview of your portfolio content. Manage projects, tech stacks and reviews
              from the sidebar.
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <WidgetSkeleton />
                </Grid>
              ))
            : widgets.map((widget) => (
                <Grid key={widget.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <WidgetSummary {...widget} />
                </Grid>
              ))}
        </Grid>
      </Box>
    </DashboardLayout>
  )
}

export default DashboardPage
