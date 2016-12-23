'use babel'

import _ from 'lodash'

const PREFIX = 'emp-frontend-devtool'

const dispatch = (name, target = 'atom-workspace') => {
  if (!name.includes(':')) {
    name = `${PREFIX}:${name}`
  }

  if (typeof target === 'string') {
    target = document.querySelector(target)
  }

  atom.commands.dispatch(target, name)
}

const add = (commands, target = 'atom-workspace') => {
  let _commands = {}

  _.each(commands, (action, name) => {
    _commands[`${PREFIX}:${name}`] = action
  })

  atom.commands.add(target, _commands)
}

export default { add, dispatch }
