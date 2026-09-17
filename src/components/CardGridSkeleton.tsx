import React from 'react'
import { Card, Grid, Skeleton } from '@mui/material'

interface CardGridSkeletonProps {
  count?: number
  height?: number
  size?: Record<string, number>
}

/**
 * Placeholder grid shown while list data loads, matching the real card grid so
 * there is no layout shift (CLS) when content arrives.
 */
const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({
  count = 6,
  height = 260,
  size = { xs: 12, md: 6, lg: 4 },
}) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid key={index} size={size}>
        <Card sx={{ p: 2 }}>
          <Skeleton variant="rounded" height={height * 0.55} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="40%" />
        </Card>
      </Grid>
    ))}
  </Grid>
)

export default CardGridSkeleton
