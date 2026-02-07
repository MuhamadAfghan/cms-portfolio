import { getSupabaseClient } from '../lib/supabaseClient'
import type {
  Portfolio,
  PortfolioImage,
  PortfolioInput,
  PortfolioWithRelations,
} from '../types/portfolio'
import type { TechStack } from '../types/techStack'

const PORTFOLIO_TABLE = 'portfolio'
const IMAGE_TABLE = 'portfolio_images'
const JOIN_TABLE = 'portfolio_tech_stack'
const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_UPLOADS_BUCKET ||
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ||
  'uploads'

const supabase = () => getSupabaseClient()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const getPortfolioFolder = (title: string) => slugify(title) || 'portfolio'

const generatePortfolioFilename = (title: string, originalName: string) => {
  const extMatch = originalName.match(/\.([a-z0-9]+)$/i)
  const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : ''
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `file-${Date.now()}-${Math.random().toString(16).slice(2)}`
  const base = getPortfolioFolder(title)
  return `${base}/${base}-${random}${ext}`
}

const getPathFromPublicUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)
    const bucketIndex = parts.indexOf(STORAGE_BUCKET)
    if (bucketIndex === -1) return null
    return parts.slice(bucketIndex + 1).join('/')
  } catch {
    return null
  }
}

const uploadPortfolioImage = async (
  title: string,
  file: File,
): Promise<string> => {
  const filename = `portfolios/${generatePortfolioFilename(title, file.name)}`
  const { data, error } = await supabase()
    .storage.from(STORAGE_BUCKET)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    throw error
  }

  const { data: publicData } = supabase()
    .storage.from(STORAGE_BUCKET)
    .getPublicUrl(data.path)

  return publicData.publicUrl
}

const removePortfolioImage = async (url?: string | null) => {
  if (!url) return
  const path = getPathFromPublicUrl(url)
  if (!path) return
  const { error } = await supabase()
    .storage.from(STORAGE_BUCKET)
    .remove([path])
  if (error) {
    console.warn('Failed to remove portfolio image', error.message)
  }
}

const mapPortfolioRecord = (record: {
  [key: string]: unknown
  portfolio_images?: PortfolioImage[]
  portfolio_tech_stack?: { tech_stack?: TechStack | null }[]
}): PortfolioWithRelations => {
  const images = (record.portfolio_images || []) as PortfolioImage[]
  const techStacks = (record.portfolio_tech_stack || [])
    .map((row) => row.tech_stack)
    .filter(Boolean) as TechStack[]

  const base = record as unknown as Portfolio

  return {
    ...base,
    images,
    techStacks,
  }
}

export const fetchPortfolios = async (): Promise<PortfolioWithRelations[]> => {
  const { data, error } = await supabase()
    .from(PORTFOLIO_TABLE)
    .select(
      `
        *,
        portfolio_images ( id, url, sort_order ),
        portfolio_tech_stack ( tech_stack:tech_stack ( id, name, type, source ) )
      `,
    )
    .order('created_at', { ascending: false })
    .order('sort_order', { foreignTable: 'portfolio_images', ascending: true })

  if (error) {
    throw error
  }

  return (data || []).map(mapPortfolioRecord)
}

export const fetchPortfolioById = async (
  id: string,
): Promise<PortfolioWithRelations | null> => {
  const { data, error } = await supabase()
    .from(PORTFOLIO_TABLE)
    .select(
      `
        *,
        portfolio_images ( id, url, sort_order ),
        portfolio_tech_stack ( tech_stack:tech_stack ( id, name, type, source ) )
      `,
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapPortfolioRecord(data)
}

const syncPortfolioTechStacks = async (
  portfolioId: string,
  techStackIds: string[],
) => {
  await supabase()
    .from(JOIN_TABLE)
    .delete()
    .eq('portfolio_id', portfolioId)

  if (!techStackIds.length) return

  const rows = techStackIds.map((techStackId) => ({
    portfolio_id: portfolioId,
    tech_stack_id: techStackId,
  }))

  const { error } = await supabase().from(JOIN_TABLE).insert(rows)
  if (error) {
    throw error
  }
}

const insertPortfolioImages = async (
  portfolioId: string,
  imageUrls: string[],
) => {
  if (!imageUrls.length) return
  const rows = imageUrls.map((url, index) => ({
    portfolio_id: portfolioId,
    url,
    sort_order: index,
  }))
  const { error } = await supabase().from(IMAGE_TABLE).insert(rows)
  if (error) {
    throw error
  }
}

export const createPortfolio = async (
  input: PortfolioInput,
  options?: { images?: File[]; techStackIds?: string[] },
): Promise<PortfolioWithRelations> => {
  const { data, error } = await supabase()
    .from(PORTFOLIO_TABLE)
    .insert({
      title: input.title,
      slug: input.slug ?? null,
      summary: input.summary ?? null,
      content: input.content ?? null,
      link_demo: input.link_demo ?? null,
      link_github: input.link_github ?? null,
      status: input.status,
      featured: input.featured,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  const created = data as Portfolio
  const imageFiles = options?.images || []

  if (imageFiles.length) {
    const urls = await Promise.all(
      imageFiles.map((file) => uploadPortfolioImage(input.title, file)),
    )
    await insertPortfolioImages(created.id, urls)
  }

  await syncPortfolioTechStacks(created.id, options?.techStackIds || [])

  const portfolio = await fetchPortfolioById(created.id)
  if (!portfolio) {
    throw new Error('Failed to load created portfolio.')
  }
  return portfolio
}

export const updatePortfolio = async (
  id: string,
  input: PortfolioInput,
  options?: {
    images?: File[]
    techStackIds?: string[]
    removedImages?: { id: string; url: string }[]
  },
): Promise<PortfolioWithRelations> => {
  const { error } = await supabase()
    .from(PORTFOLIO_TABLE)
    .update({
      title: input.title,
      slug: input.slug ?? null,
      summary: input.summary ?? null,
      content: input.content ?? null,
      link_demo: input.link_demo ?? null,
      link_github: input.link_github ?? null,
      status: input.status,
      featured: input.featured,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  if (options?.removedImages?.length) {
    const ids = options.removedImages.map((item) => item.id)
    const { error: deleteError } = await supabase()
      .from(IMAGE_TABLE)
      .delete()
      .in('id', ids)
    if (deleteError) {
      throw deleteError
    }
    await Promise.all(
      options.removedImages.map((item) => removePortfolioImage(item.url)),
    )
  }

  if (options?.images?.length) {
    const urls = await Promise.all(
      options.images.map((file) => uploadPortfolioImage(input.title, file)),
    )
    await insertPortfolioImages(id, urls)
  }

  await syncPortfolioTechStacks(id, options?.techStackIds || [])

  const updated = await fetchPortfolioById(id)
  if (!updated) {
    throw new Error('Failed to load updated portfolio.')
  }

  return updated
}

export const deletePortfolio = async (
  portfolio: PortfolioWithRelations,
): Promise<void> => {
  const { error } = await supabase()
    .from(PORTFOLIO_TABLE)
    .delete()
    .eq('id', portfolio.id)
  if (error) {
    throw error
  }

  await Promise.all(
    portfolio.images.map((image) => removePortfolioImage(image.url)),
  )
}
