'use babel'

import { basename } from 'path'

export default function (prefix) {
  return (...args) => {
    let callat = new Error().stack.split('\n')[2]
    console.info(prefix, basename(callat), ...args)
  }
}
