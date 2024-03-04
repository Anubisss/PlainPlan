'use strict'

const _ = require('lodash')
const restifyErrors = require('restify-errors')
const emailParser = require('email-addresses')
const bcrypt = require('bcrypt')

const utils = require('../utils')
const auth = require('../auth')
const account = require('../models/account')

function PostLogin(req, res, next) {
  if (!_.isObject(req.body)) {
    return next(new restifyErrors.BadRequestError())
  }

  let { email, password } = req.body
  if (!email || !_.isString(email)) {
    return next(new utils.ValidationFailedError({ info: { email: 'The email address is required.' } }))
  }

  email = email.toLowerCase()
  if (!emailParser.parseOneAddress({ input: email, rejectTLD: true })) {
    return next(new utils.ValidationFailedError({ info: { email: 'Invalid email address.' } }))
  }

  if (!password || !_.isString(password)) {
    return next(new utils.ValidationFailedError({ info: { password: 'The password is required.' } }))
  }

  account.GetAccount(email)
  .then(data => {
    if (!data[0].length) {
      throw new Error('no account')
    }
    return bcrypt.compare(password, data[0][0].password.toString())
  })
  .then(passwordMatch => {
    if (!passwordMatch) {
      throw new Error('invalid password')
    }
    const payload = {
      email,
    }
    return auth.Sign(payload)
  })
  .then(token => {
    console.log('account logged in', email)
    auth.CreateCookie(res, token)
    res.send(201, { code: 'OK' })
    next()
  })
  .catch(err => {
    if (err.message === 'no account' || err.message === 'invalid password') {
      next(new restifyErrors.NotFoundError())
    } else {
      console.error('can\'t login', err)
      next(new restifyErrors.InternalServerError())
    }
  })
}

function PostLogout(req, res, next) {
  console.log('account logged out', req.user.email)
  auth.DeleteCookie(res)
  res.send(201, { code: 'OK' })
  next()
}

module.exports = {
  PostLogin,
  PostLogout,
}
