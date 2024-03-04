'use strict'

const _ = require('lodash')
const restifyErrors = require('restify-errors')
const emailParser = require('email-addresses')
const uuidGenerator = require('uuid/v4')
const bcrypt = require('bcrypt')

const config = require('../config')
const db = require('../db')
const account = require('../models/account')
const emailSender = require('../email/sender')
const utils = require('../utils')

const EMAIL_LENGTH_MAX = 64
const NAME_LENGTH_MIN = 2
const NAME_LENGTH_MAX = 32
const PASSWORD_LENGTH_MIN = 8
const PASSWORD_LENGTH_MAX = 16
const LOCATION_LENGTH_MAX = 32
const WEBSITE_LENGTH_MAX = 64

const PASSWORD_BCRYPT_ROUNDS = 13

function PostRegistrationRequest(req, res, next) {
  if (!_.isObject(req.body)) {
    return next(new restifyErrors.BadRequestError())
  }

  let { email } = req.body
  if (!email || !_.isString(email)) {
    return next(new utils.ValidationFailedError({ info: { email: 'The email address is required.' } }))
  }

  email = email.trim().toLowerCase()
  if (!emailParser.parseOneAddress({ input: email, rejectTLD: true })) {
    return next(new utils.ValidationFailedError({ info: { email: 'Invalid email address.' } }))
  }
  if (email.length > EMAIL_LENGTH_MAX) {
    return next(new utils.ValidationFailedError({ info: { email: 'The email address is too long.' } }))
  }

  const uuid = uuidGenerator()
  account.DoesAccountExist(email)
  .then(data => {
    if (data[0].length) {
      throw new Error('account exists')
    }
    return account.DoesRegistrationRequestExist(email)
  })
  .then(data => {
    if (data[0].length) {
      throw new Error('registration request exists')
    }
  })
  .then(() => db.Conn.beginTransaction())
  .then(() => {
    return account.CreateRegistrationRequest({
      email,
      uuid,
    })
  })
  .then(() => {
    return emailSender.SendEmail('REGISTRATION_REQUEST', 'Registration', email, {
      finishRegistrationUrl: `${ config.WEB_APP_URL }finish-registration/${ uuid }`,
    })
  })
  .then(() => db.Conn.commit())
  .then(() => {
    console.log('account registration request is created', email)
    res.send(201, { code: 'Created' })
    next()
  })
  .catch(err => {
    if (err.message === 'registration request exists') {
      next(new utils.ValidationFailedError({ info: { email: 'We already sent an activation message to this email address. Please check your inbox.' } }))
    }
    else if (err.message === 'account exists') {
      next(new utils.ValidationFailedError({ info: { email: 'This email address is already registered by an account.' } }))
    } else {
      console.error('can\'t create account registration request', err)
      next(new restifyErrors.InternalServerError())
      return db.Conn.rollback()
    }
  })
  .catch(err => {
    console.error('DB rollback error', err)
  })
}

function GetRegistrationRequest(req, res, next) {
  const { uuid } = req.params
  if (!utils.IsValidUuidV4(uuid)) {
    return next(new restifyErrors.NotFoundError())
  }

  account.GetRegistrationRequest(uuid)
  .then(data => {
    if (!data[0].length) {
      next(new restifyErrors.NotFoundError())
    } else {
      res.send(200, {
        code: 'OK',
        data: data[0][0],
      })
      next()
    }
  })
  .catch(err => {
    console.error('can\'t get the registration request', err)
    next(new restifyErrors.InternalServerError())
  })
}

