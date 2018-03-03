/*eslint-disable no-console, no-var */
var express = require('express')
var rewrite = require('express-urlrewrite')
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var WebpackConfig = require('./webpack.config')
var bodyParser = require('body-parser')
var app = express()
var jwt = require('jsonwebtoken')


app.use(webpackDevMiddleware(webpack(WebpackConfig), {
  publicPath: '/__build__/',
  stats: {
    colors: true
  }
}))

var fs = require('fs')
var path = require('path')

fs.readdirSync(__dirname).forEach(function (file) {
  if (fs.statSync(path.join(__dirname, file)).isDirectory())
    app.use(rewrite('/' + file + '/*', '/' + file + '/index.html'))
})


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(__dirname))


var passport = require('./configPassport')(app)
app.get('/login', passport.authenticate('local', 
  {failureRedirect: '/', session: false}),function(req, res){
  var userInfo = Object.assign({}, req.user, {password: undefined})
  var token = jwt.sign(userInfo, 'secret', {expiresIn: 60})
  res.json({
    result: 'success',
    token: token
  })
})

app.get('/basic', passport.authenticate('jwt', {session: false}), function(req, res){
  if(req.user)
    res.json({
      result: 'success'
    })
  else
    res.json({
      result: 'failed'
    })
})


app.get('/token', passport.authenticate('jwt', {session: false}), function(req, res){
  if(req.user){
    var userInfo = Object.assign({}, req.user, {password: undefined})
    var token = jwt.sign(userInfo, 'secret', {expiresIn: 60})
    res.json({
      result: 'success',
      token: token
    })
  }
  else
    res.status(401).json({
      result: 'failed'
    })
})

app.listen(3000, function () {
  console.log('Server listening on http://localhost:3000, Ctrl+C to stop')
})
