"use babel";

import $ from "jquery";
import fs from "fs";
import path from "path";
import React from "react";
import emitter from "./log-emitter";

export default class LogView extends React.Component {
  constructor(props) {
   super(props);

   this.listen();
   this.state = {
     checked: "lua",
     luaContent: "",
     nativeContent: "",
     peer: null,
   };
  }

  listen() {
   emitter.on("panel-show", ()=> {
     this.toggleLogPanel();
   });
   emitter.on("peer-connect", (key) => {
     this.setState({ peer: key});
   });
   emitter.on("peer-disconnect", (key) => {
     if (this.state.peer === key) {
       this.setState({ peer: null });
     }
   });
   emitter.on("log", (type, timestamp, message) => {
     if (type === "lua") {
       if (this._luaContent) {
         this._luaContent += "\n" + message;
       } else {
         this._luaContent = message;
       }
     } else {
       type = "native";
       if (this._nativeContent) {
         this._nativeContent += "\n" + message;
       } else {
         this._nativeContent = message;
       }
     }

     if (type === this.state.checked) {
       if (type === "lua") {
         this.setState({ luaContent: this._luaContent});
       } else {
         this.setState({ nativeContent: this._nativeContent});
       }
     }
   });
  }

  toggleLogPanel(target=this.state.checked) {
    let luaPanel = $(this.refs.body).find(".lua");
    let nativePanel = $(this.refs.body).find(".native");

    if (target === "lua") {
      nativePanel.hide();
      luaPanel.show();
      luaPanel.animateCss("bounceInRight");
    } else {
      luaPanel.hide();
      nativePanel.show();
      nativePanel.animateCss("bounceInLeft");
    }
  }

  check(event) {
    let target = event.target.getAttribute("data-id");

    if (target !== this.state.checked) {
      if (target === "lua") {
        this.refs.headlua.checked = true;
        this.refs.headnative.checked = false;
        this.setState({ luaContent: this._luaContent});
      } else {
        this.refs.headlua.checked = false;
        this.refs.headnative.checked = true;
        this.setState({ nativeContent: this._nativeContent});
      }
    this.toggleLogPanel(target);
    this.setState({ checked: target });
    }
  }

  content(target) {
    let content = "";

    if (target === "lua") {
      content = this.state.luaContent;
    } else {
      content = this.state.nativeContent;
    }

    return { __html: content };
  }

  clear() {
    this._luaContent = this._nativeContent = '';
    this.setState( {
      luaContent: '',
      nativeContent: ''
    });
  }

  highlightLabel(target) {
    let className = "input-label";

    if (target === this.state.checked) {
      className += " text-warning";
    }

    return className;
  }

  hide() {
    emitter.emit("panel-hide");
  }

  componentDidMount() {
    $(this.refs.heading)
      .find("input[data-id='" + this.state.checked + "']")
      .get(0).checked = true;
  }

  componentDidUpdate() {
    $(this.refs.bodylua).find("a").each(function() {
      if ($(this).attr("bind-click") !== "yes") {
        $(this).click((event) => {
          let node = $(event.target);
          let file = node.attr("file");
          let line = node.attr("line");

          node.attr("bind-click", "yes");

          if (path.extname(file) !== ".lua") {
            file = path.join(file, "index.lua");
          }

          if (fs.existsSync(file)) {
            atom.workspace.open(file, {
              initialLine: line - 1,
              initialColumn: 1
            });
          }
        });
      }
    });
  }

  render() {
    return (
      <atom-panel class="inset-panel efd-log-view">
        <div className="panel-heading" ref="heading">
          <div className="headleft">
            <label className={this.highlightLabel('lua')}>
              <input className="input-radio"
                     type="radio"
                     data-id="lua"
                     ref="headlua"
                     onClick={this.check.bind(this)}
              />Lua Log
            </label>
            <label className={this.highlightLabel('native')}>
              <input className="input-radio"
                     type="radio"
                     data-id="native"
                     ref="headnative"
                     onClick={this.check.bind(this)}
              />Native Log
            </label>
            <span className='inline-block highlight-info'>
              {this.state.peer || 'waitting'}
            </span>
          </div>
          <div className="headright">
            <button className="btn btn-error icon icon-remove-close"
                    onClick={this.hide.bind(this)}
            >Hide</button>
            <button className="btn btn-error icon icon-trashcan"
                    onClick={this.clear.bind(this)}
            >Clear</button>
          </div>
        </div>
        <div className="panel-body" ref="body">
          <pre className="lua"
               dangerouslySetInnerHTML={this.content("lua")}
               ref="bodylua"
          ></pre>
          <pre className="native">{this.state.nativeContent}</pre>
        </div>
      </atom-panel>
    );
  }
}
