'use babel'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'

const render = (ReactClass, className = 'block') => {
  let container = document.createElement('div')
  container.classList.add(className)

  ReactDOM.render(
    <Provider store={store}>
      <ReactClass/>
    </Provider>,
    container
  )

  return container
}

export default render
