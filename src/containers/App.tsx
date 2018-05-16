import 'ihme-ui/dist/ihme-ui.css';

import { json } from 'd3-fetch';
import { stratify } from 'd3-hierarchy';
import {
  LoadingIndicator,
  ResponsiveContainer,
} from 'ihme-ui/es';
import React from 'react';

import DropShadowDefs from '../components/DropShadowDefs';
import ResponsiveSVG from '../components/ResponsiveSVG';
import TreemapView from './TreemapView';

interface AppState {
  data: any;
}

export default class App extends React.PureComponent<{}, AppState> {
  static stratifyData(data) {
    return stratify()
      .id((d: any) => d.location_id)
      .parentId((d: any) => d.parent_location_id)(data)
      .sum((d: any) => d.value)
      .sort((a, b) =>  (b.height - a.height || b.value - a.value));
  }

  constructor(props) {
    super(props);
    this.state = { data: null };
  }

  async componentDidMount() {
    const data = await json('resources/mock_populations_with_attributes.json');
    this.setState({ data: App.stratifyData(data) });
  }

  renderView(data) {
    return (
      <section>
        <ResponsiveContainer>
          <ResponsiveSVG>
            <TreemapView data={data} />
          </ResponsiveSVG>
        </ResponsiveContainer>
        <DropShadowDefs id="dropshadow" />
      </section>
    );
  }

  render() {
    const { data } = this.state;

    return (
      data
      ? this.renderView(data)
      : <LoadingIndicator />
    );
  }
}
