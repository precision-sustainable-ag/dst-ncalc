import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
// FIXME: this is currently using selector's client id
import { auth0Domain, auth0Audience, auth0ClientId } from '../../utils/keys';

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();
  const redirectUri = window.location.origin;

  const onRedirectCallback = (appState) => {
    window.history.replaceState(
      {},
      document.title,
      `${window.location.origin}/#${appState?.returnTo || '/'}`,
    );
    navigate(appState?.returnTo || '/');
  };

  if (!(auth0Domain && auth0ClientId && auth0Audience)) {
    return null;
  }

  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        audience: auth0Audience,
        redirect_uri: redirectUri,
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens
      // solve the problem that Firefox is not auto login
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;
