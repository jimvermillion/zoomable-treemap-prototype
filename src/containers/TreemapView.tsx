import { HierarchyRectangularNode } from 'd3-hierarchy';
import {
  ScaleLinear,
  scaleLinear,
} from 'd3-scale';
import React from 'react';

import Treemap from '../components/treemap';

const DEFAULT_SCALE = scaleLinear();

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
      { xScale: DEFAULT_SCALE, yScale: DEFAULT_SCALE },
    );

    this.state = {
      rootNode: props.rootNode,
      showToDepth: 0,
      xScale,
      yScale,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(TreemapView.getScales(nextProps, this.state.rootNode, this.state));
  }

  onDoubleClick = (_, data) => {
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

    this.setState({
      rootNode: ancestor,
      ...TreemapView.getScales(this.props, ancestor, this.state),
    });
  }

  onClick = (_, data) => {
    // tslint:disable-next-line:no-console
    console.log('zoom in!', data);

    const domainAndRange = TreemapView.getDomainAndRange(this.props, data);

    const { xScale, yScale } = TreemapView.updateScales({
      ...domainAndRange,
      xScale: this.state.xScale,
      yScale: this.state.yScale,
    });

    this.setState({
      rootNode: data,
      xScale,
      yScale,
    });

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
    console.log('current zoom on', this.state.rootNode && this.state.rootNode.data && this.state.rootNode.data.location_name);

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
