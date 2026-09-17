import React from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Rating,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import StarIcon from '@mui/icons-material/Star'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/PageHeader'
import Label from '../components/Label'
import EmptyContent from '../components/EmptyContent'
import CardGridSkeleton from '../components/CardGridSkeleton'
import { useReviews } from '../contexts/ReviewContext'
import { useConfirm, useNotify } from '../components/feedback'
import type { Review } from '../types/review'

const ReviewManagementPage: React.FC = () => {
  const { items, loading, error, refresh, removeItem } = useReviews()
  const { confirm, confirmDialog } = useConfirm()
  const { notifyError, snackbar } = useNotify()

  const handleDelete = async (review: Review) => {
    const ok = await confirm({
      title: 'Delete review',
      message: `Delete the review from ${review.name || 'Anonymous'}? This action cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
    })
    if (!ok) return
    try {
      await removeItem(review)
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Failed to delete review.')
    }
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <PageHeader
          title="Reviews"
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reviews' }]}
          action={
            <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/reviews/new">
              New Review
            </Button>
          }
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={refresh}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <CardGridSkeleton count={6} height={220} size={{ xs: 12, md: 6, lg: 4 }} />
        ) : !items.length ? (
          <EmptyContent
            icon={FormatQuoteIcon}
            title="No reviews yet"
            description="Add your first client or student testimonial."
            action={
              <Button variant="soft" color="primary" startIcon={<AddIcon />} component={Link} to="/reviews/new">
                New Review
              </Button>
            }
          />
        ) : (
          <Grid container spacing={3}>
            {items.map((review) => {
              const name = review.name || 'Anonymous'
              return (
                <Grid key={review.id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{name.charAt(0).toUpperCase()}</Avatar>
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" noWrap>
                              {name}
                            </Typography>
                            {review.is_private && (
                              <Label variant="soft" color="default">
                                Private
                              </Label>
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {review.role}
                            {review.company_name ? ` at ${review.company_name}` : ''}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                        <Rating
                          value={Number(review.rating) || 0}
                          precision={0.5}
                          size="small"
                          readOnly
                          emptyIcon={<StarIcon fontSize="inherit" sx={{ opacity: 0.3 }} />}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {Number(review.rating).toFixed(1)}
                        </Typography>
                      </Box>

                      <Box sx={{ position: 'relative', mt: 1.5 }}>
                        <FormatQuoteIcon
                          sx={{ position: 'absolute', top: -8, left: -4, fontSize: 32, color: 'divider' }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            pl: 3,
                            color: 'text.secondary',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {review.review}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, p: 1.5 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          color="info"
                          size="small"
                          aria-label={`Edit review from ${name}`}
                          component={Link}
                          to={`/reviews/${review.id}/edit`}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          size="small"
                          aria-label={`Delete review from ${name}`}
                          onClick={() => handleDelete(review)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>
      {confirmDialog}
      {snackbar}
    </DashboardLayout>
  )
}

export default ReviewManagementPage
