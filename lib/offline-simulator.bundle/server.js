'use babel';

import { allowUnsafeEval } from 'loophole';
import fs from 'fs';
import path from 'path';
import su from '../server-util';
import serverEmitter from '../server-config.bundle/config-emitter';
import loggerEmitter from '../client-log-processor.bundle/log-emitter';
import config from '../server-config.bundle/config';

let log = require('../log-prefix')('[offline]');
let express = allowUnsafeEval(() => require('express'));
let bodyParser = allowUnsafeEval(() => require('body-parser'));

let app = express();
let _server = null;

let ROOTDIR, WWWPATH, PRELOADPATH, COMMONPATH;

export default {
  init() {
    su.bindStartAndStopListeners('simulator', this, serverEmitter);
  },

  start() {

    if (!isValidProject()) {
      let err = '<'+config.simulator.project+'> is not a valid EBANK project';

      log(err);
      su.handleError('simulator', err);
      serverEmitter.emit('status', 'simulator', 'ready');

      return;
    }

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.all('/test_s/get_page', process);
    app.all('/h5/*', function(req, res) {
      let realpath = path.join(WWWPATH, 'h5', req.url.slice(4));

      log('req.url:', req.url);
      log('real path:', realpath);

      res.sendFile(realpath);
    });

    _server = app.listen(4002);
    _server.on('close', () => {
      _server = null;
      serverEmitter.emit('status', 'simulator', 'ready');
    });
    _server.on('error', (e) => {
      su.handleError('simulator', e);
      serverEmitter.emit('status', 'simulator', 'error');
    });

    serverEmitter.emit('status', 'simulator', 'running');
    log('server bound on http port #4002');
  },

  stop() {
    log('stop server');
    if (_server) {
      _server.close();
    }
  }
}

function isValidProject() {
  ROOTDIR     = config.simulator.project;
  WWWPATH     = path.join(ROOTDIR, 'public/www');
  // PRELOADPATH = path.join(WWWPATH, 'preload');
  COMMONPATH  = path.join(WWWPATH, 'resource_dev/common');

  return [ROOTDIR, WWWPATH, COMMONPATH].every((dir) => {
    return fs.existsSync(dir);
  });
}

function process(req, res) {
  let realpath,
      reqpath = req.body.name,
      actionType = req.headers['x-action-type'],
      content,
      metafp,
      fileext,
      commentline,
      ressize;

  log('req.url  :', req.url);
  log('req.body :', req.body);
  log('req.type :', actionType || 'new page');

  if (actionType === 'reload' || actionType === 'restart') {
    loggerEmitter.emit('clear');
  }

  if (reqpath.startsWith('channels/')) {
    realpath = computeOfflineFilePath(reqpath.slice(9), res);
  } else if(reqpath.startsWith('preload/')) {
    realpath = computePreloadFilePath(reqpath.slice(8), res);
  } else {
    console.err('bad req path');
    return;
  }
  log('real path:', realpath);

  content = fs.readFileSync(realpath);
  metafp = `@EMP-DEVELOPMENT-MODE::FILENAME<${realpath}>@`;
  fileext = path.extname(realpath);

  if (fileext === '.xhtml') {
    commentline = new Buffer('\n' + `<!--${metafp}-->`);
  } else if (fileext === '.lua') {
    commentline = new Buffer('\n' + `--${metafp}`);
  } else if (fileext === '.css') {
    commentline = new Buffer('\n' + `/*${metafp}*/`);
  }

  ressize = content.length + commentline.length;
  res.send(Buffer.concat([content, commentline], ressize));
}

function computeOfflineFilePath(reqpath, res) {
  let realpath;

  if (isAbsolutePath(reqpath)) {
    realpath = reqpath;
  } else if (isChannelPath(reqpath)) {
    realpath = path.join(COMMONPATH, 'channels', reqpath);
  } else {
    let extname = path.extname(reqpath);
    if (extname === '.lua' || extname === '.css') {
      realpath = path.join(COMMONPATH, extname.slice(1), reqpath);
    } else if (extname === '.xhtml') {
      realpath = path.join(WWWPATH, reqpath);
    } else { // images
      realpath = path.join(COMMONPATH, 'images', reqpath);
    }
  }

  return realpath;
}

function computePreloadFilePath(reqpath, res) {
  let realpath;

  if (reqpath.startsWith('main')) {
    realpath = path.join(WWWPATH, 'entrance.xhtml');
  } else {
    realpath = path.join(PRELOADPATH, reqpath);
  }

  return realpath;
}

function isAbsolutePath(path) { return path.startsWith('/'); }
function isChannelPath(path) { return path.search('/') !== -1; }
