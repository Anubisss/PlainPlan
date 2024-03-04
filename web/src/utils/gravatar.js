import md5 from 'md5'

const GRAVATAR_URL = 'https://www.gravatar.com/avatar/'

function CalcAvatarUrl(email, size = null) {
  return GRAVATAR_URL + md5(email.trim().toLowerCase()) + (size ? `?size=${ size }` : '')
}

export { CalcAvatarUrl }
