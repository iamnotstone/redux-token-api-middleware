import React from 'react'
import {render} from 'react-dom'
import {createLogger} from 'redux-logger'
import {createStore, applyMiddleware} from 'redux'
import {Provider, connect} from 'react-redux'
import {createTokenApiMiddleware, CALL_TOKEN_API} from 'redux-token-api-middleware'

const reducer = function(state, action){
  switch(action.type){
    default:
      return state
  }
}

const config = {
  refreshAction: {
    [CALL_TOKEN_API]: {
      type: 'REFRESH_TOKEN',
      payload: {
        endpoint: 'http://localhost:3000/token',
        method: 'GET'
      }
    }
  },
  refreshToken: true
}

const loggerMiddleware = createLogger()
const tokenApiMiddleware = createTokenApiMiddleware(config)


const store = createStore(reducer, {}, applyMiddleware(
  loggerMiddleware,
  tokenApiMiddleware
))

class AppComp extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      userId : 'iamnotstone',
      password: 'iamnotstone'
    }

    this.idChange = this.idChange.bind(this)
    this.passwordChange = this.passwordChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  idChange(event){
    this.setState({
      userId: event.target.value
    })
  }

  passwordChange(event){
    this.setState({
      password: event.target.value
    })
  }

  handleSubmit(event){
    event.preventDefault()
    this.props.onLogin(this.state.userId, this.state.password)
  }
  
  render(){
    return <div>
      <form onSubmit={this.handleSubmit}>
        <label>
          UserId:
          <input type="text" value={this.state.userId} onChange={this.idChange} />
        </label>
        <label>
          Password:
          <input type="text" value={this.state.password} onChange={this.passwordChange}/>
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  }
}
const mapDispatchToProps = (dispatch) => ({
  onLogin: (userId, password) => dispatch(loginUser(userId, password))
})

const App = connect(undefined, mapDispatchToProps)(AppComp)

render(<Provider store = {store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

const apiTest = () => ({
  [CALL_TOKEN_API]: {
    type: 'BASIC_GET_ACTION',
    payload: {
      endpoint: 'http://localhost:3000/basic'
    }
  }
})

const loginUser = (userId, password) => {
  let endpoint = 'http://localhost:3000/login?userId=' + userId + '&password=' + password
  return {
    [CALL_TOKEN_API]: {
      type: 'LOGIN_USER',
      payload: {
        endpoint,
      }
    } 
  }
}
//store.dispatch(apiTest())
