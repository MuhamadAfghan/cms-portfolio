export interface Review {
  id: string
  name: string | null
  role: string
  company_name: string | null
  rating: number
  review: string
  is_private: boolean
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export interface ReviewInput {
  name?: string | null
  role: string
  company_name?: string | null
  rating: number
  review: string
  is_private: boolean
}

export type ReviewInsert = ReviewInput
export type ReviewUpdate = Partial<ReviewInput>
