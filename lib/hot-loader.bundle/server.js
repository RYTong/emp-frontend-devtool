'use babel';

import net from 'net';
import path from 'path';

import su from '../server-util';
import emitter from '../server-config.bundle/config-emitter';
import config from '../server-config.bundle/config';
import * as watcher from './watcher';

let log = require('../log-prefix')('[hot-loader]');
let _server = null;
let _socks = {};

const GLOBALLUAPATH = 'public/www/resource_dev/common/lua';

export default {
  init() {
    su.bindStartAndStopListeners('loader', this, emitter);
  },

  start() {
    _server = net.createServer((sock) => {
      let key = `${sock.remoteAddress}#${sock.remotePort}`;

      log('client connected', key);

      _socks[key] = sock;

      sock.on('end', () => {
        log('client disconnected');
        delete _socks[key];
      });
    });
    _server.on('close', () => {
      _server = null;
      emitter.emit('status', 'loader', 'ready');
    });
    _server.on('error', (e) => {
      emitter.emit('status', 'loader', 'error');
      su.handleError('loader', e);
      _server.close();
    });
    _server.listen(7004, () => {
      let eff = path.join(config.simulator.project,
        'public/www/resource_dev/common/lua/eff.lua');
      watcher.watch(eff);
      emitter.emit('status', 'loader', 'running');
      log('server bound on tcp port #7004');
    });
  },

  stop() {
    watcher.close();
    Object.keys(_socks).forEach((key) => {
      _socks[key].end();
    });
    if (_server) {
      _server.close();
    }
  },

  notify(filename) {
    let keys = Object.keys(_socks);
    let data = {
      type: isGlobalFile(filename) ? 'gfc' : 'fc',
      payload: filename
    };

    log('notify', data, 'to', keys.length, 'clients');

    keys.forEach((key) => {
      _socks[key].write(pack(data));
    });
  }
}

let isGlobalFile = (filename) => {
  let predict = false;

  if (path.extname(filename) === '.lua') {
    if (config.simulator.project) {
      let _root = path.join(config.simulator.project, GLOBALLUAPATH);

      if (filename.startsWith(_root)) {
        predict = true
      }
    }
  }

  return predict;
}

let isglobalLuaRootPath = () => {
  if (config.simulator.project) {
    return path.join(config.simulator.project, GLOBALLUAPATH);
  } else {
    return null;
  }
}

let pack = (data) => {
  let message = JSON.stringify(data);

  return "#s#" + message + "#e#";
}