function PostAccount(req, res, next) {
  if (!_.isObject(req.body)) {
    return next(new restifyErrors.BadRequestError())
  }

  const { uuid, name, password, passwordAgain } = req.body

  if (!_.isString(uuid) || !utils.IsValidUuidV4(uuid)) {
    return next(new utils.ValidationFailedError({ info: { uuid: 'invalid' } }))
  }

  if (!name || !_.isString(name)) {
    return next(new utils.ValidationFailedError({ info: { name: 'The name is required.' } }))
  }
  if (name.length < NAME_LENGTH_MIN || name.length > NAME_LENGTH_MAX) {
    return next(new utils.ValidationFailedError({ info: { name: `The name must be between ${ NAME_LENGTH_MIN } and ${ NAME_LENGTH_MAX } characters.` } }))
  }

  if (!password || !_.isString(password)) {
    return next(new utils.ValidationFailedError({ info: { password: 'The password is required.' } }))
  }
  if (password.length < PASSWORD_LENGTH_MIN || password.length > PASSWORD_LENGTH_MAX) {
    return next(new utils.ValidationFailedError({ info: { password: `The password must be between ${ PASSWORD_LENGTH_MIN } and ${ PASSWORD_LENGTH_MAX } characters.` } }))
  }
  if (!password.match(/[a-zA-Z]+/) || !password.match(/[0-9]+/) ) {
    return next(new utils.ValidationFailedError({ info: { password: 'The password must contain an English letter (a-z) and an Arabic number (0-9).' } }))
  }

  if (passwordAgain !== password) {
    return next(new utils.ValidationFailedError({ info: { 'password-again': 'Passwords must match.' } }))
  }

  let email, passwordHash
  account.GetRegistrationRequest(uuid)
  .then(data => {
    if (!data[0].length) {
      throw new Error('invalid UUID')
    }
    email = data[0][0].email
  })
  .then(() => {
    return bcrypt.hash(password, PASSWORD_BCRYPT_ROUNDS)
  })
  .then(hash => passwordHash = hash)
  .then(() => db.Conn.beginTransaction())
  .then(() => {
    return account.CreateAccount({
      email,
      name,
      password: passwordHash,
    })
  })
  .then(() => account.DeleteRegistrationRequest(uuid))
  .then(() => db.Conn.commit())
  .then(() => {
    console.log('account is created', email)
    res.send(201, { code: 'OK' })
    next()
  })
  .catch(err => {
    if (err.message === 'invalid UUID') {
      next(new utils.ValidationFailedError({ info: { uuid: 'invalid' } }))
    } else {
      console.error('can\'t create account', err)
      next(new restifyErrors.InternalServerError())
      return db.Conn.rollback()
    }
  })
  .catch(err => {
    console.error('DB rollback error', err)
  })
}

function PostPasswordReset(req, res, next) {
  if (!_.isObject(req.body)) {
    return next(new restifyErrors.BadRequestError())
  }

  let { email } = req.body
  if (!email || !_.isString(email)) {
    return next(new utils.ValidationFailedError({ info: { email: 'The email address is required.' } }))
  }

  email = email.toLowerCase()
  if (!emailParser.parseOneAddress({ input: email, rejectTLD: true })) {
    return next(new utils.ValidationFailedError({ info: { email: 'Invalid email address.' } }))
  }
  if (email.length > EMAIL_LENGTH_MAX) {
    return next(new utils.ValidationFailedError({ info: { email: 'The email address is too long.' } }))
  }

  let uuid = null
  account.DoesAccountExist(email)
  .then(data => {
    if (!data[0].length) {
      throw new Error('account doesn\'t exist')
    }
    return account.GetPasswordReset(email)
  })
  .then(data => {
    if (data[0].length) {
      uuid = data[0][0].uuid
    }
  })
  .then(() => db.Conn.beginTransaction())
  .then(() => {
    // Already have a password reset so just extend its expiration.
    if (uuid) {
      return account.UpdatePasswordResetCreated(uuid)
    }
    uuid = uuidGenerator()
    const params = {
      email,
      uuid,
    }
    return account.CreatePasswordReset(params)
  })
  .then(() => {
    return emailSender.SendEmail('PASSWORD_RESET', 'Password reset', email, {
      changePasswordUrl: `${ config.WEB_APP_URL }change-password/${ uuid }`,
    })
  })
  .then(() => db.Conn.commit())
  .then(() => {
    console.log('password reset is created', email)
    res.send(201, { code: 'Created' })
    next()
  })
  .catch(err => {
    if (err.message === 'account doesn\'t exist') {
      next(new restifyErrors.NotFoundError())
    } else {
      console.error('can\'t create password reset', err)
      next(new restifyErrors.InternalServerError())
      return db.Conn.rollback()
    }
  })
  .catch(err => {
    console.error('DB rollback error', err)
  })
}

