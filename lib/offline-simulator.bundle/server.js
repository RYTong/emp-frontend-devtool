'use babel';

import { allowUnsafeEval } from 'loophole';
import fs from 'fs';
import path from 'path';
import su from '../server-util';
import emitter from '../server-config.bundle/config-emitter';
import config from '../server-config.bundle/config';

let log = require('../log-prefix')('[offline]');
let express = allowUnsafeEval(() => require('express'));
let bodyParser = allowUnsafeEval(() => require('body-parser'));

let app = express();
let _server = null;

let ROOTDIR, WWWPATH, PRELOADPATH, COMMONPATH;

export default {
  init() {
    su.bindStartAndStopListeners('simulator', this, emitter);
  },

  start() {

    if (!isValidProject()) {
      emitter.emit('status', 'simulator', 'ready');
      log('<', config.simulator.project, '> is not a valid EBANK project');
      return;
    }

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.all('/test_s/get_page', process);

    _server = app.listen(4002);
    _server.on('close', () => {
      _server = null;
      emitter.emit('status', 'simulator', 'ready');
    });
    _server.on('error', (e) => {
      su.handleError(e);
      emitter.emit('status', 'simulator', 'error');
    });

    emitter.emit('status', 'simulator', 'running');
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
  PRELOADPATH = path.join(WWWPATH, 'preload');
  COMMONPATH  = path.join(WWWPATH, 'resource_dev/common');

  return [ROOTDIR, WWWPATH, COMMONPATH].every((dir) => {
    return fs.existsSync(dir);
  });
}

function process(req, res) {
  let realpath, reqpath = req.body.name;

  log('req.url  :', req.url);
  log('req.body :', req.body);

  if (reqpath.startsWith('channels/')) {
    realpath = computeOfflineFilePath(reqpath.slice(9), res);
  } else if(reqpath.startsWith('preload/')) {
    realpath = computePreloadFilePath(reqpath.slice(8), res);
  } else {
    console.err('bad req path');
    return;
  }
  log('real path:', realpath);

  let content = fs.readFileSync(realpath, 'utf8').trim();

  if (path.extname(realpath) === '.xhtml') {
    let comment = "<!--FILENAME:" + realpath + "-->";
    let lines = content.split('\n');
    if (lines[0].startsWith('<?xml')) {
      lines[0] += '\n' + comment;
    } else {
      lines.unshift(comment);
    }
    content = lines.join('\n');
  }

  res.send(new Buffer(content));
  // res.sendFile(realpath);
}

function computeOfflineFilePath(reqpath, res) {
  let realpath;

  if (isAbsolutePath(reqpath)) {
    realpath = reqpath;
  } else if (isChannelPath(reqpath)) {
    realpath = path.join(COMMONPATH, 'channels', reqpath);
  } else {
    let extname = path.extname(reqpath);
    if (isImage(extname)) {
      realpath = path.join(COMMONPATH, 'images', reqpath);
    } else {
      realpath = path.join(COMMONPATH, extname.slice(1), reqpath);
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

function isImage(extname) { return extname !== '.lua' && extname !== '.css'; }