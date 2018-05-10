import {
  json,
  scaleLinear,
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
  xScale: any;
  yScale: any;
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
      showToDepth: 0,
      xScale: scaleLinear().domain([0, svgProps.width]).range([0, svgProps.width]),
      yScale: scaleLinear().domain([0, svgProps.height]).range([0, svgProps.height]),
    };
  }

  async componentDidMount() {
    const data = await json('resources/mock_populations.json');
    this.setState({ data: stratifyData(data) });
  }

  updateScales = ({ x0, x1, y0, y1 }) => {
    this.setState({
      xScale: this.state.xScale.domain([x0, x1]),
      yScale: this.state.yScale.domain([y0, y1]),
    });
  }

  onDoubleClick = (_, data) => {
    // tslint:disable-next-line:no-console
    console.log('zoom out!', data);
    if (data.depth > 0) {
      this.setState({
        showToDepth: data.depth - 1,
      });
    }

    // Go to grandparent, parent, or self if cannot zoom out further.
    const ancestor = (
      // Use grand parent.
      (data.parent && data.parent.parent)
      // Use parent if no grand parent.
      || data.parent
      // Use self if there are no ancestors.
      || data
    );

    this.updateScales(ancestor);
  }

  onClick = (_, data) => {
    // tslint:disable-next-line:no-console
    console.log('zoom in!', data);
    this.updateScales(data);
    if (data.height > 0) {
      this.setState({
        showToDepth: data.depth + 1,
      });
    }
  }

  render() {
    const {
      data,
      showToDepth,
      xScale,
      yScale,
    } = this.state;

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
            showToDepth={showToDepth}
            stroke={'#fff'}
            strokeWidth={3}
            layoutOptions={{
              padding: 0,
              round: true,
              tile: treemapResquarify,
            }}
            onClick={this.onClick}
            onDoubleClick={this.onDoubleClick}
            defsUrl="url(#dropshadow)"
            height={777}
            width={1000}
            fontSize={[10, 48]}
            xScale={xScale}
            yScale={yScale}
          />
        </svg>
      )
    );
  }
}
