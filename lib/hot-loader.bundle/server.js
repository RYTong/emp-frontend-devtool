'use babel';

import net from 'net';
import su from '../server-util';
import emitter from '../server-config.bundle/config-emitter';

let log = require('../log-prefix')('[hot-loader]');
let _server = null;
let _socks = {};

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
      su.handleError(e);
      _server.close();
    });
    _server.listen(7004, () => {
      emitter.emit('status', 'loader', 'running');
      log('server bound on tcp port #7004');
    });
  },

  stop() {
    Object.keys(_socks).forEach((key) => {
      _socks[key].end();
    });
    if (_server) {
      _server.close();
    }
  },

  notify(filename) {
    log('notify', filename);
    Object.keys(_socks).forEach((key) => {
      _socks[key].write(pack({
        type: "fc",
        payload: filename
      }));
    });
  }
}

let pack = (data) => {
  let message = JSON.stringify(data);

  return "#s#" + message + "#e#";
}
