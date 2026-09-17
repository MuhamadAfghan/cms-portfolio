import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Rating,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/PageHeader'
import { useConfirm } from '../components/feedback'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import { useReviews } from '../contexts/ReviewContext'
import { normalizeReviewInput, validateReviewInput } from '../schemas/reviewSchema'

const EditReviewPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { confirm, confirmDialog } = useConfirm()
  const { items, loading, refresh, updateItem } = useReviews()
  const errorRef = useRef<HTMLDivElement | null>(null)

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [rating, setRating] = useState<number>(5)
  const [review, setReview] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const reviewItem = items.find((item) => item.id === id)

  useEffect(() => {
    if (!items.length && !loading) {
      refresh()
    }
  }, [items.length, loading, refresh])

  useEffect(() => {
    if (!reviewItem) return
    setName(reviewItem.name ?? '')
    setRole(reviewItem.role)
    setCompanyName(reviewItem.company_name ?? '')
    setRating(reviewItem.rating)
    setReview(reviewItem.review)
    setIsPrivate(reviewItem.is_private)
  }, [reviewItem])

  const isDirty =
    !isSaving &&
    Boolean(reviewItem) &&
    (name !== (reviewItem!.name ?? '') ||
      role !== reviewItem!.role ||
      companyName !== (reviewItem!.company_name ?? '') ||
      rating !== reviewItem!.rating ||
      review !== reviewItem!.review ||
      isPrivate !== reviewItem!.is_private)
  useUnsavedChanges(isDirty)

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [error])

  const handleCancel = async () => {
    if (isDirty) {
      const ok = await confirm({
        title: 'Discard changes?',
        message: 'You have unsaved changes. Leaving now will discard them.',
        confirmText: 'Discard',
        cancelText: 'Keep editing',
        destructive: true,
      })
      if (!ok) return
    }
    navigate('/reviews')
  }

  const handleSave = async () => {
    if (!reviewItem) return
    const input = normalizeReviewInput({
      name,
      role,
      company_name: companyName,
      rating,
      review,
      is_private: isPrivate,
    })
    const validation = validateReviewInput(input)
    if (!validation.valid) {
      setError(validation.message || 'Please complete the form.')
      return
    }

    setIsSaving(true)
    setError('')
    try {
      await updateItem(reviewItem.id, input)
      navigate('/reviews')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update review.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!reviewItem && loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 4, color: 'text.secondary' }}>
          <Typography variant="body2">Loading review...</Typography>
        </Box>
      </DashboardLayout>
    )
  }

  if (!reviewItem && !loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Review Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            We could not find the review you are trying to edit.
          </Typography>
          <Button variant="contained" component={Link} to="/reviews" sx={{ mt: 3 }}>
            Back to Reviews
          </Button>
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <PageHeader
          title="Edit Review"
          subtitle="Update the testimonial details."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Reviews', href: '/reviews' },
            { label: 'Edit' },
          ]}
          sx={{ mb: 0 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="text" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          }
        />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Reviewer
                </Typography>
                <TextField
                  label="Name"
                  placeholder="e.g. Raihan"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  helperText="Leave empty for an anonymous review."
                  fullWidth
                />
                <TextField
                  label="Role"
                  placeholder="e.g. CEO & Founder"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Company"
                  placeholder="e.g. Travel Agency"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  fullWidth
                />

                <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>
                  Review
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating
                      value={rating}
                      precision={0.5}
                      onChange={(_, next) => setRating(next ?? 0)}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {rating.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
                <TextField
                  label="Review Text"
                  placeholder="What did they say about your work?"
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  required
                  multiline
                  minRows={4}
                  fullWidth
                />

                {error && (
                  <Alert ref={errorRef} severity="error" role="alert">
                    {error}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Visibility
                </Typography>
                <FormControlLabel
                  control={
                    <Switch checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />
                  }
                  label="Private review"
                />
                <Typography variant="caption" color="text.secondary">
                  Private reviews are kept for your reference and can be hidden from the public site.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {confirmDialog}
    </DashboardLayout>
  )
}

export default EditReviewPage
