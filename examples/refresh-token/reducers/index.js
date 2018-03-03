import * as types from '../actions/actionTypes'

const reducer = function(state = {}, action){
  switch(action.type){
    case types.LOGIN_USER_SUCCESS:
      return Object.assign({}, state, {
        isAuth: true,
        userInfo: action.userInfo
      })
    case types.LOGOUT_USER:
      return Object.assign({}, state, {
        isAuth: false,
        userInfo: {}
      })
    case types.BASIC_GET_ACTION_COMPLETED:
      return Object.assign({}, state, {
        testResult: 'success'
      })
    case types.BASIC_GET_ACTION_FAILED:
      return Object.assign({}, state, {
        testResult: 'failed',
      })
    default:
      return state
  }
  
}

export default reducer
