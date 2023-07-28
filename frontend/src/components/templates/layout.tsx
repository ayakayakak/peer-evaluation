import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import styled from 'styled-components'

/* components */
import { Header } from 'components/organisms'

/* lib, types */
import { fetchUserByAuth0Id } from 'apis/user'

/* images */
import background from 'assets/images/background.svg'

type Props = {
  children?: React.ReactNode
}

const StyledWrapper = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  background: url(${background});
  display: flex;
  justify-content: center;

  .inner {
    width: 100%;
    max-width: 600px;
    background: ${(props): string => props.theme.background};
  }
`

export const Layout: React.FC<Props> = ({ children }) => {
  const { isLoading, isAuthenticated, logout, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [userId, setUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (isLoading) return
    ;(async () => {
      try {
        const token = await getAccessTokenSilently()
        // Auth0のidからuserIdを取得する
        const user = await fetchUserByAuth0Id(token)
        setUserId(user?.key)
      } catch (e) {
        // TODO: エラー処理
      }
    })()
  })

  return (
    <StyledWrapper>
      <div className="inner">
        <Header isLoggedIn={isAuthenticated} loginUserId={userId} onClickLogin={loginWithRedirect} onClickLogout={logout} />
        {children}
      </div>
    </StyledWrapper>
  )
}
