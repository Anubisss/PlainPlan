'use strict'

const restifyErrors = require('restify-errors')

const uuidV4Regex = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/

function IsValidUuidV4(uuid) {
  if (uuid && uuid.match(uuidV4Regex)) {
    return true
  }
  return false
}

const ValidationFailedError = restifyErrors.makeConstructor('ValidationFailedError', {
  statusCode: 400,
  toJSON: function() {
    return {
      code: this.code,
      fieldMessages: this.jse_info,
    }
  }
})

module.exports = {
  IsValidUuidV4,
  ValidationFailedError,
}
