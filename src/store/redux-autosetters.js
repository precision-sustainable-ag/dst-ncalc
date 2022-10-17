import {configureStore, createAction, createReducer} from '@reduxjs/toolkit';

export const set = {};
export const get = {};

export const createStore = (initialState, {afterChange={}, reducers={}}) => {
  const funcs = {};
  const methods = {};
  const allkeys = {};

  const processMethods = ((state, key) => {
    if (methods[key]) {
      for (let k in methods[key]) {
        let st = state;
        for (const key of k.split('.').slice(0, -1)) st = st[key];
        const l = k.includes('.') ? k.split('.').slice(-1)[0] : k;
        st[l] = methods[key][k](state);
        processMethods(state, k);
      }
    }
  });
      
  const builders = (builder) => {
    const recurse = (obj, set, get, parents = []) => {
      if (!obj) {   // TODO dst-econ
        console.log(set);
        return;
      }
      Object.keys(obj).forEach((key) => {
        const isArray = Array.isArray(obj[key]);
        const isObject = !isArray && obj[key] instanceof Object;
        const fullkey = parents.length ? parents.join('.') + '.' + key : key;
        allkeys[fullkey] = true;
  
        get[key] = (state) => {
          let st = state;
          for (const k of parents) st = st[k];

          if (!st) {
            alert('Unknown: ' + fullkey);
          }
          return st[key];
        }

        if (typeof obj[key] === 'function') {
          funcs[fullkey] = obj[key];
          const func = obj[key].toString();

          for (const key in allkeys) {
            if (func.match(new RegExp(`${key.replace(/[.$]/g, c => '\\' + c)}`))) {
              methods[key] = methods[key] || {};
              methods[key][fullkey] = funcs[fullkey];
            }
          }
  
          obj[key] = funcs[fullkey](initialState);
        }
  
        set[key] = createAction(fullkey);

        builder
          .addCase(set[key], (state, action) => {
            let st = state;
            for (const k of parents) st = st[k];

            if (isArray && Number.isFinite(action.payload.index)) {
              const {index, value} = action.payload;
              st[key][index] = value;
            } else {
              st[key] = action.payload;
            }
            
            if (afterChange[fullkey]) {
              const ac = afterChange[fullkey](state, action);
              if (ac) {
                ac.forEach(parm => afterChange[parm](state, action));
              }
            }

            // TODO:  Is the first of these needed?
              processMethods(state, key);
              processMethods(state, fullkey);

            if (afterChange[fullkey]) {
              const func = afterChange[fullkey].toString();
              for (const key in allkeys) {
                if (func.match(new RegExp(`${key.replace(/[.$]/g, c => '\\' + c)}`))) {
                  processMethods(state, key);
                }
              }
            }
          }
        );
  
        if (isObject) {
          recurse(obj[key], set[key], get[key], [...parents, key]);
        }
      });
    } // recurse
  
    for (const key in reducers) {
      const action = createAction(key);
      builder.addCase(action, reducers[key]);
    }

    builder.addCase(createAction('api'), (state, {payload}) => {
      fetch(payload.url)
        .then(response => response.json())
        .then(data => {
          if (typeof payload.callback === 'function') {
            payload.callback(data);
          // } else if (payload.callback in state) {  // state is no longer applicable here
          //   state[payload.callback] = data;
          } else {
            alert('Error: ' + JSON.stringify(payload, null, 2));
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });

    recurse(initialState, set, get);

    builder.addDefaultCase((state, action) => {
      if (action.type !== '@@INIT') {
        console.log('Unknown action: ' + JSON.stringify(action));
      }
    });
  } // builders

  const reducer = createReducer(initialState, builders);

  return configureStore({
    reducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
} // createStore
