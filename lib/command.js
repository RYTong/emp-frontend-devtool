'use babel'

const command = (cmd, target='atom-workspace') => {
  if (!cmd.includes(':')) {
    cmd = `emp-frontend-devtool:${cmd}`
  }

  target = document.querySelector(target)
  atom.commands.dispatch(target, cmd)
}

export default command
