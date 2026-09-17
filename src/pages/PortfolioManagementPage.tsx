import React, { useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import GitHubIcon from '@mui/icons-material/GitHub'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DeleteIcon from '@mui/icons-material/Delete'
import WorkIcon from '@mui/icons-material/Work'
import ImageIcon from '@mui/icons-material/Image'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import StarIcon from '@mui/icons-material/Star'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/PageHeader'
import Label from '../components/Label'
import EmptyContent from '../components/EmptyContent'
import CardGridSkeleton from '../components/CardGridSkeleton'
import { usePortfolios } from '../contexts/PortfolioContext'
import type { PortfolioWithRelations } from '../types/portfolio'
import { useConfirm, useNotify } from '../components/feedback'

const PortfolioManagementPage: React.FC = () => {
  const { items, loading, error, refresh, removeItem, reorderItems } = usePortfolios()
  const { confirm, confirmDialog } = useConfirm()
  const { notifyError, snackbar } = useNotify()

  const draggedId = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)

  const isFiltering = search.trim() !== '' || statusFilter !== 'all' || featuredOnly

  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase()
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      (item.summary || '').toLowerCase().includes(query)
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesFeatured = !featuredOnly || item.featured
    return matchesSearch && matchesStatus && matchesFeatured
  })

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setFeaturedOnly(false)
  }

  const handleDragStart = (id: string) => {
    draggedId.current = id
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedId.current !== id) setDragOverId(id)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = async (targetId: string) => {
    setDragOverId(null)
    const sourceId = draggedId.current
    draggedId.current = null
    if (!sourceId || sourceId === targetId) return

    const sourceIndex = items.findIndex((p) => p.id === sourceId)
    const targetIndex = items.findIndex((p) => p.id === targetId)
    if (sourceIndex === -1 || targetIndex === -1) return

    const reordered = [...items]
    const [moved] = reordered.splice(sourceIndex, 1)
    reordered.splice(targetIndex, 0, moved)
    const orderedIds = reordered.map((p) => p.id)

    setSaving(true)
    try {
      await reorderItems(orderedIds)
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = () => {
    draggedId.current = null
    setDragOverId(null)
  }

  // Keyboard/touch-friendly alternative to drag-and-drop reordering.
  const moveItem = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return

    const reordered = [...items]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)
    const orderedIds = reordered.map((p) => p.id)

    setSaving(true)
    try {
      await reorderItems(orderedIds)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (portfolio: PortfolioWithRelations) => {
    const ok = await confirm({
      title: 'Delete portfolio',
      message: `Delete ${portfolio.title}? This action cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
    })
    if (!ok) return
    try {
      await removeItem(portfolio)
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Failed to delete portfolio.')
    }
  }

  const renderCard = (portfolio: PortfolioWithRelations, index: number, reorderable: boolean) => {
    const isDragOver = reorderable && dragOverId === portfolio.id

    return (
      <Grid key={portfolio.id} size={{ xs: 12, md: 6, lg: 4 }}>
        <Card
          draggable={reorderable}
          onDragStart={reorderable ? () => handleDragStart(portfolio.id) : undefined}
          onDragOver={reorderable ? (e) => handleDragOver(e, portfolio.id) : undefined}
          onDragLeave={reorderable ? handleDragLeave : undefined}
          onDrop={reorderable ? () => handleDrop(portfolio.id) : undefined}
          onDragEnd={reorderable ? handleDragEnd : undefined}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: reorderable ? 'grab' : 'default',
            userSelect: 'none',
            transition: 'transform .2s, box-shadow .2s, outline-color .15s',
            outline: '2px solid transparent',
            ...(reorderable && { '&:active': { cursor: 'grabbing' } }),
            '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => t.customShadows.z16 },
            ...(isDragOver && {
              outlineColor: (t) => t.palette.primary.main,
              transform: 'scale(1.02)',
            }),
          }}
        >
          <Box sx={{ position: 'relative' }}>
            {portfolio.images[0]?.url ? (
              <CardMedia
                component="img"
                image={portfolio.images[0].url}
                alt={portfolio.title}
                loading="lazy"
                sx={{ height: 180, objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  height: 180,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.neutral',
                  color: 'text.disabled',
                }}
              >
                <ImageIcon sx={{ fontSize: 40 }} />
              </Box>
            )}
            <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
              <Label variant="filled" color={portfolio.status === 'published' ? 'success' : 'default'}>
                {portfolio.status}
              </Label>
              {portfolio.featured && (
                <Label variant="filled" color="warning">
                  Featured
                </Label>
              )}
            </Box>
          </Box>

          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              {reorderable && (
                <DragIndicatorIcon sx={{ mt: 0.25, color: 'text.disabled', flexShrink: 0 }} />
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }} noWrap>
                {portfolio.title}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                minHeight: 40,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {portfolio.summary || 'No summary provided.'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
              {portfolio.techStacks.slice(0, 4).map((stack) => (
                <Chip
                  key={stack.id}
                  size="small"
                  variant="soft"
                  label={stack.name}
                  icon={
                    stack.type === 'image' && stack.source ? (
                      <Box
                        component="img"
                        src={stack.source}
                        alt={stack.name}
                        sx={{ height: 14, width: 14, objectFit: 'contain' }}
                      />
                    ) : undefined
                  }
                />
              ))}
              {portfolio.techStacks.length > 4 && (
                <Chip size="small" variant="soft" label={`+${portfolio.techStacks.length - 4}`} />
              )}
              {!portfolio.techStacks.length && (
                <Typography variant="caption" color="text.disabled">
                  No tech stack selected.
                </Typography>
              )}
            </Box>
          </CardContent>

          <Divider sx={{ borderStyle: 'dashed' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1.5 }}>
            {reorderable && items.length > 1 && (
              <>
                <Tooltip title="Move up">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Move ${portfolio.title} up`}
                      disabled={index === 0 || saving}
                      onClick={() => moveItem(index, -1)}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move down">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Move ${portfolio.title} down`}
                      disabled={index === items.length - 1 || saving}
                      onClick={() => moveItem(index, 1)}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            {portfolio.link_demo && (
              <Tooltip title="Demo">
                <IconButton
                  size="small"
                  href={portfolio.link_demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {portfolio.link_github && (
              <Tooltip title="GitHub">
                <IconButton
                  size="small"
                  href={portfolio.link_github}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                >
                  <GitHubIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Edit">
              <IconButton
                color="info"
                size="small"
                aria-label={`Edit ${portfolio.title}`}
                component={Link}
                to={`/portfolios/${portfolio.id}/edit`}
                draggable={false}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                size="small"
                aria-label={`Delete ${portfolio.title}`}
                onClick={() => handleDelete(portfolio)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Card>
      </Grid>
    )
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <PageHeader
          title="Portfolios"
          subtitle={
            saving
              ? 'Saving order...'
              : isFiltering
                ? 'Reordering is disabled while filtering'
                : items.length > 1
                  ? 'Drag cards or use the arrow buttons to reorder'
                  : undefined
          }
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Portfolios' }]}
          action={
            <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/portfolios/new">
              New Portfolio
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
          <CardGridSkeleton count={6} height={300} size={{ xs: 12, md: 6, lg: 4 }} />
        ) : !items.length ? (
          <EmptyContent
            icon={WorkIcon}
            title="No portfolios yet"
            description="Create your first portfolio project to showcase your work."
            action={
              <Button variant="soft" color="primary" startIcon={<AddIcon />} component={Link} to="/portfolios/new">
                New Portfolio
              </Button>
            }
          />
        ) : (
          <>
            <Box
              sx={{
                mb: 3,
                gap: 1.5,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <TextField
                size="small"
                placeholder="Search by title or summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ flex: 1, minWidth: 220 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" aria-label="Clear search" onClick={() => setSearch('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined,
                  },
                }}
              />
              <ToggleButtonGroup
                exclusive
                size="small"
                value={statusFilter}
                onChange={(_, next) => next && setStatusFilter(next)}
                aria-label="Filter by status"
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="published">Published</ToggleButton>
                <ToggleButton value="draft">Draft</ToggleButton>
              </ToggleButtonGroup>
              <ToggleButton
                size="small"
                value="featured"
                selected={featuredOnly}
                onChange={() => setFeaturedOnly((prev) => !prev)}
                aria-label="Show featured only"
                sx={{ gap: 0.5 }}
              >
                <StarIcon fontSize="small" />
                Featured
              </ToggleButton>
              {isFiltering && (
                <Button size="small" color="inherit" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </Box>

            {isFiltering && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {filteredItems.length} of {items.length} portfolios
              </Typography>
            )}

            {!filteredItems.length ? (
              <EmptyContent
                icon={SearchOffIcon}
                title="No matching portfolios"
                description="Try a different search term or clear the filters."
                action={
                  <Button variant="soft" color="primary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <Grid container spacing={3}>
                {filteredItems.map((portfolio) =>
                  renderCard(
                    portfolio,
                    items.findIndex((p) => p.id === portfolio.id),
                    !isFiltering,
                  ),
                )}
              </Grid>
            )}
          </>
        )}
      </Box>
      {confirmDialog}
      {snackbar}
    </DashboardLayout>
  )
}

export default PortfolioManagementPage
