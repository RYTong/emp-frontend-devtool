'use babel';
const net = require('net');

let _handler = null;
let _running = false;
let _server = null;
let _socks = [];

export default {
  setHandler(handler) {
    _handler = handler;
  },

  isRunning() {
    return _running
  },

  start() {
    _server = net.createServer((socket) => {
      _socks.push(socket);
      // 'connection' listener
      _handler.onconnect(socket);
      socket.setEncoding('utf8');
      socket.on('end', () => {
        _handler.onend(socket);
      });
      socket.on('close', () => {
        _handler.onclose(socket);
      });
      socket.on('data', (data) => {
        _handler.ondata(socket, data);
      });
    });
    _server.on('close', () => {
      _handler.ondestroy();
    });
    _server.on('error', (err) => {
      _handler.onerror(err);
    });
    _server.listen(7003, () => {
      _handler.onbound();
      _running = true;
    });
  },

  stop(handler) {
    _running = false;
    _socks.forEach((socket) => {
      socket.end();
    });
    _server && _server.close(handler);
  }
}
