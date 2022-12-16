import { configureStore, createAction, createReducer } from '@reduxjs/toolkit';
import axios from 'axios';

export const set = {};
export const get = {};

export const createStore = (initialState, { afterChange = {}, reducers = {} }) => {
  const funcs = {};
  const methods = {};
  const allkeys = {};

  const processMethods = ((state, key) => {
    if (methods[key]) {
      // eslint-disable-next-line no-restricted-syntax
      const objTemp = methods[key];
      Object.keys(objTemp).forEach((k) => {
        let st = state;
        Object.keys(k.split('.').slice(0, -1)).forEach((keyVal) => {
          st = st[keyVal];
        });
        const l = k.includes('.') ? k.split('.').slice(-1)[0] : k;
        st[l] = methods[key][k](state);
        processMethods(state, k);
      });
    }
  });

  const builders = (builder) => {
    const recurse = (obj, setIn, getIn, parents = []) => {
      if (!obj) { // TODO dst-econ
        // console.log(set);
        return;
      }
      Object.keys(obj).forEach((key) => {
        const isArray = Array.isArray(obj[key]);
        const isObject = !isArray && obj[key] instanceof Object;
        const fullkey = parents.length ? `${parents.join('.')}.${key}` : key;
        allkeys[fullkey] = true;

        getIn[key] = (state) => {
          let st = state;

          Object.keys(parents).forEach((k) => {
            st = st[k];
          });

          if (!st) {
            alert(`Unknown: ${fullkey}`); // eslint-disable-line no-alert
          }
          return st[key];
        };

        if (typeof obj[key] === 'function') {
          funcs[fullkey] = obj[key];
          const func = obj[key].toString();

          Object.keys(allkeys).forEach((k) => {
            if (func.match(new RegExp(`${k.replace(/[.$]/g, (c) => `\\${c}`)}`))) {
              methods[k] = methods[k] || {};
              methods[k][fullkey] = funcs[fullkey];
            }
          });

          obj[key] = funcs[fullkey](initialState);
        }

        setIn[key] = createAction(fullkey);

        builder
          .addCase(setIn[key], (state, action) => {
            let st = state;
            for (const k of parents) st = st[k]; // eslint-disable-line no-restricted-syntax

            if (isArray && Number.isFinite(action.payload.index)) {
              const { index, value } = action.payload;
              st[key][index] = value;
            } else {
              st[key] = action.payload;
            }

            if (afterChange[fullkey]) {
              const ac = afterChange[fullkey](state, action);
              if (ac) {
                ac.forEach((parm) => afterChange[parm](state, action));
              }
            }

            processMethods(state, key);
            processMethods(state, fullkey);

            if (afterChange[fullkey]) {
              const func = afterChange[fullkey].toString();
              // eslint-disable-next-line no-restricted-syntax
              for (const keyval in allkeys) {
                if (func.match(new RegExp(`${keyval.replace(/[.$]/g, (c) => `\\${c}`)}`))) {
                  processMethods(state, keyval);
                }
              }
            }
          });

        if (isObject) {
          recurse(obj[key], setIn[key], getIn[key], [...parents, key]);
        }
      });
    }; // recurse

    Object.keys(reducers).forEach((key) => {
      const action = createAction(key);
      builder.addCase(action, reducers[key]);
    });

    builder.addCase(createAction('api'), (state, { payload }) => {
      const method = payload.options.method || 'get';

      axios[method](payload.url, payload.options)
        .then((data) => {
          if (typeof payload.callback === 'function') {
            payload.callback(data.data);
          } else {
            alert(`Error: ${JSON.stringify(payload, null, 2)}`); // eslint-disable-line no-alert
          }
        })
        .catch(() => {
          // console.log('api error: ', error);
        });
    });

    recurse(initialState, set, get);

    builder.addDefaultCase((state, action) => {
      if (action.type !== '@@INIT') {
        // console.log(`Unknown action: ${JSON.stringify(action)}`);
      }
    });
  }; // builders

  const reducer = createReducer(initialState, builders);

  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false,
    }),
  });
}; // createStore
