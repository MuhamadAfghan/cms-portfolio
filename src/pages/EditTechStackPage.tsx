import React, { useEffect, useRef, useState } from 'react'
import Compressor from 'compressorjs'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/PageHeader'
import { useConfirm } from '../components/feedback'
import { sanitizeSvg } from '../lib/sanitize'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import { useTechStacks } from '../contexts/TechStackContext'
import {
  normalizeTechStackInput,
  validateTechStackInput,
} from '../schemas/techStackSchema'
import type { TechStackInput } from '../types/techStack'

type IconType = 'image' | 'svg'

const EditTechStackPage: React.FC = () => {
  const { id } = useParams()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const errorRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const { confirm, confirmDialog } = useConfirm()
  const { items, loading, refresh, updateItem } = useTechStacks()
  const [name, setName] = useState('')
  const [iconType, setIconType] = useState<IconType>('image')
  const [svgCode, setSvgCode] = useState('')
  const [imagePreview, setImagePreview] = useState<{
    url: string
    isObjectUrl: boolean
  }>({ url: '', isObjectUrl: false })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [imageInfo, setImageInfo] = useState<{
    originalSize: number
    compressedSize: number
  } | null>(null)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [previousSource, setPreviousSource] = useState<string | null>(null)

  const techStack = items.find((item) => item.id === id)

  useEffect(() => {
    if (!items.length && !loading) {
      refresh()
    }
  }, [items.length, loading, refresh])

  useEffect(() => {
    if (!techStack) return
    setName(techStack.name)
    setPreviousSource(techStack.source ?? null)
    if (techStack.type === 'svg') {
      setIconType('svg')
      setSvgCode(techStack.source ?? '')
      setImagePreview({ url: '', isObjectUrl: false })
    } else {
      setIconType('image')
      setSvgCode('')
      setImagePreview({
        url: techStack.source || '',
        isObjectUrl: false,
      })
    }
  }, [techStack])

  useEffect(() => {
    return () => {
      if (imagePreview.isObjectUrl && imagePreview.url) {
        URL.revokeObjectURL(imagePreview.url)
      }
    }
  }, [imagePreview])

  const isDirty =
    !isSaving &&
    Boolean(techStack) &&
    (name !== techStack!.name ||
      Boolean(imageFile) ||
      (iconType === 'svg' && svgCode !== (techStack!.source ?? '')) ||
      iconType !== (techStack!.type === 'svg' ? 'svg' : 'image'))
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
    navigate('/tech-stacks')
  }

  const compressImage = (file: File) =>
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

  const handleImage = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setIsCompressing(true)
    setError('')
    try {
      const compressedFile = await compressImage(file)
      if (imagePreview.isObjectUrl && imagePreview.url) {
        URL.revokeObjectURL(imagePreview.url)
      }
      const nextPreviewUrl = URL.createObjectURL(compressedFile)
      setImagePreview({ url: nextPreviewUrl, isObjectUrl: true })
      setImageFile(compressedFile)
      setImageInfo({
        originalSize: file.size,
        compressedSize: compressedFile.size,
      })
    } catch (err) {
      console.error('Failed to compress image', err)
      setError('Failed to compress image.')
    } finally {
      setIsCompressing(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleImage(file)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) handleImage(file)
    event.target.value = ''
  }

  const handleSave = async () => {
    if (!techStack) return

    const input: TechStackInput = normalizeTechStackInput({
      name,
      type: iconType,
      source:
        iconType === 'image'
          ? techStack.source ?? null
          : svgCode || techStack.source || null,
    })

    const validation = validateTechStackInput(input)

    if (!validation.valid) {
      setError(validation.message || 'Please complete the form.')
      return
    }

    setIsSaving(true)
    setError('')
    try {
      await updateItem(techStack.id, input, {
        imageFile,
        svgCode: iconType === 'svg' ? svgCode : undefined,
        previousSource,
      })
      navigate('/tech-stacks')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update tech stack.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!techStack && !loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Tech Stack Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            We could not find the tech stack you are trying to edit.
          </Typography>
          <Button variant="contained" component={Link} to="/tech-stacks" sx={{ mt: 3 }}>
            Back to Tech Stacks
          </Button>
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <PageHeader
          title="Edit Tech Stack"
          subtitle="Update the stack name and replace the icon when needed."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Tech Stacks', href: '/tech-stacks' },
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
                  Details
                </Typography>
                <TextField
                  label="Stack Name"
                  placeholder="e.g. TailwindCSS"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  fullWidth
                />

                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Icon Type
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    value={iconType}
                    onChange={(_, next) => next && setIconType(next)}
                    size="small"
                  >
                    <ToggleButton value="image">Image</ToggleButton>
                    <ToggleButton value="svg">SVG Code</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {iconType === 'image' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                        Drag &amp; drop an image here, or
                      </Typography>
                      <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}>
                        Browse files
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        PNG, JPG, SVG, WebP.
                      </Typography>
                      {isCompressing && (
                        <Typography variant="caption" color="primary">
                          Compressing image...
                        </Typography>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Box>
                    {imageFile && (
                      <Box sx={{ color: 'text.secondary' }}>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          Selected: {imageFile.name}
                        </Typography>
                        {imageInfo && (
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Size: {Math.round(imageInfo.originalSize / 1024)} KB &rarr;{' '}
                            {Math.round(imageInfo.compressedSize / 1024)} KB
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <TextField
                    label="SVG Code"
                    placeholder="<svg ...>...</svg>"
                    value={svgCode}
                    onChange={(event) => setSvgCode(event.target.value)}
                    multiline
                    minRows={7}
                    fullWidth
                    slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 13 } } }}
                  />
                )}

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
                  Preview
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    height: 192,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                  }}
                >
                  {iconType === 'image' ? (
                    imagePreview.url ? (
                      <Box
                        component="img"
                        src={imagePreview.url}
                        alt={name || 'Tech stack icon'}
                        sx={{ maxHeight: 128, maxWidth: 128, objectFit: 'contain' }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No image selected.
                      </Typography>
                    )
                  ) : svgCode.trim() ? (
                    <Box
                      sx={{ maxHeight: 128, maxWidth: 128, color: 'primary.main' }}
                      dangerouslySetInnerHTML={{ __html: sanitizeSvg(svgCode) }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Paste SVG code to preview.
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Preview updates automatically for both image and SVG.
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

export default EditTechStackPage
