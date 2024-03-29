import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { Auth0Provider } from '@auth0/auth0-react'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
const auth0RedirectUri = `${window.location.origin}/login/callback`
root.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN ?? ''}
    clientId={process.env.REACT_APP_AUTH0_CLIENT_ID ?? ''}
    authorizationParams={{
      redirect_uri: auth0RedirectUri,
      audience: process.env.REACT_APP_AUTH0_API_AUDIENCE,
    }}
    useRefreshTokens
    cacheLocation="localstorage"
    useRefreshTokensFallback
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Auth0Provider>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
