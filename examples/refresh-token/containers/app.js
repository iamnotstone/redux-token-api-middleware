import React from 'react'
import {loginUser, logoutUser, apiTest} from '../actions'
import {connect} from 'react-redux'
import LoginForm from '../components/loginForm'
import UserInfoForm from '../components/userInfoForm'
import PropTypes from 'prop-types'

class AppComp extends React.Component{
  static propTypes : {
    isAuth: PropTypes.bool.isRequired,
    userInfo: PropTypes.object,
    onLogin: PropTypes.func.isRequired,
    testResult: PropTypes.string
  }

  defaultProps : {
    userInfo: {}
  }

  constructor(props){
    super(props)
    this.onTest = this.onTest.bind(this)
  }

  onTest(){
    this.props.onTest()
  }
  
  render(){
    return <div
      style = {{
        marginLeft: '5px'
      }}    
    >
      {this.props.isAuth ? 
        <UserInfoForm userInfo = {this.props.userInfo} onLogout = {this.props.onLogout} /> : 
        <LoginForm onLogin = {this.props.onLogin} />}
      <div
        style = {{
          marginTop: '10px',
          padding: '10px 0px 4px 0px'
        }}
      >
        <button onClick = {this.onTest}> Test Authenticate Api </button>
        <p> {this.props.testResult || 'Not test yet'} </p>
      </div>
    </div>
  }
}
const mapStateToProps = (state) => ({
  isAuth: state.isAuth,
  userInfo: state.userInfo,
  testResult: state.testResult
})

const mapDispatchToProps = (dispatch) => ({
  onLogin: (userId, password) => {
    dispatch(loginUser(userId, password))
    //dispatch(logoutUser()) //test for concurrence action 
  },
  onLogout: () => dispatch(logoutUser()),
  onTest: () => dispatch(apiTest())
})

const App = connect(mapStateToProps, mapDispatchToProps)(AppComp)

export default App
