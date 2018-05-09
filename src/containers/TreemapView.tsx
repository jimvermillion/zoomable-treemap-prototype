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
}

const svgProps = {
  width: 1000,
  height: 777,
};

export default class TreemapView extends React.PureComponent<{}, TreemapViewState> {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
    };
  }

  async componentDidMount() {
    const data = await json('resources/mock_populations.json');
    this.setState({ data: stratifyData(data) });
  }

  render() {
    const { data } = this.state;
    return (
      !data
      ? <LoadingIndicator />
      : (
        <svg {...svgProps}>
          <Treemap
            colorScale={scaleOrdinal(schemeCategory10)}
            data={data}
            fieldAccessors={{ label: 'location_name' }}
            showToDepth={1}
            stroke={'#fff'}
            strokeWidth={1}
            layoutOptions={{
              padding: 0,
              round: true,
              tile: treemapResquarify,
            }}
            height={777}
            width={1000}
            fontSize={[10, 48]}
          />
        </svg>
      )
    );
  }
}
