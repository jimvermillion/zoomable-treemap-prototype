import React from 'react';
import ReactDom from 'react-dom';
import { json }from 'd3';

import Treemap from './components/treemap';

async function app() {
  const data = await json('resources/blub.json');
  ReactDom.render(
    <Treemap data={data}/>,
    document.getElementById('app'),
  );
}

app();
