'use strict'

const jsonwebtoken = require('jsonwebtoken')
const restifyErrors = require('restify-errors')

const config = require('./config')

const ACCESS_TOKEN_COOKIE_NAME = 'user'

function AuthHandler(req, res, next) {
  const userCookie = req.cookies[ACCESS_TOKEN_COOKIE_NAME]
  if (userCookie) {
    jsonwebtoken.verify(userCookie, config.JWT_SECRET, (err, payload) => {
      if (err) {
        next(new restifyErrors.UnauthorizedError())
      } else {
        req.user = { email: payload.email }
        next()
      }
    })
  } else {
    next(new restifyErrors.UnauthorizedError())
  }
}

function Sign(data) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.sign(data, config.JWT_SECRET, { expiresIn: config.ACCESS_TOKEN_EXPIRATION_IN_SECONDS }, (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(token)
      }
    })
  })
}

function CreateCookie(res, token) {
  res.setCookie(ACCESS_TOKEN_COOKIE_NAME, token, {
    maxAge: config.ACCESS_TOKEN_EXPIRATION_IN_SECONDS,
    httpOnly: true,
    // secure: true, TODO: in production
  })
}

function DeleteCookie(res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME)
}

module.exports = {
  AuthHandler,
  Sign,
  CreateCookie,
  DeleteCookie,
}
