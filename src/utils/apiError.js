/* eslint-disable import/prefer-default-export */

import { set } from '../store/redux-autosetters';

/**
 * Dispatches an error modal with a formatted error message.
 *
 * Message priority:
 *  - `primaryMessage` - custom message
 *  - `error.response.data.message` / `error.response.data.error` - message returned by the API
 *  - `secondaryMessage` - fallback custom message
 *  - `error.message` - JavaScript error message
 *  - Generic fallback message
 */
export const handleError = (error, dispatch, primaryMessage = '', secondaryMessage = '') => {
  // Skip modal if auth redirect error
  if (error?.isAuthRedirect) return;
  dispatch(
    set.actionModal({
      open: true,
      type: 'error',
      title: 'Error',
      message:
        primaryMessage
        || error?.response?.data?.message
        || error?.response?.data?.error
        || secondaryMessage
        || error?.message
        || 'Something went wrong. Please try again later.',
    }),
  );
};
