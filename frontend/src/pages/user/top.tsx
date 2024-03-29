import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

/* components */
import { UserTopTpl, Layout } from 'components/templates'

/* lib, types, apis */
import { keepScrollPosition, restoreScrollPosition } from 'lib/scroll-position'
import { User, Evaluation, FlashMessage } from 'types/types'
import { fetchUser } from 'apis/user'
import { fetchIconUrl } from 'apis/icon'
import { fetchSelfEvaluations, fetchOthersEvaluations, publishEvaluation, unpublishEvaluation, deleteEvaluation } from 'apis/evaluation'
import { errorMessages } from 'const/errorMessages'

const EVALUATIONS_PER_PAGE = 7

export const UserTop: React.FC = () => {
  const [user, setUser] = useState<User>()
  const [userIconUrl, setUserIconUrl] = useState<string>('')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [evaluationsToShow, setEvaluationsToShow] = useState<Evaluation[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [lastPage, setLastPage] = useState<number>(10)
  const [flashMessage, setFlashMessage] = useState<FlashMessage | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { isLoading: isAuth0Loading, isAuthenticated, user: auth0User, getAccessTokenSilently } = useAuth0()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const isSelfMyPage = useCallback(
    (user: User) => {
      if (!auth0User || !user) return false
      return auth0User.sub === user.auth0_id
    },
    [auth0User],
  )

  const fetchEvaluations = useCallback(
    async (user: User): Promise<Evaluation[]> => {
      try {
        if (isSelfMyPage(user)) {
          const token = await getAccessTokenSilently()
          const evaluations = await fetchSelfEvaluations(token, params.id)
          return evaluations
        } else {
          const evaluations = await fetchOthersEvaluations(params.id)
          return evaluations
        }
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(e.message)
        }
        throw new Error(errorMessages.evaluation.get)
      }
    },
    [getAccessTokenSilently, isSelfMyPage, params.id],
  )

  const refetchAfterUpdateEvaluation = async (): Promise<void> => {
    try {
      const user = await fetchUser(params.id)
      const evaluations = await fetchEvaluations(user)
      setUser(user)
      setEvaluations(evaluations)
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      }
    }
  }

  const onClickPublish = async (evaluationId: string): Promise<void> => {
    keepScrollPosition()
    setIsLoading(true)
    setFlashMessage(undefined)
    try {
      const token = await getAccessTokenSilently()
      await publishEvaluation(token, params.id, evaluationId)
      await refetchAfterUpdateEvaluation()
      restoreScrollPosition()
      setIsLoading(false)
      setFlashMessage({ type: 'success', message: '公開しました。' })
    } catch (e) {
      setIsLoading(false)
      if (e instanceof Error) {
        setFlashMessage({ type: 'error', message: e.message })
      }
    }
  }

  const onClickUnpublish = async (evaluationId: string): Promise<void> => {
    keepScrollPosition()
    setIsLoading(true)
    setFlashMessage(undefined)
    try {
      const token = await getAccessTokenSilently()
      await unpublishEvaluation(token, params.id, evaluationId)
      await refetchAfterUpdateEvaluation()
      restoreScrollPosition()
      setIsLoading(false)
      setFlashMessage({ type: 'success', message: '非公開にしました。' })
    } catch (e) {
      setIsLoading(false)
      if (e instanceof Error) {
        setFlashMessage({ type: 'error', message: e.message })
      }
    }
  }

  const onClickDelete = async (evaluationId: string): Promise<void> => {
    const canProceed = confirm('本当に削除してもよろしいですか？\nこの処理は元に戻すことはできません。')
    if (!canProceed) return

    keepScrollPosition()
    setIsLoading(true)
    setFlashMessage(undefined)
    try {
      const token = await getAccessTokenSilently()
      await deleteEvaluation(token, params.id, evaluationId)
      await refetchAfterUpdateEvaluation()
      restoreScrollPosition()
      setIsLoading(false)
      setFlashMessage({ type: 'success', message: '削除しました。' })
    } catch (e) {
      setIsLoading(false)
      if (e instanceof Error) {
        setFlashMessage({ type: 'error', message: e.message })
      }
    }
  }

  const onClickSharePage = async (): Promise<void> => {
    setFlashMessage(undefined)
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/user/${params.id}`)
      setFlashMessage({
        type: 'success',
        message: isSelfMyPage(user as User)
          ? 'このページのURLがコピーされました。\nみんなに紹介を書いてもらおう！'
          : `このページのURLがコピーされました。\n${user?.name}さんをみんなに知ってもらおう！`,
      })
    } catch (e) {
      if (e instanceof Error) {
        setFlashMessage({ type: 'error', message: errorMessages.copy })
      }
    }
  }

  useEffect(() => {
    if (isAuth0Loading) return
    ;(async () => {
      try {
        const user = await fetchUser(params.id)
        const iconUrl = await fetchIconUrl(user.icon_key)
        const evaluations = await fetchEvaluations(user)
        setUser(user)
        setUserIconUrl(iconUrl)
        setEvaluations(evaluations)
        const evaluationNum = isSelfMyPage(user) ? user.allEvaluationNum : user.publishedEvaluationNum
        const lastPage =
          evaluationNum % EVALUATIONS_PER_PAGE === 0
            ? evaluationNum / EVALUATIONS_PER_PAGE
            : Math.floor(evaluationNum / EVALUATIONS_PER_PAGE) + 1
        setLastPage(lastPage)
        setIsLoading(false)

        if (location.state && location.state.flashMessage) {
          setFlashMessage(location.state.flashMessage)

          setTimeout(() => {
            // リロードするとstateが残ってしまうので、遷移後すぐにstateを削除する
            navigate(location.pathname, { replace: true })
          }, 100)
        }
      } catch (e) {
        setIsLoading(false)
        if (e instanceof Error) {
          setFlashMessage({ type: 'error', message: e.message })
        }
      }
    })()
  }, [
    isAuth0Loading,
    params.id,
    isAuthenticated,
    location.state,
    getAccessTokenSilently,
    fetchEvaluations,
    navigate,
    location.pathname,
    isSelfMyPage,
  ])

  useEffect(() => {
    const currentPage = Number(searchParams.get('page') || 1)
    setCurrentPage(currentPage)
    // BEでの実装が厳しいのでFEでページネーションの表示だけ切り替え実装
    if (currentPage === 1) {
      setEvaluationsToShow(evaluations.slice(0, EVALUATIONS_PER_PAGE))
    } else if (currentPage !== lastPage) {
      setEvaluationsToShow(evaluations.slice((currentPage - 1) * EVALUATIONS_PER_PAGE + 1, currentPage * EVALUATIONS_PER_PAGE + 1))
    } else {
      setEvaluationsToShow(evaluations.slice((currentPage - 1) * EVALUATIONS_PER_PAGE))
    }
  }, [searchParams, lastPage, evaluations])

  useEffect(() => {
    if (location.state && location.state.flashMessage && !isLoading) {
      setFlashMessage(location.state.flashMessage)

      setTimeout(() => {
        // リロードするとstateが残ってしまうので、遷移後すぐにstateを削除する
        navigate(location.pathname, { replace: true })
      }, 300)
    }
  }, [location.pathname, location.state, isLoading, navigate])

  return (
    <>
      <Layout flashMessages={flashMessage ? [flashMessage] : undefined} isLoading={isLoading}>
        {user && evaluations !== undefined && (
          <UserTopTpl
            user={user}
            userIconUrl={userIconUrl}
            evaluations={evaluationsToShow}
            currentPage={currentPage}
            lastPage={lastPage}
            isSelfMyPage={isSelfMyPage(user)}
            onClickPublish={onClickPublish}
            onClickUnpublish={onClickUnpublish}
            onClickDelete={onClickDelete}
            onClickSharePage={onClickSharePage}
          />
        )}
      </Layout>
    </>
  )
}
