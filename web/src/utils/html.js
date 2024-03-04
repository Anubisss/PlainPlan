function NormalizeId(string) {
  return string
    .replace(/[-.,_#&()'"+!%/=<>@;:*?]+/g, '')
    .replace(/ +/g, '-')
    .toLowerCase()
}

export { NormalizeId }
