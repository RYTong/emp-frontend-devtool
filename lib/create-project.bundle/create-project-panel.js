'use babel'

import React from 'react'
import { join, isAbsolute, basename } from 'path'
import { copy, existsSync, ensureFileSync } from 'fs-extra'

import render from '../react-render'

let item
let cpv
let toggle
const appSketch = join(__dirname, 'app.sketch')
const HOME = process.env.HOME || join(process.env.HOMEDRIVE, process.env.HOMEPATH)
const defaultState = {
  projectName: 'ebank-test',
  projectDir: join(HOME, 'workspace'),
  error: null
}

const initProjectWithSketch = (projectPath, callback) => {
  copy(appSketch, projectPath, err => {
    if (!err) {
      let app = basename(projectPath)
      ensureFileSync(join(projectPath, `${app}.app`))
    }
    callback(err)
  })
}

class CreateProjectView extends React.Component {
  constructor (props) {
    super(props)

    this.state = defaultState

    setInterval(this.validate.bind(this), 300)
  }

  validate (projectName = this.state.projectName,
            projectDir = this.state.projectDir) {
    if (!/^[\w-.#@]+$/.test(projectName)) {
      this.setState({error: 'Project name is invalid'})
      return
    }

    if (!isAbsolute(projectDir)) {
      this.setState({error: 'Project directory is invalid'})
      return
    }

    if (existsSync(join(projectDir, projectName))) {
      this.setState({error: 'Project path already exists'})
      return
    }

    this.setState({error: null})
  }

  render () {
    return (
      <div className='efd-create-project-view'>
        {this.state.error !== null &&
          <div className='text-error'>{this.state.error}</div>
        }
        <div className='inset-panel name'>
          <div className='text-subtle'>工程名称</div>
          <div className='panel-body'>
            <input className='input-text native-key-bindings'
              type='text'
              value={this.state.projectName}
              onChange={
                event => {
                  let projectName = event.target.value
                  this.setState({ projectName })
                }
              }
            />
          </div>
        </div>
        <div className='inset-panel directory'>
          <div className='text-subtle'>存放路径</div>
          <div className='panel-body'>
            <input className='input-text native-key-bindings'
              type='text'
              value={this.state.projectDir}
              onChange={
                event => {
                  let projectDir = event.target.value
                  this.setState({ projectDir })
                }
              }
            />
            <button className='btn'
              onClick={
                () => {
                  atom.pickFolder(paths => {
                    if (paths !== null) {
                      this.setState({projectDir: paths[0]})
                    }
                  })
                }
              }
            >浏览</button>
          </div>
        </div>
        <div className='action'>
          <button className='btn btn-error'
            onClick={() => cpv.hide()}
          >取消</button>
          {this.state.error === null &&
            <button className='btn btn-success'
              onClick={
                () => {
                  let projectPath = join(
                    this.state.projectDir,
                    this.state.projectName
                  )
                  initProjectWithSketch(
                    projectPath,
                    err => {
                      if (err) {
                        atom.notifications.addError(err)
                      } else {
                        cpv.hide()
                        atom.project.addPath(projectPath)
                      }
                    }
                  )
                  this.setState(defaultState)
                }
              }
            >确定</button>
          }
        </div>
      </div>
    )
  }
}

item = render(CreateProjectView, 'efd-create-project-view-container')
cpv = atom.workspace.addModalPanel({ visible: false, item })

toggle = () => {
  cpv.isVisible()
    ? cpv.hide()
    : cpv.show()
}

export default { toggle }
