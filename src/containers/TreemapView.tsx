import { HierarchyRectangularNode } from 'd3-hierarchy';
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

export default class TreemapView extends React.PureComponent<
  TreemapViewProps,
  TreemapViewState
> {
  static getDomainsFromNode = ({ x0, x1, y0, y1 }: HierarchyRectangularNode<any>) => ({
    xDomain: [x0, x1],
    yDomain: [y0, y1],
  })

  static getDomainRangeFromProps = ({ height, width }: Partial<TreemapViewProps>) => {
    const x = [0, width];
    const y = [0, height];

    return {
      xDomain: x,
      xRange: x,
      yDomain: y,
      yRange: y,
    };
  }

  static getDomainAndRange(props, rootNode) {
    // Establish domain and range for `height` and `width`.
    const domainAndRangeFromProps = TreemapView.getDomainRangeFromProps(props);

    // Get domain and range for a root node if it exists.
    const domainFromNode = rootNode ? TreemapView.getDomainsFromNode(rootNode) : {};

    // Override height and width domain/range if root node is present.
    return {
      ...domainAndRangeFromProps,
      ...domainFromNode,
    };
  }

  static updateScales = ({
    xDomain,
    xRange,
    yDomain,
    yRange,
    xScale,
    yScale,
  }) => ({
    xScale: xScale.domain(xDomain).range(xRange),
    yScale: yScale.domain(yDomain).range(yRange),
  })

  static getScales(
    props,
    rootNode,
    { xScale, yScale },
  ) {
    // Determine domain and range for x and y.
    const domainAndRange = TreemapView.getDomainAndRange(props, rootNode);

    // Return object with xScale, yScale properties.
    return TreemapView.updateScales({
      ...domainAndRange,
      xScale,
      yScale,
    });
  }

  constructor(props) {
    super(props);

    const { xScale, yScale } = TreemapView.getScales(
      props,
      props.rootNode,
      { xScale: scaleLinear(), yScale: scaleLinear() },
    );

    this.state = {
      rootNode: props.rootNode,
      showToDepth: 0,
      xScale,
      yScale,
    };
  }

  componentWillReceiveProps(nextProps) {
    const scales = TreemapView.getScales(nextProps, this.state.rootNode, this.state);
    this.setState(scales);
  }

  onDoubleClick = (_, data) => {
    // Get zoom-out `depth`
    const showToDepth = data.depth > 0 ? data.depth - 1 : this.state.showToDepth;

    // Go to grandparent, parent, or self if cannot zoom out further.
    const ancestor = (
      // Use grand parent.
      (data.parent && data.parent.parent)
      // Use parent if no grand parent.
      || data.parent
      // Use self if there are no ancestors.
      || data
    );

    // Update state.
    this.setState({
      rootNode: ancestor,
      showToDepth,
      ...TreemapView.getScales(this.props, ancestor, this.state),
    });
  }

  onClick = (_, data) => {
    // Get zoom-in `depth`
    const showToDepth = data.height > 0 ? data.depth + 1 : this.state.showToDepth;

    // Update state.
    this.setState({
      rootNode: data,
      showToDepth,
      ...TreemapView.getScales(this.props, data, this.state),
    });
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
