'use babel';

export default {
  handleError(server, err) {
    atom.notifications.addError(server + ' error', {
      detail: err
    });
  },

  bindStartAndStopListeners(name, server, emitter) {
    emitter.on('start', (servername) => {
      if (servername === name) {
        server.start();
      }
    });
    emitter.on('stop', (servername) => {
      if (servername === name) {
        server.stop();
      }
    });
  }
}
