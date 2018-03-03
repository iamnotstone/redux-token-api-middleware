import {fork, takeEvery, call, put, take, cancel} from 'redux-saga/effects'
import * as types from '../actions/actionTypes'
import {storeToken, TOKEN_STORAGE_KEY, 
  removeToken} from 'redux-token-api-middleware'
import jwt from 'jsonwebtoken' 
import {logoutUser, loginUserSuccess, asynLoginUser, loginUserFailed} from '../actions'


export function* loginComplete(){
  const action = yield take(types.LOGIN_USER_COMPLETED)
  if(action.payload.result === 'success'){
    let token = storeToken(TOKEN_STORAGE_KEY, action.payload)
    let tokenPayload = jwt.decode(token)
    let userInfo = {}
    userInfo.name = tokenPayload.name
    userInfo.userId = tokenPayload.userId
    yield put(loginUserSuccess(userInfo))
  }
  else{
    yield put(loginUserFailed('wrong userId or password'))
  }
}


export function* watchLogin(dispatch){
  while(true){
    const {userId, password} = yield take(types.LOGIN_USER)
    yield put(asynLoginUser(userId, password))
    const task = yield fork(loginComplete)
    const action = yield take([types.LOGOUT_USER, types.LOGIN_USER_FAILED])
    if (action.type === types.LOGOUT_USER)
      yield cancel(task)
    removeToken(TOKEN_STORAGE_KEY)
  }
}

function* apiFailed(action){
  if(action.payload.message === 'Unauthorized')
    yield put(logoutUser())
}

export function* watchApiFailed(){
  yield takeEvery(types.BASIC_GET_ACTION_FAILED, apiFailed)
}

export default function* rootSaga(dispatch){
  yield fork(watchLogin, dispatch)
  yield watchApiFailed()
}
