import { getSupabaseClient } from '../lib/supabaseClient'
import type { Review, ReviewInsert, ReviewUpdate } from '../types/review'

const TABLE_NAME = 'review'

const supabase = () => getSupabaseClient()

export const fetchReviews = async (): Promise<Review[]> => {
  const { data, error } = await supabase()
    .from(TABLE_NAME)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []) as Review[]
}

export const createReview = async (payload: ReviewInsert): Promise<Review> => {
  const { data, error } = await supabase()
    .from(TABLE_NAME)
    .insert({
      name: payload.name ?? null,
      role: payload.role,
      company_name: payload.company_name ?? null,
      rating: payload.rating,
      review: payload.review,
      is_private: payload.is_private,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Review
}

export const updateReview = async (
  id: string,
  payload: ReviewUpdate,
): Promise<Review> => {
  const { data, error } = await supabase()
    .from(TABLE_NAME)
    .update({
      name: payload.name ?? null,
      role: payload.role,
      company_name: payload.company_name ?? null,
      rating: payload.rating,
      review: payload.review,
      is_private: payload.is_private,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as Review
}

export const deleteReview = async (id: string): Promise<void> => {
  const { error } = await supabase().from(TABLE_NAME).delete().eq('id', id)
  if (error) {
    throw error
  }
}
