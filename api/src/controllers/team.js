'use strict'

const _ = require('lodash')
const restifyErrors = require('restify-errors')

const config = require('../config')
const db = require('../db')
const utils = require('../utils')
const Team = require('../models/team')

const NAME_LENGTH_MIN = 2
const NAME_LENGTH_MAX = 32
const DESCRIPTION_LENGTH_MAX = 64

function GetTeams(req, res, next) {
  Team.GetTeams(req.user.email)
  .then(data => {
    res.send(200, {
      code: 'OK',
      data: data[0],
    })
  })
  .catch(err => {
    console.error('can\'t get teams', err)
    next(new restifyErrors.InternalServerError())
  })
}

async function GetTeam(req, res, next) {
  const { id } = req.params

  try {
    const team = await Team.GetTeamDetails(id)
    if (!team) {
      return next(new restifyErrors.NotFoundError())
    }

    team.owner = {
      email: team.ownerEmail,
      name: team.ownerName,
    }
    delete team.ownerEmail
    delete team.ownerName

    res.send(200, {
      code: 'ok',
      data: team,
    })
  } catch (err) {
    console.error('can\'t get team', err)
    next(new restifyErrors.InternalServerError())
  }
}

function PostTeam(req, res, next) {
  if (!_.isObject(req.body)) {
    return next(new restifyErrors.BadRequestError())
  }

  let { name } = req.body
  const { description } = req.body

  if (!name || !_.isString(name)) {
    return next(new utils.ValidationFailedError({ info: { name: 'The name is required.' } }))
  }
  if (name.length < NAME_LENGTH_MIN || name.length > NAME_LENGTH_MAX) {
    return next(new utils.ValidationFailedError({ info: { name: `The name must be between ${ NAME_LENGTH_MIN } and ${ NAME_LENGTH_MAX } characters.` } }))
  }

  if (description) {
    if (!_.isString(description)) {
      return next(new utils.ValidationFailedError({ info: { description: 'The description must be a string type.' } }))
    }
    if (description.length > DESCRIPTION_LENGTH_MAX) {
      return next(new utils.ValidationFailedError({ info: { description: `The description can't be longer than ${ DESCRIPTION_LENGTH_MAX } characters.` } }))
    }
  }

  name = name.trim()

  Team.DoesTeamExist(name)
  .then(data => {
    if (data[0].length) {
      throw new Error('team exists')
    }
    return Team.CreateTeam({
      owner: req.user.email,
      name,
      description: description ? description : '',
    })
  })
  .then(qres => {
    console.log('team is created', qres[0].insertId)
    res.send(201, { code: 'OK' })
    next()
  })
  .catch(err => {
    if (err.message === 'team exists') {
      next(new utils.ValidationFailedError({ info: { name: 'Team name is already taken.' } }))
    } else {
      console.error('can\'t create team', err)
      next(new restifyErrors.InternalServerError())
    }
  })
}

module.exports = {
  GetTeams,
  GetTeam,
  PostTeam,
}
