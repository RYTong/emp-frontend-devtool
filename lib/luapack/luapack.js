'use babel';

import fs from 'fs';
import path from 'path';

let BUNDLETMPL = fs.readFileSync(path.join(__dirname, 'bundle.template.lua'), 'utf8');
let MODTMPL = fs.readFileSync(path.join(__dirname, 'module.template.lua'), 'utf8');
let REQPTN = /\brequire\s*\(\s*('([^']+)'|"([^"]+)")\s*\)/g;

export default class {
  constructor(loghandler) {
    this.log = (...args) => {
      if (loghandler) {
        loghandler(...args);
      } else {
        console.log(...args);
      }
    }
  }

  run(options) {
    if (!fs.existsSync(options.entry)) {
      throw('[ERROR] entry file not found.');
    }

    this.buildstr = '';
    this._modcache = {};
    this._watchers = {};
    this._sourcemap = options.sourcemap;
    this._seedfile = options.entry;
    this._buildfile = options.build
    this._watching = options.watch || false;

    // if (!this._buildfile) {
    //   let size = options.entry.length;
    //   this._buildfile = options.entry.substr(0, size-3) + 'bundle.lua';
    // }
    //
    if (this._buildfile) {
      let builddir = path.dirname(this._buildfile);
      if (!fs.existsSync(builddir)) {
        throw('[ERROR] build dir:' + builddir + ' not exists')
      }
    }

    this._pack();
  }

  stop() {
    for (let file in this._watchers) {
      let watcher = this._watchers[file];

      if (watcher) watcher.close();
    }

    this._watchers = {};
    this.modcache = {};
  }

  _watch(file) {
    if (!this._watchers[file]) {
      let content = fs.readFileSync(file, 'utf8');

      this._watchers[file] = fs.watch(file, (event) => {
        let filedesc = file;

        if (file.length > 43) {
          filedesc = '...' + file.substr(file.length - 40);
        }

        if (event === 'change') {
          let _content = fs.readFileSync(file, 'utf8');
          if (content !== _content) {
            content = _content;
            this.log('☞ [CHANGE]', filedesc);
            this._pack();
          }
        } else { // event === 'rename'
          this._watchers[file].close();
          delete this._watchers[file];
          delete this._modcache[file];
          this.log('☞ [REMOVE]', filedesc);
          this._pack();
        }
      });
    }
  }

  _pack() {
    this._error = false;
    this._modules = [];
    this._modmap = {};

    this.log('@', new Date());

    this._parse(this._seedfile);

    let entrypoint = this._modules.length;
    let sourcemap = {};

    for (let i = 0; i< entrypoint; i++) {
      let m = this._modules[i];
      let tag = '---- (' + (i+1) + ') ----\n';
      this._modules[i] = tag + m.trim();
    }

    this.buildstr = BUNDLETMPL.replace('{{MODULES}}', this._modules.join(',\n'));
    // this.buildstr = this.buildstr.replace('{{ENTRYPOINT}}', entrypoint);

    if (this._buildfile) {
      fs.writeFileSync(this._buildfile, this.buildstr, 'utf8');
    }

    if (this._buildfile && this._sourcemap) {
      let prelines = 44;
      let sourcemapfile = this._buildfile + '.sourcemap';
      // let sourcemapfile = this._seedfile + '.sourcemap';

      for (let file in this._modmap) {
        let index = this._modmap[file] - 1;
        let size = this._modules[index].split('\n').length;
        sourcemap[file] = [prelines+1, prelines + size];
        prelines += size;
      }
      if (typeof this._sourcemap === 'string') {
        sourcemapfile = this._sourcemap;
      }
      fs.writeFileSync(sourcemapfile, JSON.stringify(sourcemap), 'utf8');
    }

    for (let m in this._modcache) {
      m = m.endsWith('/index.lua') ? m.substr(0, m.length - 10) : m;
      if (!(m in this._modmap)) {
        this._watchers[m] && this._watchers[m].close();
        delete this._watchers[m];
        delete this._modcache[m];
      }
    }

    if (this._error) {
      this.log('× failed to build bundle file to', this._buildfile||'string', '\n');
    } else {
      this.log('√ success to build bundle file to', this._buildfile||'string', '\n');
    }
  }

  _parse(modname) {
    let realname = modname.endsWith('.lua')
                ? modname : path.join(modname, 'index.lua');

    if (!this._modmap[modname]) {
      this._modules.push('[LUAPACK-MODULE-HOLE]');
      this._modmap[modname] = this._modules.length
      let basedir = path.dirname(realname),
          modstr = this._rfs(realname),
          mod = this._resolve(modstr, basedir),
          req = '';

      if (this._modcache[realname] !== modstr) {
        this._modcache[realname] = modstr;
        this.log('parsing', path.basename(modname));
      }

      if (mod.needReq) {
        req = ', __luapack_require__';
      }

      modstr = MODTMPL.replace('{{MODULE}}', mod.s);
      modstr = modstr.replace('{{FILENAME}}', realname);
      modstr = modstr.replace('{{REQUIRE}}', req);
      this._modules[this._modmap[modname]-1] = modstr;
    } else {
      // in cache
    }
  }

  _resolve(modstr, basedir) {
    let needReq = false, ret;
    let that = this;

    modstr = modstr.replace(REQPTN, function(match, p1, p2){
      let depname = path.resolve(basedir, p2);

      needReq = true;
      that._parse(depname);

      return that._req(depname);
    });

    return {
      needReq: needReq,
      s: modstr.trim()
               .split('\n')
               .map(function(line){ return '  ' + line; })
               .join('\n')
    }
  }

  _rfs(path) {
    if (fs.existsSync(path)) {
      if (this._watching) {
        this._watch(path);
      }
      return fs.readFileSync(path, 'utf8');
    } else {
      this._error = true;
      this.log('[ERROR]', path, 'NOT FOUND.');
      return '[404]' + path;
    }
  }

  _req(name) {
    return '__luapack_require__(' + this._modmap[name] + ')';
  }
}
