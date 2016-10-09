'use babel';

let messages = '';

export default function(...message) {
  let tag = message[0][0];

  if (tag === '√') {
    atom.notifications.addSuccess('LuaPack build successfully', {
      detail: messages
    });
    messages = '';
  } else if (tag === '×') {
    atom.notifications.addError(messages);
    messages = '';
  } else {
    messages += '\n' + message.join(' ');
  }
}
