'use babel'

import { basename } from 'path'

export default function (prefix, type = 'info') {
  return (...args) => {
    let callat = new Error().stack.split('\n')[2]

    console[type](prefix, basename(callat), ...args)
  }
}
