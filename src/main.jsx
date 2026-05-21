import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import { store } from './store/Store';
import App from './App';
import ScrollToTop from './scrollToTop';
import Auth0ProviderWithNavigate from './shared/AuthProvider';

import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Router>
    <Provider store={store}>
      <Auth0ProviderWithNavigate>
        <ScrollToTop />
        <App />
      </Auth0ProviderWithNavigate>
    </Provider>
  </Router>,
);
