import React, { useEffect, useRef, useState } from 'react'
import Compressor from 'compressorjs'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import DashboardLayout from '../layouts/DashboardLayout'
import WysiwygEditor from '../components/WysiwygEditor'
import PageHeader from '../components/PageHeader'
import { useConfirm } from '../components/feedback'
import { sanitizeSvg } from '../lib/sanitize'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import { usePortfolios } from '../contexts/PortfolioContext'
import { useTechStacks } from '../contexts/TechStackContext'
import {
  normalizePortfolioInput,
  validatePortfolioInput,
} from '../schemas/portfolioSchema'
import {
  normalizeTechStackInput,
  validateTechStackInput,
} from '../schemas/techStackSchema'
import type { PortfolioStatus } from '../types/portfolio'
import type { TechStackInput } from '../types/techStack'

type ImageSource = 'existing' | 'new'
type IconType = 'image' | 'svg'

interface ImageItem {
  id: string
  imageId?: string
  previewUrl: string
  name: string
  source: ImageSource
  file?: File
  originalSize?: number
  compressedSize?: number
  url?: string
}

const formatBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) return 'Unknown size'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `img-${Date.now()}-${Math.random().toString(16).slice(2)}`

const compressPortfolioImage = (file: File) =>
  new Promise<File>((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 1600,
      convertSize: 500_000,
      success(result) {
        const output = new File([result], file.name, {
          type: result.type || file.type,
        })
        resolve(output)
      },
      error(error) {
        reject(error)
      },
    })
  })

const compressTechStackImage = (file: File) =>
  new Promise<File>((resolve, reject) => {
    new Compressor(file, {
      quality: 0.85,
      maxWidth: 512,
      maxHeight: 512,
      convertSize: 100_000,
      success(result) {
        const output = new File([result], file.name, {
          type: result.type || file.type,
        })
        resolve(output)
      },
      error(error) {
        reject(error)
      },
    })
  })

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const getNameFromUrl = (url: string) => {
  try {
    const { pathname } = new URL(url)
    const parts = pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] || 'existing-image'
  } catch {
    return 'existing-image'
  }
}

