import React from 'react'

class UserInfoForm extends React.Component{
  static propTypes : {
    userInfo : PropTypes.object,
    onLogout: PropTypes.func
  }

  defaultProps : {
    userInfo: {
      userId: 'iamnotstone',
      name: '石头天工开物'
    }
  }

  constructor(props){
    super(props)
    this.onLogout = this.onLogout.bind(this)
  }

  onLogout(){
    this.props.onLogout()
  }

  render(){
    return <div>
      <table 
        style = {{ 
          boxSizing: 'border-box', 
          border: '0px', 
          paddingLeft: '8px', 
          paddingRight: '8px' 
        }} 
      > 
        <tbody> 
        <tr 
          style = {{ 
            border: '0px', 
            textAlign: 'left' 
          }} 
        > 
          <td>  
            userId:  
          </td> 
          <td 
            style = {{ 
              border: '0px', 
              textAlign: 'right' 
            }} 
          >  
            {this.props.userInfo.userId}  
          </td> 
        </tr> 
        <tr 
          style = {{ 
            border: '0px', 
            textAlign: 'left' 
          }} 
        > 
          <td>  
            name:  
          </td> 
          <td 
            style = {{ 
              border: '0px', 
              textAlign: 'right' 
            }} 
          >  
            {this.props.userInfo.name}  
          </td> 
        </tr> 
        </tbody> 
      </table> 
      <div>
        <button onClick = {this.onLogout}>Logout</button>
      </div> 
    </div>
  }
}

export default UserInfoForm
