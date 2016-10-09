'use babel';

import EventEmitter from 'events';

let emitter = new EventEmitter();

emitter.status = {};
emitter.on('status', (server, status) => {
  emitter.status[server] = status;
});

export default emitter;
