'use babel'

let IPRE = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/

const parse = (str) => {
  let ip
  let result = str.match(IPRE)

  if (result) {
    [ip] = result
  }

  return ip
}

export default parse
