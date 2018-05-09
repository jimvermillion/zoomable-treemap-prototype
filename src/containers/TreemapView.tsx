import {
  json,
  scaleOrdinal,
  schemeCategory10,
  stratify,
  treemapResquarify,
} from 'd3';
import { LoadingIndicator } from 'ihme-ui/es';
import React from 'react';

import Treemap from '../components/treemap';

function stratifyData(data) {
  return stratify()
    .id(d => d.location_id)
    .parentId(d => d.parent_location_id)(data)
    .sum(d => d.value)
    .sort((a, b) =>  (b.height - a.height || b.value - a.value));
}

interface TreemapViewState {
  data: any[] | null;
  showToDepth: number;
};

const svgProps = {
  width: 1000,
  height: 777,
};

export default class TreemapView extends React.PureComponent<{}, TreemapViewState> {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      showToDepth: 1,
    };
  }

  async componentDidMount() {
    const data = await json('resources/mock_populations.json');
    this.setState({ data: stratifyData(data) });
  }

  onClick = (_, { children, data, depth }) => {
    console.log(data.location_name);
    const showToDepth = (
      children && children.length
      ? depth + 2                   // Two feels weird. Magic. Why 2?
      : this.state.showToDepth
    )
    this.setState({ showToDepth });
  }

  render() {
    const { data } = this.state;
    return (
      !data
      ? <LoadingIndicator />
      : (
        <svg {...svgProps}>
          // rip off from Evan's code.
          <defs>
            <filter id="dropshadow" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" result="shadow"></feGaussianBlur>
              <feOffset dx="1" dy="1"></feOffset>
            </filter>
          </defs>
          <Treemap
            colorScale={scaleOrdinal(schemeCategory10)}
            data={data}
            fieldAccessors={{ label: 'location_name' }}
            showToDepth={this.state.showToDepth}
            stroke={'#fff'}
            strokeWidth={3}
            layoutOptions={{
              padding: 0,
              round: true,
              tile: treemapResquarify,
            }}
            onClick={
              // this needs to attach it's own state to a 'zoom' property within this view container
              // Click on 'World'
              //   - increase depth by one (if available)
              //   - 'zoom' property is the parentId? Get descendants of that parent? Filter data from there?
              this.onClick
            }
            defsUrl="url(#dropshadow)"
            height={777}
            width={1000}
            fontSize={[10, 48]}
          />
        </svg>
      )
    );
  }
}
