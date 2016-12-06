'use babel'

IPRE = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/

const parse = (str) => {
  let result = null

  if (result = str.match(IPRE)) {
    [result] = result
  }

  return result
}

export default parse
