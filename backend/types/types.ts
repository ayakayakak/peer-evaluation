type DBProperties = {
  collection: string
  key: string
}

export type User = {
  id: string
  auth0_id: string
  name: string
  profile: string
  icon_key: string
  is_deleted: boolean
}

export type DBUser = DBProperties & { props: User }

export type Auth0User = {
  email: string
  email_verified: boolean
  name: string
  nickname: string
  picture: string
  sub: string
  updated_at: string
}

export type UserInput = {
  name: string
  profile: string
  icon_key: string
}

// TODO: google以外のログインも受け付けるなら要変更
export type Auth0AuthenticatedBy = 'google' | 'auth0'

export type EvaluationLabelKeys = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6'
export const EvaluationLabels = {
  e1: '情熱a',
  e2: '情熱b',
  e3: '情熱c',
  e4: '情熱d',
  e5: '情熱e',
  e6: '情熱f',
} as const satisfies Record<EvaluationLabelKeys, string>
export type EvaluationLabels = (typeof EvaluationLabels)[keyof typeof EvaluationLabels]
export const EvaluationLabelKeys = Object.keys(EvaluationLabels) as EvaluationLabelKeys[]
export const EvaluationLabelValues = Object.values(EvaluationLabels)

// TODO: pointは小数点以下一桁で返す
export type Evaluation = {
  id: string
  evaluatee: User
  evaluatorName: string
  evaluatorIconUrl?: string
  relationship: string
  comment: string
  e1: {
    point: number
    reason: string
  }
  e2: {
    point: number
    reason: string
  }
  e3: {
    point: number
    reason: string
  }
  e4: {
    point: number
    reason: string
  }
  e5: {
    point: number
    reason: string
  }
  e6: {
    point: number
    reason: string
  }
  isPublished: boolean
  isDeleted: boolean
}
export type DBEvaluation = DBProperties & { props: Evaluation }

export type EvaluationInput = {
  evaluatorName: string
  evaluatorIconUrl?: string
  relationship: string
  comment: string
  e1: {
    point: number
    reason: string
  }
  e2: {
    point: number
    reason: string
  }
  e3: {
    point: number
    reason: string
  }
  e4: {
    point: number
    reason: string
  }
  e5: {
    point: number
    reason: string
  }
  e6: {
    point: number
    reason: string
  }
}

export type AvarageEvaluation = Record<EvaluationLabelKeys | 'evaluatee', number | User>