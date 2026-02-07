export type TechStackIconType = 'image' | 'svg'

export interface TechStack {
  id: string
  name: string
  type: TechStackIconType
  source: string | null
  created_at?: string
  updated_at?: string
}

export interface TechStackInput {
  name: string
  type: TechStackIconType
  source?: string | null
}

export type TechStackInsert = TechStackInput
export type TechStackUpdate = Partial<TechStackInput>
