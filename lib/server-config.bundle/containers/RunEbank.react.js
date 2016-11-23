'use babel';

import React from 'react';
import { connect } from 'react-redux'
import { toggleEbank } from '../../actions'

let RunEbank = ({ isRunning, selectedEbank, onClick }) => {
  if (!selectedEbank && !isRunning) {
    return null
  }

  let style = (facet) => {
    if (facet === 'name') {
      return isRunning
        ? 'inline-block text-success'
        : 'inline-block highlight'
    } else {
      return isRunning
        ? 'btn btn-error btn-sm icon icon-playback-pause'
        : 'btn btn-success btn-sm icon icon-playback-play'
    }
  }

  return (
    <div>
      <span className = { style('name') }>{ selectedEbank }</span>
      <button className = { style('action') }
              onClick = { () => onClick(selectedEbank) }
      ></button>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => state

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: (selectedEbank) => {
    dispatch(toggleEbank(selectedEbank))
  }
})

RunEbank = connect(
  mapStateToProps,
  mapDispatchToProps
)(RunEbank)

export default RunEbank