function GetPasswordReset(req, res, next) {
  const { uuid } = req.params
  if (!utils.IsValidUuidV4(uuid)) {
    return next(new restifyErrors.NotFoundError())
  }

  account.GetPasswordReset(null, uuid)
  .then(data => {
    if (!data[0].length) {
      throw new Error('invalid uuid')
    }
    return account.GetAccount(data[0][0].email)
  })
  .then(data => {
    if (!data[0].length) {
      throw new Error('no account')
    }
    res.send(200, {
      code: 'OK',
      data: data[0][0],
    })
    next()
  })
  .catch(err => {
    if (err.message === 'invalid uuid' || err.message === 'no account') {
      next(new restifyErrors.NotFoundError())
    } else {
      console.error('can\'t get the password reset', err)
      next(new restifyErrors.InternalServerError())
    }
  })
}

function PostFinishPasswordReset(req, res, next) {
  const { uuid } = req.params
  if (!utils.IsValidUuidV4(uuid)) {
    return next(new restifyErrors.NotFoundError())
  }

  if (!_.isObject(req.body)) {
    return next(new restifyErrors.BadRequestError())
  }

  const { password, passwordAgain } = req.body

  if (!password || !_.isString(password)) {
    return next(new utils.ValidationFailedError({ info: { password: 'The password is required.' } }))
  }
  if (password.length < PASSWORD_LENGTH_MIN || password.length > PASSWORD_LENGTH_MAX) {
    return next(new utils.ValidationFailedError({ info: { password: `The password must be between ${ PASSWORD_LENGTH_MIN } and ${ PASSWORD_LENGTH_MAX } characters.` } }))
  }
  if (!password.match(/[a-zA-Z]+/) || !password.match(/[0-9]+/) ) {
    return next(new utils.ValidationFailedError({ info: { password: 'The password must contain an English letter (a-z) and an Arabic number (0-9).' } }))
  }

  if (passwordAgain !== password) {
    return next(new utils.ValidationFailedError({ info: { 'password-again': 'Passwords must match.' } }))
  }

  let email, passwordHash
  account.GetPasswordReset(null, uuid)
  .then(data => {
    if (!data[0].length) {
      throw new Error('invalid uuid')
    }
    email = data[0][0].email
    return account.DoesAccountExist(email)
  })
  .then(data => {
    if (!data[0].length) {
      throw new Error('no account')
    }
  })
  .then(() => {
    return bcrypt.hash(password, PASSWORD_BCRYPT_ROUNDS)
  })
  .then(hash => passwordHash = hash)
  .then(() => db.Conn.beginTransaction())
  .then(() => account.UpdateAccountPassword(email, passwordHash))
  .then(() => account.DeletePasswordReset(uuid))
  .then(() => db.Conn.commit())
  .then(() => {
    console.log('password is changed', email)
    res.send(201, { code: 'OK' })
    next()
  })
  .catch(err => {
    if (err.message === 'invalid uuid' || err.message === 'no account') {
      next(new restifyErrors.NotFoundError())
    } else {
      console.error('can\'t finish password reset', err)
      next(new restifyErrors.InternalServerError())
      return db.Conn.rollback()
    }
  })
  .catch(err => {
    console.error('DB rollback error', err)
  })
}

function GetMe(req, res, next) {
  const { email } = req.user

  account.GetAccount(email)
  .then(data => {
    if (!data[0].length) {
      throw new Error('no account')
    }
    const { name, location, website, created } = data[0][0]
    return {
      email,
      name,
      location,
      website,
      created,
    }
  })
  .then(accountData => {
    res.send(200, {
      code: 'OK',
      data: accountData,
    })
    next()
  })
  .catch(err => {
    if (err.message === 'no account') {
      next(new restifyErrors.UnauthorizedError())
    } else {
      console.error('can\'t get account me', err)
      next(new restifyErrors.InternalServerError())
    }
  })
}

