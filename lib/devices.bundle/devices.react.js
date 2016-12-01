'use babel'

import React from 'react'
import { connect } from 'react-redux'

import store from '../store'

class DevicesView extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className = 'efd-devices'>
        <div className = 'efd-devices-item'>
          text
        </div>
      </div>
    )
  }
}

export default DevicesView
