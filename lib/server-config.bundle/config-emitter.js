'use babel';

import EventEmitter from 'events';

let emitter = new EventEmitter();

emitter.status = {};
emitter.ports = {};

emitter.on('status', (server, status, port) => {
  emitter.status[server] = status;
  emitter.ports[server] = port;
});

export default emitter;