function PutMe(req, res, next) {
  if (!_.isObject(req.body)) {
    return next(new restifyErrors.BadRequestError())
  }

  const { name, location, website } = req.body

  if (!name || !_.isString(name)) {
    return next(new utils.ValidationFailedError({ info: { name: 'The name is required.' } }))
  }
  if (name.length < NAME_LENGTH_MIN || name.length > NAME_LENGTH_MAX) {
    return next(new utils.ValidationFailedError({ info: { name: `The name must be between ${ NAME_LENGTH_MIN } and ${ NAME_LENGTH_MAX } characters.` } }))
  }

  if (location) {
    if (!_.isString(location)) {
      return next(new utils.ValidationFailedError({ info: { location: 'The location must be a string type.' } }))
    }
    if (location.length > LOCATION_LENGTH_MAX) {
      return next(new utils.ValidationFailedError({ info: { location: `The location can't be longer than ${ LOCATION_LENGTH_MAX } characters.` } }))
    }
  }

  if (website) {
    if (!_.isString(website)) {
      return next(new utils.ValidationFailedError({ info: { website: 'The website must be a string type.' } }))
    }
    if (website.length > WEBSITE_LENGTH_MAX) {
      return next(new utils.ValidationFailedError({ info: { website: `The website can't be longer than ${ WEBSITE_LENGTH_MAX } characters.` } }))
    }
  }

  const { email } = req.user
  const accountUpdate = {
    name,
    location,
    website,
  }
  account.UpdateAccount(email, accountUpdate)
  .then(data => {
    if (!data[0].affectedRows) {
      throw new Error('no account')
    }
    console.log('account updated', email)
    res.send(200, { code: 'OK' })
    next()
  })
  .catch(err => {
    if (err.message === 'no account') {
      next(new restifyErrors.UnauthorizedError())
    } else {
      console.error('can\'t update account me', err)
      next(new restifyErrors.InternalServerError())
    }
  })
}

function PatchPassword(req, res, next) {
  if (!_.isObject(req.body)) {
    return next(new restifyErrors.BadRequestError())
  }

  const { passwordCurrent, passwordNew, passwordNewAgain } = req.body

  if (!passwordCurrent || !_.isString(passwordCurrent)) {
    return next(new utils.ValidationFailedError({ info: { 'current-password': 'The current password is required.' } }))
  }

  if (!passwordNew || !_.isString(passwordNew)) {
    return next(new utils.ValidationFailedError({ info: { 'new-password': 'The new password is required.' } }))
  }
  if (passwordNew.length < PASSWORD_LENGTH_MIN || passwordNew.length > PASSWORD_LENGTH_MAX) {
    return next(new utils.ValidationFailedError({ info: { 'new-password': `The new password must be between ${ PASSWORD_LENGTH_MIN } and ${ PASSWORD_LENGTH_MAX } characters.` } }))
  }
  if (!passwordNew.match(/[a-zA-Z]+/) || !passwordNew.match(/[0-9]+/) ) {
    return next(new utils.ValidationFailedError({ info: { 'new-password': 'The new password must contain an English letter (a-z) and an Arabic number (0-9).' } }))
  }

  if (passwordNewAgain !== passwordNew) {
    return next(new utils.ValidationFailedError({ info: { 'new-password-again': 'New passwords must match.' } }))
  }

  const { email } = req.user

  account.GetAccount(email)
  .then(data => {
    if (!data[0].length) {
      throw new Error('no account')
    }
    return bcrypt.compare(passwordCurrent, data[0][0].password.toString())
  })
  .then(passwordMatch => {
    if (!passwordMatch) {
      throw new Error('invalid password')
    }
    return bcrypt.hash(passwordNew, PASSWORD_BCRYPT_ROUNDS)
  })
  .then(passwordHash => account.UpdateAccountPassword(email, passwordHash))
  .then(() => {
    console.log('password is changed', email)
    res.send(200, { code: 'OK' })
    next()
  })
  .catch(err => {
    if (err.message === 'no account') {
      next(new restifyErrors.UnauthorizedError())
    }
    else if (err.message === 'invalid password') {
      next(new utils.ValidationFailedError({ info: { 'current-password': 'The current password is incorrect.' } }))
    } else {
      console.error('can\'t finish password reset', err)
      next(new restifyErrors.InternalServerError())
    }
  })
}

module.exports = {
  PostRegistrationRequest,
  GetRegistrationRequest,
  PostAccount,
  PostPasswordReset,
  GetPasswordReset,
  PostFinishPasswordReset,
  GetMe,
  PutMe,
  PatchPassword,
}
