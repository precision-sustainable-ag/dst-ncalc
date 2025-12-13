const {
  VITE_API_AUTH0_DOMAIN,
  VITE_API_AUTH0_CLIENT_ID,
  VITE_API_AUTH0_AUDIENCE,
  VITE_API_USER_HISTORY_API_URL,
  VITE_API_USER_HISTORY_SCHEMA,
  VITE_MAPBOX_TOKEN,
  VITE_AZURE_SAS_TOKEN,
  VITE_STORAGE_ACCOUNT_NAME,
  VITE_CONTAINER_NAME
} = import.meta.env;

export const auth0Domain = VITE_API_AUTH0_DOMAIN;
export const auth0ClientId = VITE_API_AUTH0_CLIENT_ID;
export const auth0Audience = VITE_API_AUTH0_AUDIENCE;
export const userHistoryApiUrl = VITE_API_USER_HISTORY_API_URL;
export const userHistorySchema = VITE_API_USER_HISTORY_SCHEMA;
export const mapboxToken = VITE_MAPBOX_TOKEN;
export const azureSASToken = VITE_AZURE_SAS_TOKEN;
export const storageAccountName = VITE_STORAGE_ACCOUNT_NAME;
export const containerName = VITE_CONTAINER_NAME;
