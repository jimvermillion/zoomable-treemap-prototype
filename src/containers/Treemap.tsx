import {
  HierarchyRectangularNode,
  treemap,
  treemapResquarify,
} from 'd3-hierarchy';
import {
  ScaleLinear,
  scaleLinear,
  scaleOrdinal,
} from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import noop from 'lodash-es/noop';
import React from 'react';

import DoubleClickReactComponent, {
  DoubleClickComponentProps,
} from '../components/DoubleClickReactComponent';
import TreemapCell from "../components/TreemapCell";

const DEFAULT_SCALES = {
  xScale: scaleLinear(),
  yScale: scaleLinear(),
};

interface AttributionFieldAccessors {
  name: string;
  fill?: string;
}

interface TreemapFieldAccessors {
  label: string;
  attribution?: AttributionFieldAccessors;
}

interface LayoutOptions {
  padding: number;
  round: boolean;
  tile: any;
}

interface TreemapProps extends DoubleClickComponentProps {
  colorScale?: (input: number | string) => string;
  data: any;
  defsUrl?: string;
  fieldAccessors: TreemapFieldAccessors;
  fontSize?: number[];
  height: number;
  layoutOptions?: LayoutOptions;
  onClick?: (...args: any[]) => void;
  onDoubleClick?: (...args: any[]) => void;
  onMouseLeave?: (...args: any[]) => void;
  onMouseMove?: (...args: any[]) => void;
  onMouseOver?: (...args: any[]) => void;
  rootNodeId?: number | string;
  showToDepth: number;
  stroke?: string;
  strokeWidth?: number | string;
  width: number;
}

interface TreemapState {
  layout: any;
  processedData: any;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export default class Treemap extends DoubleClickReactComponent<
  TreemapProps,
  TreemapState
> {
  static defaultProps = {
    colorScale: scaleOrdinal(schemeCategory10),
    doubleClickTiming: 250,
    fontSize: [10, 48],
    layoutOptions: {
      padding: 0,
      round: true,
      tile: treemapResquarify,
    },
    onClick: noop,
    onMouseOver: noop,
    onMouseLeave: noop,
    onMouseMove: noop,
    showToDepth: 1,
    stroke: '#fff',
    strokeWidth: 3,
  };

  /**
   * Get full HierarchyRectangularNode by just its id.
   */
  static getNodeById(id, root) {
    // If id matches root.id, we found the node.
    if (root.id === id) {
      return root;
    }

    // Iterate over children.
    if (root.children) {
      for (const child of root.children) {
        const nodeById = Treemap.getNodeById(id, child);
        if (nodeById) {
          return nodeById;
        }
      }
    }

    // If not found:
    return null;
  }

  /**
   * Get x/y domain set by a HierarchyRectangularNode's properties.
   */
  static getDomainsFromNode = ({ x0, x1, y0, y1 }: HierarchyRectangularNode<any>) => ({
    xDomain: [x0, x1],
    yDomain: [y0, y1],
  })

  /**
   * Get x/y domain and range set from props.
   */
  static getDomainsAndRangesFromProps = ({ height, width }: Partial<TreemapProps>) => {
    const x = [0, width];
    const y = [0, height];

    return {
      xDomain: x,
      xRange: x,
      yDomain: y,
      yRange: y,
    };
  }

  /**
   * Get domain and range for x/y scales.
   */
  static getDomainsAndRanges(props, rootNode) {
    // Establish domain and range for `height` and `width`.
    const domainAndRangeFromProps = Treemap.getDomainsAndRangesFromProps(props);

    // Get domain for a root node if it exists.
    const domainFromNode = rootNode ? Treemap.getDomainsFromNode(rootNode) : {};

    // Override height and width domain/range if root node if present.
    return { ...domainAndRangeFromProps, ...domainFromNode };
  }

  /**
   * Get current x/y scales.
   */
  static getScales(
    props,
    { xScale, yScale } = DEFAULT_SCALES,
  ) {
    // Get root node that has been isolated.
    const node = Treemap.getNodeById(props.rootNodeId, props.data);

    // Determine domain and range for x and y.
    const {
      xDomain,
      xRange,
      yDomain,
      yRange,
    } = Treemap.getDomainsAndRanges(props, node);

    // Return object with xScale, yScale properties.
    return {
      xScale: xScale.domain(xDomain).range(xRange),
      yScale: yScale.domain(yDomain).range(yRange),
    };
  }

  static getLayout = ({ width, height, ...props }, layout) => {
    if (layout) {
      // If a layout already exists, return it with an updated height.
      return layout.size([width, height]);
    }

    const {
      padding,
      round,
      tile,
    } = props.layoutOptions;

    return treemap()
      .tile(tile)
      .round(round)
      .size([width, height])
      .padding(padding);
  }

  static processDataWithLayout({ data, showToDepth }, layout) {
    return layout(data)
      .descendants()
      .filter(({ depth }) => depth <= showToDepth);
  }

  static getProcessedState(props, state?) {
    // Get the `treemap` layout.
    const layout = Treemap.getLayout(props, state && state.layout);

    // Process data through the layout.
    const processedData = Treemap.processDataWithLayout(props, layout);

    // Get initial x/y scales.
    const scales = Treemap.getScales(props, state);

    // Return state with layout, data, and scales.
    return {
      layout,
      processedData,
      ...scales,
    };
  }

  constructor(props) {
    super(props);
    this.state = Treemap.getProcessedState(props);
  }

  componentWillReceiveProps(nextProps) {
    const newState = Treemap.getProcessedState(nextProps, this.state);
    this.setState(newState);
  }

  renderTreemapCell = (datum) => {
    const {
      colorScale,
      defsUrl,
      fieldAccessors,
      onClick,
      onDoubleClick,
      onMouseLeave,
      onMouseMove,
      onMouseOver,
      stroke,
      strokeWidth,
    } = this.props;

    const {
      xScale,
      yScale,
    } = this.state;

    return (
      <TreemapCell
        key={`cell-${datum.id}`}
        colorScale={colorScale}
        datum={datum}
        defsUrl={defsUrl}
        fieldAccessors={fieldAccessors}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onMouseOver={onMouseOver}
        stroke={stroke}
        strokeWidth={strokeWidth}
        xScale={xScale}
        yScale={yScale}
      />
    );
  }

  render() {
    return <g>{this.state.processedData.map(this.renderTreemapCell)}</g>;
  }
}
