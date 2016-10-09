'use babel';

import React from 'react';

export default class LogStatusBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="efd-client-log-status-bar"
           onClick={this.props.toggle}
      >LOG</div>
    );
  }
}
