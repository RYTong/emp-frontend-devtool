'use babel';

import $ from 'jquery';
import React from 'react';
import config from './config';
import emitter from './config-emitter';


export default class ConfigView extends React.Component {
  constructor(props) {
   super(props);

   this.state = {}
  }

  render() {
    return (
      <atom-panel className='modal'>
        <div>
          <img src="/Users/lujingbo/src/atomwork/emp-frontend-devtool/lib/server-config.bundle/test.jpg"></img>
        </div>
      </atom-panel>
    )
  }
}
