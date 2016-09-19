'use babel';

import $ from 'jquery';
import fs from 'fs';
import path from 'path';
import escape from "html-escape";

let willBlick = false;
let blinking = false;
let _indicator = $('<div/>');
let _logPane = $('<div/>');
let _luaPane = $('<div/>');
let _clientPane = $('<div/>');
let _sourcemap = {};
let _record = true;
let cache = '';
let currentLogLevel = null;
let _normalColor = null;
let isLuaFirstMessage = isClientFirstMessage = true;

export let setIndicator = (indicator, logPane) => {
  _indicator = indicator;
  _logPane = logPane;
  _luaPane = logPane.find('.lua');
  _clientPane = logPane.find('.client');
}

export let config = (value) => {
  _record = value;
}

export let onbound = () => {
  _normalColor = _indicator.css('color');
  _indicator.css('color', 'white');

  let smfile = '/Users/lujingbo/src/rytongwork/ebank-poc/emp-project/eff-src/main.lua.sourcemap';
  let reload = () => {
    try {
      _sourcemap = JSON.parse(fs.readFileSync(smfile, 'utf8'));
    } catch (err) {
      _sourcemap = {};
      console.log(err.message);
    }
  }

  fs.watch(smfile, (event) => {
    if (event === 'change') {
      reload();
    }
  });

  reload();
}

export let onconnect = () => {
  _indicator.css('color', 'green');
}

export let ondata = (socket, data) => {
  log(data);
  if (blinking) {
    willBlick = true;
  } else {
    blinking = true;
    blink();
  }
}

export let onclose = () => {
  _indicator.css('color', 'white');
}

export let onend = () => {
  _indicator.css('color', 'white');
}

export let ondestroy = () => {
  setTimeout(() => {
    _indicator.css('color', _normalColor);
  }, 0);
}

export let onerror = (err) => {
  atom.notifications.addError(err.message);
  _indicator.css('color', 'red');
}

let translateSM = (orig, line) => {
  for (let file in _sourcemap) {
    let region = _sourcemap[file];
    if (line >= region[0] && line <= region[1]) {
      let lineno = line - region[0] - 2;
      let bn = path.basename(file);
      return `<a href="#" class="text-subtle" file=${file} line=${lineno}>${bn}:${lineno}</a>`
    }
  }

  return orig;
}

let log = (data) => {
  let chunk = '';
  cache = cache + data;

  while ((chunk = /^#s#(.*?)#e#/g.exec(cache)) !== null) {
    let size = chunk[0].length;
    let log = JSON.parse(chunk[1]);

    if (log.level) {
      if (currentLogLevel !== log.level) {
        currentLogLevel = log.level;
      }

      let message = Buffer.from(log.message, 'base64').toString();
      let logtime = message.match(/^\d{4}-\d{2}-\d{2}\s*\d*:\d*:\d*\.\d*\s*/);

      if (logtime) {
        // console.log(logtime[0]);
        message = message.substr(logtime[0].length);
      }

      message = escape(message.trim());
      if (log.level === 'lua') {
        let pattern = /\[string &quot;\(function\(modules\)\.{3}&quot;\]:(\d+)/g;
        let lines = message.split('\n');
        let sminfo = lines[0].match(pattern);
        if (sminfo) { // normal output tag
          message = lines[0].replace(pattern, translateSM);
        } else {
          if (lines[0] !== 'stack traceback:') { // normal output content
            message = `<span class="text-info">${message}</span>`;
          } else { // stack traceback
            message = message.replace(pattern, translateSM);
          }
        }
        if (_record) {
          if (!isLuaFirstMessage) {
            _luaPane.html(_luaPane.html() + '<br/>' + message);
          } else {
            _luaPane.html(message);
            isLuaFirstMessage = false;
          }
          _luaPane.find('.text-subtle').click((e) => {
            let node = $(e.target);
            let file = node.attr('file');
            let lineno = node.attr('line');

            if (path.extname(file) !== '.lua') {
              file = path.join(file, 'index.lua');
            }

            if (fs.existsSync(file)) {
              atom.workspace.open(file, {
                initialLine: lineno - 1,
                initialColumn: 1
              });
            }
          });
        }
      } else {
        if (_record) {
          if (!isClientFirstMessage) {
            _clientPane.html(_clientPane.html() + '<br/>' + message);
          } else {
            _clientPane.html(message);
            isClientFirstMessage = false;
          }
          _logPane.scrollTop(_logPane.prop("scrollHeight"));
        }
      }
    }

    cache = cache.substr(size);
  }
}

let blink = () => {
  process.nextTick(() => {
    _indicator.css('color', 'orange');
    setTimeout(() => {
      _indicator.css('color', 'green');
      if (willBlick) {
        willBlick = false;
        blink();
      } else {
        blinking = false;
      }
    }, 200);
  });
}
