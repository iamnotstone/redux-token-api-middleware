'use strict'
var passport = require('passport'),
  LocalStrategy = require('passport-local'),
  JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret'


var users = [
  {
    userId: 'iamnotstone',
    password: 'iamnotstone',
    name: '石头天工开物'
  }
]


module.exports = function(app){
  app.use(passport.initialize())
//  app.use(passport.session())
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'userId',
        passwordField: 'password',
        session: false
      },
      function(userId, password, done) {
        var user = users.find((e) => e.userId == userId)
        if(user && user.password == password)
          return done(null, user)
        else
          return done(null, false)
      })
  )

  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    var user = users.find((e) => e.userId == jwt_payload.userId)
    if(user)
      return done(null, user)
    else
      return done(null, false)

  }));


  return passport
}

