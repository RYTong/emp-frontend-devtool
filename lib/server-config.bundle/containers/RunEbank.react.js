'use babel';

import React from 'react';
import { connect } from 'react-redux'
import { toggleEbank } from '../../actions'
import qrcodePanel from '../qrcode-panel'

let RunEbank = (props) => {
  if (!props.selectedEbank && !props.isRunning) {
    return null
  }

  let style = (facet) => {
    if (facet === 'name') {
      return props.isRunning
        ? 'inline-block highlight-success'
        : 'inline-block highlight'
    } else {
      return props.isRunning
        ? 'btn btn-error icon icon-playback-pause'
        : 'btn btn-success icon icon-playback-play'
    }
  }

  return (
    <div>
      <span className = { style('name') }>{ props.selectedEbank }</span>
      <button className = { style('action') }
              onClick = { () => props.toggleEbank(props.selectedEbank) }
      ></button>
      {
        props.isRunning &&
        <button className = 'btn btn-info icon icon-device-camera'
                onClick = { () => props.toggleQRPanel() }
        ></button>
      }
    </div>
  )
}

const mapStateToProps = (state, ownProps) => state

const mapDispatchToProps = (dispatch, ownProps) => ({
  toggleEbank: (selectedEbank) => {
    dispatch(toggleEbank(selectedEbank))
  },
  toggleQRPanel: () => {
    qrcodePanel.toggle()
  }
})

RunEbank = connect(
  mapStateToProps,
  mapDispatchToProps
)(RunEbank)

export default RunEbank
