'use strict'

const db = require('../db')

function DoesTeamExist(name) {
  return db.Conn.query('SELECT 1 FROM `teams` WHERE `name` = ?', name)
}

function GetTeams(owner) {
  return db.Conn.query('SELECT `id`, `name`, `description` FROM `teams` WHERE `owner` = ? ORDER BY `name` ASC', owner)
}

async function GetTeamDetails(id) {
  const [ [ res ] ] = await db.Conn.query(
    'SELECT `t`.`name`, `t`.`description`, `t`.`created`, ' +
    '`a`.`email` AS `ownerEmail`, `a`.`name` AS `ownerName` FROM `teams` `t` ' +
    'INNER JOIN `accounts` `a` ON `a`.`email` = `t`.`owner` ' +
    'WHERE `t`.`id` = ?',
    id
  )
  return res ? res : null
}

function CreateTeam(params) {
  return db.Conn.query('INSERT INTO `teams` SET ?', params)
}

module.exports = {
  DoesTeamExist,
  GetTeams,
  GetTeamDetails,
  CreateTeam,
}
