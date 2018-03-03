import React from 'react'
import PropTypes from 'prop-types'

const hrStyle = {
  margin: '2px 0px 0px 0px',
  border: '0px'
}

const labelStyle = {
  width : '100%',
  display: 'block',
  height: '1.5rem',
  textAlign: 'right',
  lineHeight: '1.5rem',
  marginTop: '5px'
}
const inputStyle = {
  marginLeft: 'auto',
  marginRight: '0px',
  float: 'right',
  marginTop: 'auto',
  marginBottom: 'auto'
} 

class LoginForm extends React.Component{
  static propTypes : {
    onLogin: PropTypes.func.isRequired
  }

  constructor(props){
    super(props)
    this.state = {
      userId: 'iamnotstone',
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
    return <div
      style = {{
        width: '260px',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: 'lightblue',
        padding: '10px 5px 10px 5px',
        position: 'relative',
        top: '100px'
      }}
    >
      <form onSubmit={this.handleSubmit}
        style = {{
          width: '100%',
        }}
      >
        <label
          style = {labelStyle}
        >
          UserId:
          <input
            style = {inputStyle}
            type="text" value={this.state.userId} onChange={this.idChange} />
        </label>
        <hr style = {hrStyle}/>
        <label
          style = {labelStyle}
        >
          Password:
          <input style = {inputStyle} type="password" value={this.state.password} onChange={this.passwordChange}/>
        </label>
        <hr style = {hrStyle}/>
        <div
          style = {{
            height: '1.5rem'
          }}
        >
          <input style = {inputStyle} type="submit" value="Login" />
        </div>
      </form>
    </div>

  }
}

export default LoginForm
