'use babel';

import $ from 'jquery';
import { MessagePanelView, PlainMessageView} from 'atom-message-panel';

let messages = null;


let handler = function(...args) {
  if (!messages) {
    messages = new MessagePanelView({
      title: 'LuaPack report',
      closeMethod: 'close'
    });
    messages.attach();
    messages.panel.close = function() {
      let target = document.querySelector('atom-workspace');
      let command = 'emp-frontend-devtool:stop-luapack';
      atom.commands.dispatch(target, command);
      // messages.panel.hide();
      // messages = null;
    }
  }

  messages.add(new PlainMessageView({ message: args.join(' ') }));
  $(messages.body).animate({ scrollTop: $(messages.element).height() }, 500);
}

handler.instance = messages;
handler.destroy = function() {
  if (messages) {
    messages.panel.hide();
    messages = null;
  }
}

export default handler;
