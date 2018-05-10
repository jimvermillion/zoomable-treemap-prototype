import 'ihme-ui/dist/ihme-ui.css';

import React from 'react';
import ReactDom from 'react-dom';

import TreemapView from './containers/TreemapView';

ReactDom.render(
  <TreemapView />,
  document.getElementById('app'),
);
