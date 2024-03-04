'use strict'

const connectionStringParser = require('connection-string')
const mysql = require('mysql2/promise')

const config = require('./config')

function ConnectToDatabase() {
  const mysqlConnectionString = new connectionStringParser(config.MYSQL_URI)
  return mysql.createConnection({
    host: mysqlConnectionString.host,
    user: mysqlConnectionString.user,
    password: mysqlConnectionString.password,
    database: mysqlConnectionString.segments[0],
  })
}

module.exports = {
  ConnectToDatabase,
  Conn: null,
}
