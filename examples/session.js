var exSession = require('express-session')
  config = require('config-lite')(__dirname)
  connectMongo = require('connect-mongo')


const MongoStore = connectMongo(exSession);
module.exports = function(){
  return exSession({
	  name: config.session.name,
		secret: config.session.secret,
		resave: true,
		saveUninitialized: false,
		cookie: config.session.cookie,
		store: new MongoStore({
	  url: config.url
	  })
  })
}
