'use babel'

import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'

// export default function(ReactClass, props, className='block') {
export default function (ReactClass, ...args) {
  let element, container, props, className

  className = 'block'
  if (typeof (args[0]) === 'string') {
    className = args[0]
  } else {
    props = args[0]
    if (typeof (args[1]) === 'string') {
      className = args[0]
    }
  }

  element = React.createElement(ReactClass, props)
  container = document.createElement('div')

  $(container).addClass(className)
  ReactDOM.render(element, container)

  return container
}
