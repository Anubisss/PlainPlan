'use strict'

const ejs = require('ejs')
const AWS = require('aws-sdk')

const config = require('../config')

function generateEmailBody(templateId, data) {
  return new Promise((resolve, reject) => {
    let templatePath = ''
    switch (templateId) {
      case 'REGISTRATION_REQUEST':
        templatePath = 'src/email/templates/registrationRequest.ejs'
        break
      case 'PASSWORD_RESET':
        templatePath = 'src/email/templates/passwordReset.ejs'
        break
    }
    if (!templatePath) {
      return reject(new Error(`invalid email template ID: ${ templateId }`))
    }

    ejs.renderFile(templatePath, data, {}, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

function sendEmailAwsSes(emailAddress, subject, body) {
  const params = {
    Destination: {
      ToAddresses: [ emailAddress ],
    },
    Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: `${ config.EMAIL_FROM_NAME } <${ config.EMAIL_FROM_ADDRESS }>`,
  }
  return new AWS.SES({ region: config.AWS_SES_REGION }).sendEmail(params).promise()
}

function SendEmail(templateId, subject, toAddress, dataParams) {
  return generateEmailBody(templateId, dataParams)
  .then(res => sendEmailAwsSes(toAddress, subject, res))
  .then(res => console.log('email sent', res.MessageId))
}

module.exports = {
  SendEmail,
}
