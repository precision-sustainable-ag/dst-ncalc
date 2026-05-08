/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import { ncalcApiUrl } from './keys';

const API_BASE_URL = ncalcApiUrl;

let _getAccessTokenSilently = null;
let _loginWithPopup = null;

export const initAuth = (getAccessTokenSilently, loginWithPopup) => {
  _getAccessTokenSilently = getAccessTokenSilently;
  _loginWithPopup = loginWithPopup;
};

const getAuthToken = async () => {
  if (!_getAccessTokenSilently) return null;
  try {
    return await _getAccessTokenSilently();
  } catch (error) {
    const isAuthError = error.error === 'login_required'
      || error.error === 'consent_required'
      || error.error === 'interaction_required'
      || error.error === 'invalid_grant'
      || error.error === 'missing_refresh_token';

    // If auth error, then return null and start the login flow
    if (isAuthError && _loginWithPopup) {
      await _loginWithPopup({
        appState: { returnTo: window.location.hash.replace('#', '') },
      });
      // Return null to signal that a redirect is in progress.
      // The request interceptor will abort the API call when it receives null.
      return null;
    }
    throw error;
  }
};

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const privateApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Middleware that fetches the auth token and attaches it to the request headers
privateApi.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (!token) {
    // Throw a flagged error for downstream catch blocks to distinguish this from an API failure
    const error = new Error('Auth redirect in progress');
    error.isAuthRedirect = true;
    throw error;
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Error handling middleware
const handleResponseError = (error) => Promise.reject(error);

publicApi.interceptors.response.use((res) => res, handleResponseError);
privateApi.interceptors.response.use((res) => res, handleResponseError);
