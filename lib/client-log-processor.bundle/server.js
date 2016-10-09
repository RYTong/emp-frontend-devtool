'use babel';

import net from 'net';
import listener from './default-listener';
import su from '../server-util';
import emitter from '../server-config.bundle/config-emitter';

let log = require('../log-prefix')('[client-log]');
let _handler = null;
let _server = null;
let _socks = [];

export default {
  init() {
    su.bindStartAndStopListeners('logger', this, emitter);
  },

  start() {
    _server = net.createServer((socket) => {

      //TODO:
      if (_socks.length > 0) {
        _socks[0].end();
        _socks = [];
      }

      _socks.push(socket);
      socket.setEncoding('utf8');
      listener.bind(socket);
    });
    _server.on('close', () => {
      _server = null;
      emitter.emit('status', 'logger', 'ready');
    });
    _server.on('error', (e) => {
      emitter.emit('status', 'logger', 'error');
      su.handleError(e);
      _server.close();
    });
    _server.listen(7003, () => {
      emitter.emit('status', 'logger', 'running');
      log('server bound on tcp port #7003');
    });
  },

  stop() {
    _socks.forEach((socket) => {
      socket.end();
    });

    if (_server) {
      _server.close();
    }
  }
}
