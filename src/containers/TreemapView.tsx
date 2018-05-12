import { scaleLinear } from 'd3-scale';
import React from 'react';

import Treemap from '../components/treemap';

interface TreemapViewProps {
  data: any;
  height?: number;
  rootNode?: any;
  xScale?: any;
  yScale?: any;
  width?: number;
}

interface TreemapViewState {
  rootNode?: any;
  showToDepth: number;
  xScale: any;
  yScale: any;
}

export default class TreemapView extends React.PureComponent<
  TreemapViewProps,
  TreemapViewState
> {
  static defaultProps: Partial<TreemapViewProps> = {
    rootNode: {},
    xScale: scaleLinear(), // Probably should not be a prop
    yScale: scaleLinear(), // Probably should not be a prop
  };

  constructor(props) {
    super(props);

    this.state = {
      rootNode: props.rootNode,
      showToDepth: 0,
      ...this.getInitialScales(props),
    };
  }

  componentWillReceiveProps(nextProps) {
    const dimensions = this.getScaleDimensions(nextProps, this.state.rootNode);
    this.setState(this.getScales(dimensions, this.state));
  }

  getInitialScales = (props) => {
    return this.getScales(
      this.getScaleDimensions(props, props.rootNode),
      props,
    );
  }

  getScaleDimensions = (
    { height, width },
    { x0, x1, y0, y1 },
  ) => ({
    x0: x0 || 0,
    x1: x1 || width,
    y0: y0 || 0,
    y1: y1 || height,
  })

  getScales = (
    { x0, x1, y0, y1 },
    { xScale, yScale },
  ) => ({
    xScale: xScale.domain([x0, x1]).range([0, this.props.width]),
    yScale: yScale.domain([y0, y1]).range([0, this.props.height]),
  })

  // would getScales just do this too???
  getUpdatedScalesDomain = ({ x0, x1, y0, y1 }) => ({
    xScale: this.state.xScale.domain([x0, x1]),
    yScale: this.state.yScale.domain([y0, y1]),
  })

  updateScalesDomain = (dims) => {
    const newScales = this.getScales(dims, this.state);
    this.setState(newScales);
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

    this.setState({ rootNode: ancestor });
    this.updateScalesDomain(ancestor);
  }

  onClick = (_, data) => {
    // tslint:disable-next-line:no-console
    console.log('zoom in!', data);

    this.setState({ rootNode: data });
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
        data={data}
        fieldAccessors={{ label: 'location_name' }}
        showToDepth={showToDepth}
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}
        defsUrl="url(#dropshadow)"
        xScale={xScale}
        yScale={yScale}
        height={height}
        width={width}
      />
    );
  }
}
