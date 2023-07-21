import CyclicDb from '@cyclic.sh/dynamodb'
import crypto from 'crypto'
import { getIcon } from './s3'
import { increaseUserAvarageEvaluation, decreaseUserAvarageEvaluation, increaseUserAllEvaluationNum } from './user'
import { EvaluationInput, DBEvaluation, Evaluation } from '../types/types'

const db = CyclicDb('motionless-crab-hoseCyclicDB')
const evaluations = db.collection('evaluations')

export const createEvaluation = async (evaluation: EvaluationInput, evaluateeId: string): Promise<DBEvaluation | undefined> => {
  const uuid = crypto.randomUUID()
  if (!evaluation) return
  const newEvaluation: Omit<DBEvaluation['props'], 'created'> = { ...evaluation, is_published: false, is_deleted: false, evaluateeId }
  const result = await evaluations.set(uuid, newEvaluation)
  await increaseUserAllEvaluationNum(evaluateeId)
  return result
}

export const getEvaluation = async (id: string): Promise<Evaluation> => {
  const evaluation: DBEvaluation = await evaluations.get(id)
  return { ...evaluation.props, id: evaluation.key }
}

const sortByCreatedAt = (results: DBEvaluation[]): DBEvaluation[] => {
  const sortedResults = results.sort((a, b) => {
    const unixTimeA = new Date(a.props.created).getTime()
    const unixTimeB = new Date(b.props.created).getTime()
    return unixTimeB - unixTimeA
  })
  return sortedResults
}

const addParamsForReturnValueToEvaluations = async (results: DBEvaluation[]): Promise<Evaluation[]> => {
  const returnValue = await Promise.all(
    results.map(async (result) => {
      if (!result.props.evaluatorIconKey) {
        return { ...result.props, id: result.key, evaluatorIconUrl: undefined }
      } else {
        const icon = await getIcon(result.props.evaluatorIconKey)
        const base64Image = Buffer.from(icon.Body as Buffer).toString('base64')
        const imageSrc = `data:image/jpeg;base64,${base64Image}`
        return { ...result.props, id: result.key, evaluatorIconUrl: imageSrc }
      }
    }),
  )
  return returnValue
}

export const getAllEvaluations = async (evaluateeId: string): Promise<Evaluation[]> => {
  const res: { results: DBEvaluation[] } = await evaluations.filter({ evaluateeId, is_deleted: false })
  if (!res.results.length) return []
  const sortedResults = sortByCreatedAt(res.results)
  return addParamsForReturnValueToEvaluations(sortedResults)
}

export const getPublishedEvaluations = async (evaluateeId: string): Promise<Evaluation[]> => {
  const res: { results: DBEvaluation[] } = await evaluations.filter({ evaluateeId, is_published: true, is_deleted: false })
  if (!res.results.length) return []
  const sortedResults = sortByCreatedAt(res.results)
  return addParamsForReturnValueToEvaluations(sortedResults)
}

export const updateEvaluation = async ({
  evaluationId,
  isPublished,
  isDeleted,
}: {
  evaluationId: string
  isPublished?: boolean
  isDeleted?: boolean
}): Promise<{ update: boolean }> => {
  const evaluation: DBEvaluation = await evaluations.get(evaluationId)
  const res = await evaluations.set(evaluationId, {
    ...evaluation,
    is_published: isPublished ?? evaluation.props.is_published,
    is_deleted: isDeleted ?? evaluation.props.is_deleted,
  })
  if (isPublished) {
    await increaseUserAvarageEvaluation(evaluation.props.evaluateeId, evaluation.props)
  } else {
    await decreaseUserAvarageEvaluation(evaluation.props.evaluateeId, evaluation.props)
  }
  if (!!res) return { update: true }
  return { update: false }
}

// FIXME: データ確認用なので最後に消す
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deleteAllEvaluations = async (): Promise<void> => {
  const usersList = await evaluations.list()
  const targetKeys: string[] = usersList.results.map((result: DBEvaluation) => result.key)
  targetKeys.forEach(async (key) => {
    await evaluations.delete(key)
  })
}

// FIXME: データ確認用なので最後に消す
// deleteAllEvaluations()
