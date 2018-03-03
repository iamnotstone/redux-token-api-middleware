import {CALL_TOKEN_API} from 'redux-token-api-middleware'

const config = {
  refreshAction:() => ({
    [CALL_TOKEN_API]: {
      type: 'REFRESH_TOKEN',
      payload: {
        endpoint: 'http://localhost:3000/token',
        method: 'GET'
      }
    }
  }),
  refreshToken: true
}

export default config
