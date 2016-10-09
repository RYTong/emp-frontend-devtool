'use babel';

export default {
  handleError(err) {
    if (err.code == 'EADDRINUSE') {
      console.log(JSON.stringify(err));
      atom.notifications.addError(err.address + ':' + err.port + " in use");
    } else {
      throw(err);
    }
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
