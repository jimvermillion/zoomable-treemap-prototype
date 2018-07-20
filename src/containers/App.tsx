import 'ihme-ui/dist/ihme-ui.css';

import { json } from 'd3-fetch';

import {
  LoadingIndicator,
  ResponsiveContainer,
} from 'ihme-ui/es';
import React from 'react';

import DropShadowDefs from '../components/DropShadowDefs';
import ResponsiveSVG from '../components/ResponsiveSVG';
import TreemapView from './TreemapView';

export interface RawDatum {
  location_name: string;
  location_id: number;
  parent_location_id: number;
  value: number;
  type: number;
  attribution: number;
}

interface AppState {
  data: RawDatum[];
}

export default class App
extends React.PureComponent<
  {},
  AppState
> {
  constructor(props) {
    super(props);
    this.state = { data: null };
  }

  async componentDidMount() {
    const data = await json('resources/mock_populations_with_attributes.json');
    this.setState({ data: data as RawDatum[] });
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
