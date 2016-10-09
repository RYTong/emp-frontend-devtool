'use babel';

import React from 'react';
import ReactDOM from 'react-dom';


export default function(ReactClass, props, className='block') {
  let element = React.createElement(ReactClass, props);
  let container = document.createElement('div');

  container.classList.add(className);
  ReactDOM.render(element, container);

  return container;
}
