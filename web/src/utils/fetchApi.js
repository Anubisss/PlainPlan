import Config from '../config'

function basicFetch(method, apiPath, signal, body) {
  return new Promise((resolve, reject) => {
    let statusCode = 0
    fetch(Config.REST_API_URL + apiPath, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include', // TODO: use 'same-origin' in production
      body,
      signal,
    })
    .then(res => {
      statusCode = res.status
      return res.json()
    })
    .then(res => {
      resolve({ statusCode, body: res })
    })
    .catch(err => {
      reject(err)
    })
  })
}

function Get(apiPath, signal) {
  return basicFetch('GET', apiPath, signal)
}

function Post(apiPath, signal, body) {
  return basicFetch('POST', apiPath, signal, body)
}

function Put(apiPath, signal, body) {
  return basicFetch('PUT', apiPath, signal, body)
}

function Patch(apiPath, signal, body) {
  return basicFetch('PATCH', apiPath, signal, body)
}

function GetErrorMessage(statusCode, bodyCode) {
  switch (statusCode) {
    case 200:
    case 201:
    case 404:
      return ''
    case 400:
      if (bodyCode === 'ValidationFailed') {
        return ''
      }
      return 'Unexpected error occurred. Please refresh the page and try again.'
    case 500:
      return 'Unexpected server error occurred. Please try again.'
    default:
      return 'Unexpected error occurred. Please refresh the page and try again.'
  }
}

function GetFieldErrorMessages(statusCode, body) {
  if (statusCode === 400 && body.code === 'ValidationFailed') {
    return body.fieldMessages
  }
  return {}
}

export {
  Get,
  Post,
  Put,
  Patch,
  GetErrorMessage,
  GetFieldErrorMessages,
}
