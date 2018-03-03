import 'babel-polyfill'
import React from 'react'
import {render} from 'react-dom'
import {createLogger} from 'redux-logger'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import {createTokenApiMiddleware, CALL_TOKEN_API} from 'redux-token-api-middleware'
import App from './containers/app'
import reducer from './reducers'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas'
import config from './tokenApiConfig'

const loggerMiddleware = createLogger()
const tokenApiMiddleware = createTokenApiMiddleware(config)
const sagaMiddleware = createSagaMiddleware()

const store = createStore(reducer, 
  {
    isAuth: false, 
    userInfo: {}
  }, 
  applyMiddleware(
    loggerMiddleware,
    tokenApiMiddleware,
    sagaMiddleware
))

sagaMiddleware.run(rootSaga, store.dispatch)

render(<Provider store = {store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

