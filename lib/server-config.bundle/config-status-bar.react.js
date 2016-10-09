'use babel';

import React from 'react';

import emitter from './config-emitter';

export default class ConfigStatusBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.listen();
  }

  listen() {
    let state = {
      loader: 'efd-server-ready',
      logger: 'efd-server-ready',
      simulator: 'efd-server-ready'
    };

    for (let s in emitter.status) {
      state[s] = 'efd-server-' + emitter.status[s];
    }

    // delete emitter.status;
    // emitter.removeAllListeners('status');
    emitter.on('status', (server, status) => {
      this.setState({
        [server]: 'efd-server-' + status
      });
    });

    return state;
  }

  render() {
    return (
      <div className="efd-config-status-bar" onClick={this.props.click}>
        <span className={this.state.loader}>L</span>
        <span className={this.state.logger}>L</span>
        <span className={this.state.simulator}>S</span>
      </div>
    );
  }
}
