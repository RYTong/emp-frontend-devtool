'use babel';

import React from 'react';

export default class LogStatusBar extends React.Component {
  constructor(props) {
    super(props);
    this.listen();
    this.state = { count: 0 };
  }

  listen() {
    this.props.emitter.on('change', (count) => {
      this.setState({ count: count });
    });
  }

  computeClassName() {
    if (this.state.count > 0) {
      return 'luapack-status-bar-visible';
    } else {
      return 'luapack-status-bar-invisible';
    }
  }

  render() {
    return (
      <div className={this.computeClassName()}>LP({this.state.count})</div>
    );
  }
}
