const uuidV4Regex = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/

function IsValidUuidV4(uuid) {
  if (uuid && uuid.match(uuidV4Regex)) {
    return true
  }
  return false
}

export { IsValidUuidV4 }
