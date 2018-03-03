import {CALL_TOKEN_API} from 'redux-token-api-middleware'
import * as types from './actionTypes'

export const loginUserSuccess = (userInfo) => ({
  type: types.LOGIN_USER_SUCCESS,
  userInfo
})

export const apiTest = () => ({
  [CALL_TOKEN_API]: {
    type: 'BASIC_GET_ACTION',
    payload: {
      endpoint: 'http://localhost:3000/basic'
    }
  }
})


export const logoutUser = () => ({
  type: types.LOGOUT_USER
})

export const loginUser = (userId, password) => ({
  type: types.LOGIN_USER,
  userId,
  password
})

export const loginUserFailed = (msg) => ({
  type: types.LOGIN_USER_FAILED,
  msg
})

export const asynLoginUser = (userId, password) => {
  let endpoint = 'http://localhost:3000/login?userId=' + userId + '&password=' + password
  return {
    [CALL_TOKEN_API]: {
      type: types.LOGIN_USER,
      payload: {
        endpoint,
      },
      noRefresh: true
    } 
  }
}
//store.dispatch(apiTest())
