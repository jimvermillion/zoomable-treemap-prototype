import 'ihme-ui/dist/ihme-ui.css';

import { json } from 'd3-fetch';
import {
  HierarchyNode,
  stratify,
} from 'd3-hierarchy';
import {
  LoadingIndicator,
  ResponsiveContainer,
} from 'ihme-ui/es';
import React from 'react';

import DropShadowDefs from '../components/DropShadowDefs';
import ResponsiveSVG from '../components/ResponsiveSVG';
import TreemapView from './TreemapView';

interface RawDatum {
  location_name: string;
  location_id: number;
  parent_location_id: number;
  value: number;
  type: number;
  attribution: number;
}

interface AppState {
  data: HierarchyNode<RawDatum>;
}

export default class App
extends React.PureComponent<
  {},
  AppState
> {
  static stratifyData(data: RawDatum[]): HierarchyNode<RawDatum> {
    return stratify<RawDatum>()
      .id((d: RawDatum) => String(d.location_id))
      .parentId((d: RawDatum) => (
        d.parent_location_id
        ? String(d.parent_location_id)
        : null
      ))(data)
      .sum(d => d.value)
      .sort((a, b) =>  (b.height - a.height || b.value - a.value));
  }

  constructor(props) {
    super(props);
    this.state = { data: null };
  }

  async componentDidMount() {
    const data = await json('resources/mock_populations_with_attributes.json');
    this.setState({ data: App.stratifyData(data as RawDatum[]) });
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
