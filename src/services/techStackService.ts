import { getSupabaseClient } from '../lib/supabaseClient'
import type {
  TechStack,
  TechStackInsert,
  TechStackUpdate,
} from '../types/techStack'

const TABLE_NAME = 'tech_stack'
const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'tech-stacks'

const supabase = () => getSupabaseClient()

const sanitizeFilename = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()

const generateFilename = (originalName: string) => {
  const sanitized = sanitizeFilename(originalName)
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `file-${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${random}-${sanitized}`
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

const uploadIconImage = async (file: File) => {
  const filename = generateFilename(file.name)
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

const removeIconImage = async (url?: string | null) => {
  if (!url) return
  const path = getPathFromPublicUrl(url)
  if (!path) return
  const { error } = await supabase()
    .storage.from(STORAGE_BUCKET)
    .remove([path])
  if (error) {
    console.warn('Failed to remove icon from storage', error.message)
  }
}

export const fetchTechStacks = async (): Promise<TechStack[]> => {
  const { data, error } = await supabase()
    .from(TABLE_NAME)
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return (data || []) as TechStack[]
}

export const createTechStack = async (
  payload: TechStackInsert,
  options?: { imageFile?: File | null; svgCode?: string },
): Promise<TechStack> => {
  let source: string | null = payload.source ?? null

  if (payload.type === 'image') {
    if (options?.imageFile) {
      source = await uploadIconImage(options.imageFile)
    }
  }

  if (payload.type === 'svg') {
    if (options?.svgCode) {
      source = options.svgCode
    }
  }

  const { data, error } = await supabase()
    .from(TABLE_NAME)
    .insert({
      name: payload.name,
      type: payload.type,
      source,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as TechStack
}

export const updateTechStack = async (
  id: string,
  payload: TechStackUpdate,
  options?: {
    imageFile?: File | null
    svgCode?: string
    previousSource?: string | null
  },
): Promise<TechStack> => {
  let source: string | null = payload.source ?? null

  if (payload.type === 'image' && options?.imageFile) {
    source = await uploadIconImage(options.imageFile)
  }

  if (payload.type === 'svg' && options?.svgCode) {
    source = options.svgCode
  }

  const { data, error } = await supabase()
    .from(TABLE_NAME)
    .update({
      name: payload.name,
      type: payload.type,
      source,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  if (options?.previousSource && options.previousSource !== source) {
    await removeIconImage(options.previousSource)
  }

  return data as TechStack
}

export const deleteTechStack = async (
  id: string,
  source?: string | null,
): Promise<void> => {
  const { error } = await supabase().from(TABLE_NAME).delete().eq('id', id)
  if (error) {
    throw error
  }

  await removeIconImage(source)
}
