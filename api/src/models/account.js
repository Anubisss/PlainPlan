'use strict'

const db = require('../db')

function DoesRegistrationRequestExist(email) {
  return db.Conn.query('SELECT 1 FROM `registration_requests` WHERE `email` = ?', email)
}

function CreateRegistrationRequest(params) {
  return db.Conn.query('INSERT INTO `registration_requests` SET ?', params)
}

function GetRegistrationRequest(uuid) {
  return db.Conn.query('SELECT `email` FROM `registration_requests` WHERE `uuid` = ?', uuid)
}

function DeleteRegistrationRequest(uuid) {
  return db.Conn.query('DELETE FROM `registration_requests` WHERE `uuid` = ?', uuid)
}

function DoesAccountExist(email) {
  return db.Conn.query('SELECT 1 FROM `accounts` WHERE `email` = ?', email)
}

function CreateAccount(params) {
  return db.Conn.query('INSERT INTO `accounts` SET ?', params)
}

function GetPasswordReset(email, uuid) {
  if (email) {
    return db.Conn.query('SELECT `uuid` FROM `password_resets` WHERE `email` = ?', email)
  } else {
    return db.Conn.query('SELECT `email` FROM `password_resets` WHERE `uuid` = ?', uuid)
  }
}

function GetAccount(email) {
  return db.Conn.query('SELECT `password`, `name`, `location`, `website`, `created` FROM `accounts` WHERE `email` = ?', email)
}

function CreatePasswordReset(params) {
  return db.Conn.query('INSERT INTO `password_resets` SET ?', params)
}

function UpdatePasswordResetCreated(uuid) {
  return db.Conn.query('UPDATE `password_resets` SET `created` = CURRENT_TIMESTAMP WHERE `uuid` = ?', uuid)
}

function UpdateAccountPassword(email, password) {
  return db.Conn.query('UPDATE `accounts` SET `password` = ? WHERE `email` = ?', [ password, email ])
}

function DeletePasswordReset(uuid) {
  return db.Conn.query('DELETE FROM `password_resets` WHERE `uuid` = ?', uuid)
}

function UpdateAccount(email, params) {
  return db.Conn.query('UPDATE `accounts` SET ? WHERE `email` = ?', [ params, email ])
}

module.exports = {
  DoesRegistrationRequestExist,
  CreateRegistrationRequest,
  GetRegistrationRequest,
  DeleteRegistrationRequest,
  DoesAccountExist,
  CreateAccount,
  GetPasswordReset,
  GetAccount,
  CreatePasswordReset,
  UpdatePasswordResetCreated,
  UpdateAccountPassword,
  DeletePasswordReset,
  UpdateAccount,
}
