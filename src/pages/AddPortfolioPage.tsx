import React, { useEffect, useRef, useState } from 'react'
import Compressor from 'compressorjs'
import DashboardLayout from '../layouts/DashboardLayout'
import WysiwygEditor from '../components/WysiwygEditor'
import { useNavigate, Link } from 'react-router-dom'
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

interface ImageItem {
  id: string
  file: File
  previewUrl: string
  originalSize: number
  compressedSize: number
}

type IconType = 'image' | 'svg'

const formatBytes = (bytes: number) => {
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

const AddPortfolioPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imagesRef = useRef<ImageItem[]>([])
  const navigate = useNavigate()
  const { createItem } = usePortfolios()
  const { items: techStacks, createItem: createTechStack } = useTechStacks()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<PortfolioStatus>('draft')
  const [featured, setFeatured] = useState(false)
  const [selectedTechStacks, setSelectedTechStacks] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
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

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      if (newStackPreview.isObjectUrl && newStackPreview.url) {
        URL.revokeObjectURL(newStackPreview.url)
      }
    }
  }, [newStackPreview])

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

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  const toggleTechStack = (id: string) => {
    setSelectedTechStacks((prev) =>
      prev.includes(id) ? prev.filter((stackId) => stackId !== id) : [...prev, id],
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

  const handleSave = async () => {
    const input = normalizePortfolioInput({
      title,
      slug: slug.trim() ? slug : slugify(title),
      summary,
      content,
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
      await createItem(input, {
        images: images.map((image) => image.file),
        techStackIds: selectedTechStacks,
      })
      navigate('/portfolios')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save portfolio.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Add New Portfolio</h1>
            <p className="text-sm text-base-content/60 mt-2">
              Upload images, write the story, and publish a new portfolio item.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/portfolios" className="btn btn-ghost">
              Cancel
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Portfolio'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="card bg-base-200 shadow-xl border border-base-content/20">
              <div className="card-body space-y-4">
                <h2 className="card-title text-xl font-semibold">
                  Basic Information
                </h2>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Title</span>
                  </div>
                  <input
                    className="input input-bordered w-full"
                    placeholder="e.g. Pomoro"
                    value={title}
                    onChange={(event) => {
                      const nextTitle = event.target.value
                      setTitle(nextTitle)
                      if (!slugEdited) {
                        setSlug(slugify(nextTitle))
                      }
                    }}
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Slug</span>
                  </div>
                  <input
                    className="input input-bordered w-full"
                    placeholder="e.g. pomoro"
                    value={slug}
                    onChange={(event) => {
                      const nextSlug = event.target.value
                      setSlug(nextSlug)
                      setSlugEdited(nextSlug.trim().length > 0)
                    }}
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Short Summary</span>
                  </div>
                  <textarea
                    className="textarea textarea-bordered w-full min-h-[120px]"
                    placeholder="A quick overview for cards and previews."
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl border border-base-content/20">
              <div className="card-body space-y-4">
                <h2 className="card-title text-xl font-semibold">Content</h2>
                <WysiwygEditor value={content} onChange={setContent} />
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl border border-base-content/20">
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="card-title text-xl font-semibold">Tech Stack</h2>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => setShowQuickAdd((prev) => !prev)}
                  >
                    {showQuickAdd ? 'Close' : 'Add New Tech Stack'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {techStacks.map((stack) => {
                    const selected = selectedTechStacks.includes(stack.id)
                    return (
                      <label
                        key={stack.id}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                          selected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-base-content/20 bg-base-300/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selected}
                          onChange={() => toggleTechStack(stack.id)}
                        />
                        {stack.type === 'image' && stack.source ? (
                          <img
                            src={stack.source}
                            alt={stack.name}
                            className="h-6 w-6 object-contain"
                          />
                        ) : stack.type === 'svg' && stack.source ? (
                          <span
                            className="h-6 w-6"
                            dangerouslySetInnerHTML={{ __html: stack.source }}
                          />
                        ) : (
                          <span className="h-6 w-6 rounded bg-base-200" />
                        )}
                        <span>{stack.name}</span>
                      </label>
                    )
                  })}
                  {!techStacks.length && (
                    <div className="text-sm text-base-content/60">
                      No tech stacks yet. Add one below.
                    </div>
                  )}
                </div>

                {showQuickAdd && (
                  <div className="mt-4 rounded-lg border border-base-content/20 bg-base-300/30 p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-base-content">
                      Quick Add Tech Stack
                    </h3>
                    <label className="form-control w-full">
                      <div className="label">
                        <span className="label-text">Name</span>
                      </div>
                      <input
                        className="input input-bordered w-full"
                        placeholder="e.g. Astro"
                        value={newStackName}
                        onChange={(event) => setNewStackName(event.target.value)}
                      />
                    </label>
                    <div className="form-control">
                      <div className="label">
                        <span className="label-text">Icon Type</span>
                      </div>
                      <div className="join">
                        <button
                          type="button"
                          className={`btn join-item ${
                            newStackType === 'image' ? 'btn-primary' : 'btn-outline'
                          }`}
                          onClick={() => setNewStackType('image')}
                        >
                          Image
                        </button>
                        <button
                          type="button"
                          className={`btn join-item ${
                            newStackType === 'svg' ? 'btn-primary' : 'btn-outline'
                          }`}
                          onClick={() => setNewStackType('svg')}
                        >
                          SVG Code
                        </button>
                      </div>
                    </div>

                    {newStackType === 'image' ? (
                      <div className="space-y-3">
                        <input
                          type="file"
                          className="file-input file-input-bordered w-full"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) handleQuickAddImage(file)
                            event.target.value = ''
                          }}
                        />
                        {newStackCompressing && (
                          <p className="text-xs text-primary">
                            Compressing image...
                          </p>
                        )}
                      </div>
                    ) : (
                      <textarea
                        className="textarea textarea-bordered w-full min-h-[120px] font-mono text-sm"
                        placeholder="<svg ...>...</svg>"
                        value={newStackSvg}
                        onChange={(event) => setNewStackSvg(event.target.value)}
                      />
                    )}

                    <div className="rounded-lg border border-base-content/20 bg-base-200 p-4 text-center">
                      {newStackType === 'image' ? (
                        newStackPreview.url ? (
                          <img
                            src={newStackPreview.url}
                            alt={newStackName || 'Tech stack icon'}
                            className="mx-auto h-16 w-16 object-contain"
                          />
                        ) : (
                          <span className="text-xs text-base-content/60">
                            No image selected.
                          </span>
                        )
                      ) : newStackSvg.trim() ? (
                        <div
                          className="mx-auto h-16 w-16"
                          dangerouslySetInnerHTML={{ __html: newStackSvg }}
                        />
                      ) : (
                        <span className="text-xs text-base-content/60">
                          Paste SVG code to preview.
                        </span>
                      )}
                    </div>

                    {newStackError && (
                      <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                        {newStackError}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={handleQuickAdd}
                        disabled={newStackSaving}
                      >
                        {newStackSaving ? 'Saving...' : 'Save Tech Stack'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-base-200 shadow-xl border border-base-content/20">
              <div className="card-body space-y-4">
                <h2 className="card-title text-xl font-semibold">Images</h2>
                <div
                  className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-10 text-center transition ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-base-content/30 bg-base-300/40'
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <p className="text-sm text-base-content/70">
                    Drag & drop images here, or
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse files
                  </button>
                  <p className="text-xs text-base-content/50">
                    PNG, JPG, WebP. Multiple images allowed.
                  </p>
                  {isCompressing && (
                    <p className="text-xs text-primary">Compressing images...</p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleInputChange}
                  />
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="rounded-lg border border-base-content/20 bg-base-300/30 p-3"
                      >
                        <img
                          src={image.previewUrl}
                          alt={image.file.name}
                          className="h-28 w-full rounded-md object-cover"
                        />
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-base-content">
                            {image.file.name}
                          </p>
                          <p className="text-xs text-base-content/60">
                            {formatBytes(image.originalSize)} {'->'}{' '}
                            {formatBytes(image.compressedSize)}
                          </p>
                          <button
                            type="button"
                            className="btn btn-xs btn-ghost"
                            onClick={() => removeImage(image.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl border border-base-content/20">
              <div className="card-body space-y-4">
                <h2 className="card-title text-xl font-semibold">Visibility</h2>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Status</span>
                  </div>
                  <select
                    className="select select-bordered w-full"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as PortfolioStatus)
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Featured</span>
                  </div>
                  <select
                    className="select select-bordered w-full"
                    value={featured ? 'yes' : 'no'}
                    onChange={(event) =>
                      setFeatured(event.target.value === 'yes')
                    }
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AddPortfolioPage
