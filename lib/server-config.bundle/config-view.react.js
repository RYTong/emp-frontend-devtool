'use babel';

import $ from 'jquery';
import React from 'react';
import config from './config';
import emitter from './config-emitter';


export default class ConfigView extends React.Component {
  constructor(props) {
   super(props);

   this.state = this.getStateFromConfig();
  }

  getStateFromConfig() {
    return {
     loaderPort: config.loader.port,
     loggerPort: config.logger.port,
     simulatorPort: config.simulator.port,
     simulatorProject: config.simulator.project
    }
  }

  close() {
    atom.workspace.getModalPanels().forEach((panel) => {
      panel.hide();
    });
  }

  handleToggle(server) {
    if (emitter.status[server] === 'running') {
      emitter.emit('stop', server);
    } else {
      emitter.emit('start', server);
    }
  }

  handleChange(event, server, key) {
    config[server][key] = event.target.value.trim();
    this.setState(this.getStateFromConfig());
  }

  defaultChecked(server) {
    return emitter.status[server] === 'running';
  }

  componentDidMount() {
    emitter.on('status', (server, status) => {
      let node = $(this.refs.root).find('.' + server + ' input').get(0);

      if (status === 'running') {
        node.checked = true;
      } else {
        node.checked = false;
      }
    });
  }

  render() {
    return (
      <div className="efd-config-view" ref="root">
        <div className="inset-panel loader">
          <div className="panel-heading">
            <span className="inline-block highlight">热加载</span>
            <div className="onoff">
              <label className='input-label'>
                OFF&nbsp;
                <input className='input-toggle'
                       type='checkbox'
                       defaultChecked={this.defaultChecked('loader')}
                       onClick={()=>{this.handleToggle('loader')}}/>
                ON
              </label>
            </div>
          </div>
          <div className="panel-body padded">
            <div className="config-item">
              <label>端口:</label>
              <div className="config-item-value">
                <input className='input-text'
                       type='text'
                       onChange={(e)=>this.handleChange(e,'loader','port')}
                       value={this.state.loaderPort}/>
              </div>
            </div>
          </div>
        </div>
        <div className="inset-panel logger">
          <div className="panel-heading">
            <span className="inline-block highlight">客户端日志</span>
            <div className="onoff">
              <label className='input-label'>
                OFF&nbsp;
                <input className='input-toggle'
                       type='checkbox'
                       defaultChecked={this.defaultChecked('logger')}
                       onClick={()=>{this.handleToggle('logger')}}/>
                ON
              </label>
            </div>
          </div>
          <div className="panel-body padded">
            <div className="config-item">
              <label>端口:</label>
              <div className="config-item-value">
                <input className='input-text'
                       type='text'
                       onChange={(e)=>this.handleChange(e,'logger','port')}
                       value={this.state.loggerPort}/>
              </div>
            </div>
          </div>
        </div>
        <div className="inset-panel simulator">
          <div className="panel-heading">
            <span className="inline-block highlight">静态资源</span>
            <div className="onoff">
              <label className='input-label'>
                OFF&nbsp;
                <input className='input-toggle'
                       type='checkbox'
                       defaultChecked={this.defaultChecked('simulator')}
                       onClick={()=>{this.handleToggle('simulator')}}/>
                ON
              </label>
            </div>
          </div>
          <div className="panel-body padded">
            <div className="config-item">
              <div className="config-item-key">
                <label>端口:</label>
              </div>
              <div className="config-item-value">
                <input className='input-text'
                       type='text'
                       onChange={(e)=>this.handleChange(e,'simulator','port')}
                       value={this.state.simulatorPort}/>
              </div>
            </div>
            <div className="config-item">
              <div className="config-item-key">
                <label>EBANK工程:</label>
              </div>
              <div className="config-item-value">
                <input className='input-text'
                       type='text'
                       onChange={(e)=>this.handleChange(e,'simulator','project')}
                       value={this.state.simulatorProject}/>
              </div>
            </div>
          </div>
        </div>
        <div className="block actions">
          <button className="btn" onClick={this.close}>关闭</button>
        </div>
      </div>
    )
  }
}
