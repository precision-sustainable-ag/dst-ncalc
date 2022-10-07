import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {store} from './store/Store';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

// breaks Map:
/*
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
*/

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
