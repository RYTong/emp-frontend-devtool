'use babel';

import net from 'net';
import detectPort from 'detect-port';
import listener from './default-listener';
import su from '../server-util';
import emitter from '../server-config.bundle/config-emitter';
import { dispatch } from '../store';
import { openPort, closePort } from '../actions';

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
      dispatch(closePort('logger'));
    });
    _server.on('error', (e) => {
      emitter.emit('status', 'logger', 'error');
      su.handleError('logger', e);
      _server.close();
    });

    detectPort(7003)
      .then(port => {
        _server.listen(port, () => {
          dispatch(openPort('logger', port));
          emitter.emit('status', 'logger', 'running', port);
          log(`server bound on tcp port #${port}`);
        })})
      .catch(err => {
        _server = null;
        su.handleError('logger', 'cant alloc port for logger server');
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