const EditPortfolioPage: React.FC = () => {
  const { id } = useParams()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imagesRef = useRef<ImageItem[]>([])
  const errorRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const { confirm, confirmDialog } = useConfirm()
  const { items, loading, refresh, updateItem } = usePortfolios()
  const { items: techStacks, createItem: createTechStack } = useTechStacks()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [linkDemo, setLinkDemo] = useState('')
  const [linkGithub, setLinkGithub] = useState('')
  const [status, setStatus] = useState<PortfolioStatus>('draft')
  const [featured, setFeatured] = useState(false)
  const [selectedTechStacks, setSelectedTechStacks] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [removedImages, setRemovedImages] = useState<
    { id: string; url: string }[]
  >([])
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [newStackName, setNewStackName] = useState('')
  const [newStackType, setNewStackType] = useState<IconType>('image')
  const [newStackSvg, setNewStackSvg] = useState('')
  const [newStackImage, setNewStackImage] = useState<File | null>(null)
  const [newStackPreview, setNewStackPreview] = useState<{
    url: string
    isObjectUrl: boolean
  }>({ url: '', isObjectUrl: false })
  const [newStackError, setNewStackError] = useState('')
  const [newStackSaving, setNewStackSaving] = useState(false)
  const [newStackCompressing, setNewStackCompressing] = useState(false)

  const portfolio = items.find((item) => item.id === id)

  useEffect(() => {
    if (!items.length && !loading) {
      refresh()
    }
  }, [items.length, loading, refresh])

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    if (!portfolio) return

    setTitle(portfolio.title)
    setSlug(portfolio.slug || '')
    setSlugEdited(Boolean(portfolio.slug))
    setSummary(portfolio.summary || '')
    setContent(portfolio.content || '')
    setLinkDemo(portfolio.link_demo || '')
    setLinkGithub(portfolio.link_github || '')
    setStatus(portfolio.status)
    setFeatured(portfolio.featured)
    setSelectedTechStacks(portfolio.techStacks.map((stack) => stack.id))

    if (portfolio.images.length) {
      setImages(
        portfolio.images.map((image) => ({
          id: generateId(),
          imageId: image.id,
          previewUrl: image.url,
          name: getNameFromUrl(image.url),
          source: 'existing' as const,
          url: image.url,
        })),
      )
    }
  }, [portfolio])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => {
        if (item.source === 'new') {
          URL.revokeObjectURL(item.previewUrl)
        }
      })
      if (newStackPreview.isObjectUrl && newStackPreview.url) {
        URL.revokeObjectURL(newStackPreview.url)
      }
    }
  }, [newStackPreview])

  const sameStacks =
    portfolio &&
    selectedTechStacks.length === portfolio.techStacks.length &&
    [...selectedTechStacks].sort().join() ===
      portfolio.techStacks
        .map((s) => s.id)
        .sort()
        .join()

  const isDirty =
    !isSaving &&
    Boolean(portfolio) &&
    (title !== portfolio!.title ||
      slug !== (portfolio!.slug || '') ||
      summary !== (portfolio!.summary || '') ||
      content !== (portfolio!.content || '') ||
      linkDemo !== (portfolio!.link_demo || '') ||
      linkGithub !== (portfolio!.link_github || '') ||
      status !== portfolio!.status ||
      featured !== portfolio!.featured ||
      !sameStacks ||
      images.some((image) => image.source === 'new') ||
      removedImages.length > 0)
  useUnsavedChanges(isDirty)

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [error])

  const handleFiles = async (files: FileList | File[]) => {
    const selected = Array.from(files).filter((file) =>
      file.type.startsWith('image/'),
    )
    if (selected.length === 0) return

    setIsCompressing(true)
    try {
      const compressed = await Promise.all(
        selected.map(async (file) => {
          const compressedFile = await compressPortfolioImage(file)
          return {
            id: generateId(),
            file: compressedFile,
            previewUrl: URL.createObjectURL(compressedFile),
            originalSize: file.size,
            compressedSize: compressedFile.size,
            name: compressedFile.name,
            source: 'new' as const,
          }
        }),
      )
      setImages((prev) => [...prev, ...compressed])
    } finally {
      setIsCompressing(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files)
      event.target.value = ''
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files)
    }
  }

  const removeImage = (targetId: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === targetId)
      if (target?.source === 'new') {
        URL.revokeObjectURL(target.previewUrl)
      }
      if (target?.source === 'existing' && target.imageId && target.url) {
        setRemovedImages((current) => [
          ...current,
          { id: target.imageId!, url: target.url! },
        ])
      }
      return prev.filter((item) => item.id !== targetId)
    })
  }

  const toggleTechStack = (stackId: string) => {
    setSelectedTechStacks((prev) =>
      prev.includes(stackId)
        ? prev.filter((idItem) => idItem !== stackId)
        : [...prev, stackId],
    )
  }

  const handleQuickAddImage = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setNewStackCompressing(true)
    setNewStackError('')
    try {
      const compressedFile = await compressTechStackImage(file)
      if (newStackPreview.isObjectUrl && newStackPreview.url) {
        URL.revokeObjectURL(newStackPreview.url)
      }
      const previewUrl = URL.createObjectURL(compressedFile)
      setNewStackPreview({ url: previewUrl, isObjectUrl: true })
      setNewStackImage(compressedFile)
    } catch (err) {
      console.error('Failed to compress image', err)
      setNewStackError('Failed to compress image.')
    } finally {
      setNewStackCompressing(false)
    }
  }

  const handleQuickAdd = async () => {
    const input: TechStackInput = normalizeTechStackInput({
      name: newStackName,
      type: newStackType,
    })
    const validation = validateTechStackInput(input)
    if (!validation.valid) {
      setNewStackError(validation.message || 'Please complete the form.')
      return
    }

    setNewStackSaving(true)
    setNewStackError('')
    try {
      const created = await createTechStack(input, {
        imageFile: newStackImage,
        svgCode: newStackType === 'svg' ? newStackSvg : undefined,
      })
      setSelectedTechStacks((prev) => [...prev, created.id])
      setNewStackName('')
      setNewStackType('image')
      setNewStackSvg('')
      setNewStackImage(null)
      if (newStackPreview.isObjectUrl && newStackPreview.url) {
        URL.revokeObjectURL(newStackPreview.url)
      }
      setNewStackPreview({ url: '', isObjectUrl: false })
      setShowQuickAdd(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add tech stack.'
      setNewStackError(message)
    } finally {
      setNewStackSaving(false)
    }
  }

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
    navigate('/portfolios')
  }

  const handleSave = async () => {
    if (!portfolio) return
    const input = normalizePortfolioInput({
      title,
      slug: slug.trim() ? slug : slugify(title),
      summary,
      content,
      link_demo: linkDemo,
      link_github: linkGithub,
      status,
      featured,
    })
    const validation = validatePortfolioInput(input)
    if (!validation.valid) {
      setError(validation.message || 'Please complete the form.')
      return
    }

    setIsSaving(true)
    setError('')
    try {
      await updateItem(portfolio.id, input, {
        images: images.filter((image) => image.source === 'new').map((image) => image.file!),
        techStackIds: selectedTechStacks,
        removedImages,
      })
      navigate('/portfolios')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update portfolio.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!portfolio && loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 4, color: 'text.secondary' }}>
          <Typography variant="body2">Loading portfolio...</Typography>
        </Box>
      </DashboardLayout>
    )
  }

  if (!portfolio && !loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Portfolio Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            We could not find the portfolio you are trying to edit.
          </Typography>
          <Button variant="contained" component={Link} to="/portfolios" sx={{ mt: 3 }}>
            Back to Portfolios
          </Button>
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <PageHeader
          title="Edit Portfolio"
          subtitle="Update the portfolio details and manage images."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Portfolios', href: '/portfolios' },
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                  <TextField
                    label="Title"
                    placeholder="e.g. Pomoro"
                    value={title}
                    onChange={(event) => {
                      const nextTitle = event.target.value
                      setTitle(nextTitle)
                      if (!slugEdited) {
                        setSlug(slugify(nextTitle))
                      }
                    }}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Slug"
                    placeholder="e.g. pomoro"
                    value={slug}
                    onChange={(event) => {
                      const nextSlug = event.target.value
                      setSlug(nextSlug)
                      setSlugEdited(nextSlug.trim().length > 0)
                    }}
                    helperText="Auto-generated from the title. Used in the public URL."
                    fullWidth
                  />
                  <TextField
                    label="Short Summary"
                    placeholder="A quick overview for cards and previews."
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    multiline
                    minRows={4}
                    fullWidth
                  />
                  <TextField
                    label="Demo Link"
                    placeholder="https://your-demo.com"
                    value={linkDemo}
                    onChange={(event) => setLinkDemo(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="GitHub Link"
                    placeholder="https://github.com/username/repo"
                    value={linkGithub}
                    onChange={(event) => setLinkGithub(event.target.value)}
                    fullWidth
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Content
                  </Typography>
                  <WysiwygEditor value={content} onChange={setContent} />
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Tech Stack
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowQuickAdd((prev) => !prev)}
                    >
                      {showQuickAdd ? 'Close' : 'Add New Tech Stack'}
                    </Button>
                  </Box>

                  <Grid container spacing={1.5}>
                    {techStacks.map((stack) => {
                      const selected = selectedTechStacks.includes(stack.id)
                      return (
                        <Grid key={stack.id} size={{ xs: 12, sm: 6 }}>
                          <Box
                            component="label"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              borderRadius: 1,
                              border: 1,
                              px: 1.5,
                              py: 1,
                              cursor: 'pointer',
                              borderColor: selected ? 'primary.main' : 'divider',
                              bgcolor: selected ? 'action.selected' : 'transparent',
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={selected}
                              onChange={() => toggleTechStack(stack.id)}
                              sx={{ p: 0 }}
                            />
                            {stack.type === 'image' && stack.source ? (
                              <Box
                                component="img"
                                src={stack.source}
                                alt={stack.name}
                                sx={{ height: 24, width: 24, objectFit: 'contain' }}
                              />
                            ) : stack.type === 'svg' && stack.source ? (
                              <Box
                                sx={{ height: 24, width: 24 }}
                                dangerouslySetInnerHTML={{ __html: sanitizeSvg(stack.source) }}
                              />
                            ) : (
                              <Box sx={{ height: 24, width: 24, borderRadius: 1, bgcolor: 'action.hover' }} />
                            )}
                            <Typography variant="body2">{stack.name}</Typography>
                          </Box>
                        </Grid>
                      )
                    })}
                    {!techStacks.length && (
                      <Grid size={12}>
                        <Typography variant="body2" color="text.secondary">
                          No tech stacks yet. Add one below.
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {showQuickAdd && (
                    <Box
                      sx={{
                        mt: 1,
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: 'action.hover',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <Typography variant="subtitle2">Quick Add Tech Stack</Typography>
                      <TextField
                        label="Name"
                        placeholder="e.g. Astro"
                        value={newStackName}
                        onChange={(event) => setNewStackName(event.target.value)}
                        fullWidth
                        size="small"
                      />
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Icon Type
                        </Typography>
                        <ToggleButtonGroup
                          exclusive
                          value={newStackType}
                          onChange={(_, next) => next && setNewStackType(next)}
                          size="small"
                        >
                          <ToggleButton value="image">Image</ToggleButton>
                          <ToggleButton value="svg">SVG Code</ToggleButton>
                        </ToggleButtonGroup>
                      </Box>

                      {newStackType === 'image' ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Button variant="outlined" component="label" size="small">
                            Choose image
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(event) => {
                                const file = event.target.files?.[0]
                                if (file) handleQuickAddImage(file)
                                event.target.value = ''
                              }}
                            />
                          </Button>
                          {newStackCompressing && (
                            <Typography variant="caption" color="primary">
                              Compressing image...
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <TextField
                          placeholder="<svg ...>...</svg>"
                          value={newStackSvg}
                          onChange={(event) => setNewStackSvg(event.target.value)}
                          multiline
                          minRows={5}
                          fullWidth
                          size="small"
                          slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
                        />
                      )}

                      <Box
                        sx={{
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          p: 2,
                          textAlign: 'center',
                        }}
                      >
                        {newStackType === 'image' ? (
                          newStackPreview.url ? (
                            <Box
                              component="img"
                              src={newStackPreview.url}
                              alt={newStackName || 'Tech stack icon'}
                              sx={{ mx: 'auto', height: 64, width: 64, objectFit: 'contain' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No image selected.
                            </Typography>
                          )
                        ) : newStackSvg.trim() ? (
                          <Box
                            sx={{ mx: 'auto', height: 64, width: 64 }}
                            dangerouslySetInnerHTML={{ __html: sanitizeSvg(newStackSvg) }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Paste SVG code to preview.
                          </Typography>
                        )}
                      </Box>

                      {newStackError && <Alert severity="error">{newStackError}</Alert>}

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleQuickAdd}
                          disabled={newStackSaving}
                        >
                          {newStackSaving ? 'Saving...' : 'Save Tech Stack'}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Images
                  </Typography>
                  <Box
                    onDragOver={(event) => {
                      event.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 5,
                      textAlign: 'center',
                      borderRadius: 1,
                      border: '2px dashed',
                      borderColor: isDragging ? 'primary.main' : 'divider',
                      bgcolor: isDragging ? 'action.hover' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Drag &amp; drop images here, or
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}>
                      Browse files
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      PNG, JPG, WebP. Multiple images allowed.
                    </Typography>
                    {isCompressing && (
                      <Typography variant="caption" color="primary">
                        Compressing images...
                      </Typography>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      multiple
                      onChange={handleInputChange}
                    />
                  </Box>

                  {images.length > 0 && (
                    <Grid container spacing={2}>
                      {images.map((image) => (
                        <Grid key={image.id} size={6}>
                          <Box
                            sx={{
                              borderRadius: 1,
                              border: 1,
                              borderColor: 'divider',
                              bgcolor: 'action.hover',
                              p: 1.5,
                            }}
                          >
                            <Box
                              component="img"
                              src={image.previewUrl}
                              alt={image.name}
                              sx={{ height: 112, width: '100%', borderRadius: 1, objectFit: 'cover' }}
                            />
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" noWrap sx={{ display: 'block', fontWeight: 500 }}>
                                {image.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {image.source === 'new'
                                  ? `${formatBytes(image.originalSize)} → ${formatBytes(image.compressedSize)}`
                                  : 'Existing image'}
                              </Typography>
                              <Button size="small" variant="text" onClick={() => removeImage(image.id)}>
                                Remove
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Visibility
                  </Typography>
                  <TextField
                    select
                    label="Status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as PortfolioStatus)}
                    fullWidth
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                  </TextField>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={featured}
                        onChange={(event) => setFeatured(event.target.checked)}
                      />
                    }
                    label="Featured project"
                  />
                </CardContent>
              </Card>

              {error && (
                <Alert ref={errorRef} severity="error" role="alert">
                  {error}
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
      {confirmDialog}
    </DashboardLayout>
  )
}

export default EditPortfolioPage
