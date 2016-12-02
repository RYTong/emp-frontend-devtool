'use babel'

import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

import store from '../store'

class DevicesView extends React.Component {
  constructor(props) {
    super(props)

    store.subscribe(() => {
      let newDevices = store.getState().devices
      if (!_.isEqual(this.state, newDevices)) {
        this.setState({ devices: newDevices })
      }
    })

    this.state = { devices: store.getState().devices }
  }

  render() {
    return (
      <div className = "efd-devices">
        {
          _.map(this.state.devices, (device) => {
            return (
              <div className = "efd-device-item">
                <div className = "device-item-phone">
                  <i className = "mdi mdi-cellphone-iphone"></i>
                </div>
                <div className = "device-item-services">
                  <i className = "mdi mdi-console"></i>
                  <i className = "mdi mdi-bug"></i>
                  <i className = "mdi mdi-refresh"></i>
                </div>
                <div className = "device-item-content">
                  <div className = "device-item-info">
                    { device.deviceInfo }
                  </div>
                  <div className = "device-item-info">
                    { device.token }
                  </div>
                  <div className = "device-item-info">
                    { device.productVersion } / { device.version }
                  </div>
                  <div className = "device-item-info">
                    { device._ip }
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default DevicesView
