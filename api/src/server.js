'use strict'

const restify = require('restify')
const restifyCorsMiddleware = require('restify-cors-middleware')
const restifyCookies = require('restify-cookies')

const config = require('./config')
const db = require('./db')
const auth = require('./auth')

const controllerAccount = require('./controllers/account')
const controllerLogin = require('./controllers/login')
const controllerTeam = require('./controllers/team')

function startRestApiServer() {
  const server = restify.createServer()

  // TODO: don't use CORS in production
  const corsConfig = restifyCorsMiddleware({
    origins: [ /http:\/\/localhost:([\d]+)/, /http:\/\/192.168.1.100:([\d]+)/ ],
    credentials: true,
  })
  server.pre(corsConfig.preflight)
  server.use(corsConfig.actual)

  server.use(restify.plugins.jsonBodyParser())
  server.use(restifyCookies.parse)

  // TODO: account es registration request kulon resource es kulon model szerintem
  server.post('/accounts/registration-requests', controllerAccount.PostRegistrationRequest)
  server.get('/accounts/registration-requests/:uuid', controllerAccount.GetRegistrationRequest) // ez is /finish

  server.post('/accounts', controllerAccount.PostAccount)
  server.get('/accounts/me', [ auth.AuthHandler, controllerAccount.GetMe ])
  server.put('/accounts/me', [ auth.AuthHandler, controllerAccount.PutMe ])
  server.patch('/accounts/me/password', [ auth.AuthHandler, controllerAccount.PatchPassword ])

  server.post('/password-resets', controllerAccount.PostPasswordReset)
  server.get('/password-resets/:uuid', controllerAccount.GetPasswordReset)
  server.post('/password-resets/:uuid/finish', controllerAccount.PostFinishPasswordReset)

  server.post('/login', controllerLogin.PostLogin)
  server.post('/logout', [ auth.AuthHandler, controllerLogin.PostLogout ])

  server.get('/teams', [ auth.AuthHandler, controllerTeam.GetTeams ])
  server.get('/teams/:id', [ auth.AuthHandler, controllerTeam.GetTeam ])
  server.post('/teams', [ auth.AuthHandler, controllerTeam.PostTeam ])

  server.listen(config.PORT, () => {
    console.log('started the REST API server')
  })
}

function Start() {
  db.ConnectToDatabase()
  .then(conn => {
    console.log('connected to the DB')
    db.Conn = conn
    startRestApiServer()
  })
  .catch(err => {
    console.error('can\'t start', err)
  })
}

module.exports = {
  Start,
}
