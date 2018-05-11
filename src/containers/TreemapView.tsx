import { treemapResquarify } from 'd3-hierarchy';
import {
  scaleLinear,
  scaleOrdinal,
} from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import React from 'react';

import Treemap from '../components/treemap';

interface TreemapViewProps {
  data: any;
  height?: number;
  width?: number;
}

interface TreemapViewState {
  showToDepth: number;
  xScale: any;
  yScale: any;
}

export default class TreemapView extends React.PureComponent<
  TreemapViewProps,
  TreemapViewState
> {
  constructor(props) {
    super(props);

    this.state = {
      showToDepth: 0,
      ...this.getUpdatedScales(props),
    };
  }

  componentWillReceiveProps(nextProps: TreemapViewProps) {
    this.setState(this.getUpdatedScales(nextProps));
  }

  getUpdatedScales = ({ height, width }: TreemapViewProps) => ({
    xScale: scaleLinear().domain([0, width]).range([0, width]),
    yScale: scaleLinear().domain([0, height]).range([0, height]),
  });

  updateScalesDomain = ({
    x0,
    x1,
    y0,
    y1,
  }) => {
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

    this.updateScalesDomain(ancestor);
  }

  onClick = (_, data) => {
    // tslint:disable-next-line:no-console
    console.log('zoom in!', data);
    this.updateScalesDomain(data);
    if (data.height > 0) {
      this.setState({
        showToDepth: data.depth + 1,
      });
    }
  }

  render() {
    const {
      data,
      height,
      width,
    } = this.props;

    const {
      showToDepth,
      xScale,
      yScale,
    } = this.state;

    return (
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
        fontSize={[10, 48]}
        xScale={xScale}
        yScale={yScale}
        height={height}
        width={width}
      />
    );
  }
}
