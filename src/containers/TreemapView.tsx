import {
  ScaleLinear,
  scaleLinear,
} from 'd3-scale';
import React from 'react';

import Treemap from '../components/treemap';

interface TreemapViewProps {
  data: any;
  height?: number;
  rootNode?: any;
  width?: number;
}

interface TreemapViewState {
  rootNode?: any;
  showToDepth: number;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

interface RectangleDimension {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export default class TreemapView extends React.PureComponent<
  TreemapViewProps,
  TreemapViewState
> {
  static defaultProps: Partial<TreemapViewProps> = {
    rootNode: {},
  };

  static getScaleDimensions = (
    { height, width }: Partial<TreemapViewProps>,
    { x0, x1, y0, y1 }: RectangleDimension,
  ) => ({
    x0: x0 || 0,
    x1: x1 || width,
    y0: y0 || 0,
    y1: y1 || height,
  })

  static getScales = (
    { height, width }: Partial<TreemapViewProps>,
    { x0, x1, y0, y1 }: RectangleDimension,
    { xScale, yScale }: Partial<TreemapViewState>,
  ) => ({
    xScale: xScale.domain([x0, x1]).range([0, width]),
    yScale: yScale.domain([y0, y1]).range([0, height]),
  })

  constructor(props) {
    super(props);

    // Perhaps. this should be abstracted?
    const { xScale, yScale } = TreemapView.getScales(
      props,
      TreemapView.getScaleDimensions(props, props.rootNode),
      { xScale: scaleLinear<number, number>(), yScale: scaleLinear<number, number>() },
    );

    this.state = {
      rootNode: props.rootNode,
      showToDepth: 0,
      xScale,
      yScale,
    };
  }

  componentWillReceiveProps(nextProps) {
    // Possible problems with zoom | responsive window -- parent width/height. erratic
    const dimensions = TreemapView.getScaleDimensions(nextProps, this.state.rootNode);

    const { xScale, yScale } = TreemapView.getScales(nextProps, dimensions, this.state);

    this.setState({
      xScale,
      yScale,
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

    this.setState({ rootNode: ancestor });
    TreemapView.getScales(this.props, ancestor, this.state);
  }

  onClick = (_, data) => {
    // tslint:disable-next-line:no-console
    console.log('zoom in!', data);

    this.setState({ rootNode: data });
    TreemapView.getScales(this.props, data, this.state);

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

    // tslint:disable-next-line:no-console
    console.log('current zoom on', this.state.rootNode.data && this.state.rootNode.data.location_name);

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
