'use babel'

import _ from 'lodash'
import $ from 'jquery'
import React from 'react'
import { connect } from 'react-redux'
import { CompositeDisposable } from 'atom'

import store from '../store'

class DevicesView extends React.Component {
  constructor(props) {
    super(props)

    store.subscribe(() => {
      let newDevices = store.getState().devices
      if (!_.isEqual(this.state.devices, newDevices)) {
        this.setState({ devices: newDevices })
      }
    })

    this.subscriptions = new CompositeDisposable()
    this.state = { devices: store.getState().devices }
  }

  tooltip() {
    return {
      title: function() {
        let msg = ''

        if ($(this).hasClass('logger')) {
          msg += '日志服务'
        } else if ($(this).hasClass('hot-loader')) {
          msg += '热加载服务'
        } else if ($(this).hasClass('debugger')) {
          msg += '调试服务'
        } else {
          msg += '未知服务'
        }

        if ($(this).hasClass('service-enable')) {
          msg += '可用'
        } else if ($(this).hasClass('service-disable')) {
          msg += '不可用'
        } else {
          msg += '不清楚能不能用'
        }

        return msg
      }
    }
  }

  srv2cn(service, device) {
    let className = service + ' mid'

    if (service === 'logger') {
      className += ' mdi mdi-console'
    } else if (service === 'hot-loader') {
      className += ' mdi mdi-refresh'
    } else if (service === 'debugger') {
      className += ' mdi mdi-bug'
    }

    if (device.clientPorts[service]) {
      className += ' service-enable'
    } else {
      className += ' service-disable'
    }

    return className
  }

  render() {
    return (
      <div className = "efd-devices"
           ref = {
             node => {
               let self = this

               this.subscriptions.dispose()
               $(node).find('.device-item-services i').each(function() {
                 self.subscriptions.add(
                   atom.tooltips.add($(this).get(0), self.tooltip())
                 )
               })
             }
           }
      >
        {
          _.map(this.state.devices, device => {
            return (
              <div className = "efd-device-item">
                <div className = "device-item-phone">
                  <i className = "mdi mdi-cellphone-iphone"></i>
                </div>
                <div className = "device-item-services">
                  <i className = { this.srv2cn('logger', device) }></i>
                  <i className = { this.srv2cn('debugger', device) }></i>
                  <i className = { this.srv2cn('hot-loader', device) }></i>
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
