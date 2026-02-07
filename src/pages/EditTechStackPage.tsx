import React, { useEffect, useRef, useState } from 'react'
import Compressor from 'compressorjs'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
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
  const navigate = useNavigate()
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
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white">Tech Stack Not Found</h1>
          <p className="text-base-content/70 mt-2">
            We could not find the tech stack you are trying to edit.
          </p>
          <Link to="/tech-stacks" className="btn btn-primary mt-6">
            Back to Tech Stacks
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Edit Tech Stack</h1>
            <p className="text-sm text-base-content/60 mt-2">
              Update the stack name and replace the icon when needed.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/tech-stacks" className="btn btn-ghost">
              Cancel
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="card bg-base-200 shadow-xl border border-base-content/20">
              <div className="card-body space-y-4">
                <h2 className="card-title text-xl font-semibold">Details</h2>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Stack Name</span>
                  </div>
                  <input
                    className="input input-bordered w-full"
                    placeholder="e.g. TailwindCSS"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>

                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Icon Type</span>
                  </div>
                  <div className="join">
                    <button
                      type="button"
                      className={`btn join-item ${
                        iconType === 'image' ? 'btn-primary' : 'btn-outline'
                      }`}
                      onClick={() => setIconType('image')}
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      className={`btn join-item ${
                        iconType === 'svg' ? 'btn-primary' : 'btn-outline'
                      }`}
                      onClick={() => setIconType('svg')}
                    >
                      SVG Code
                    </button>
                  </div>
                </label>

                {iconType === 'image' ? (
                  <div className="space-y-3">
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
                        Drag & drop an image here, or
                      </p>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse files
                      </button>
                      <p className="text-xs text-base-content/50">
                        PNG, JPG, SVG, WebP.
                      </p>
                      {isCompressing && (
                        <p className="text-xs text-primary">
                          Compressing image...
                        </p>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    {imageFile && (
                      <div className="space-y-1 text-xs text-base-content/60">
                        <p>Selected: {imageFile.name}</p>
                        {imageInfo && (
                          <p>
                            Size: {Math.round(imageInfo.originalSize / 1024)} KB
                            {'->'} {Math.round(imageInfo.compressedSize / 1024)} KB
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">SVG Code</span>
                    </div>
                    <textarea
                      className="textarea textarea-bordered w-full min-h-[180px] font-mono text-sm"
                      placeholder="<svg ...>...</svg>"
                      value={svgCode}
                      onChange={(event) => setSvgCode(event.target.value)}
                    />
                  </label>
                )}

                {error && (
                  <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-base-200 shadow-xl border border-base-content/20">
              <div className="card-body space-y-4">
                <h2 className="card-title text-xl font-semibold">Preview</h2>
                <div className="flex h-48 items-center justify-center rounded-lg border border-base-content/20 bg-base-300/40">
                  {iconType === 'image' ? (
                    imagePreview.url ? (
                      <img
                        src={imagePreview.url}
                        alt={name || 'Tech stack icon'}
                        className="max-h-32 max-w-32 object-contain"
                      />
                    ) : (
                      <span className="text-sm text-base-content/60">
                        No image selected.
                      </span>
                    )
                  ) : svgCode.trim() ? (
                    <div
                      className="max-h-32 max-w-32 text-primary"
                      dangerouslySetInnerHTML={{ __html: svgCode }}
                    />
                  ) : (
                    <span className="text-sm text-base-content/60">
                      Paste SVG code to preview.
                    </span>
                  )}
                </div>
                <p className="text-xs text-base-content/60">
                  Preview updates automatically for both image and SVG.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EditTechStackPage
