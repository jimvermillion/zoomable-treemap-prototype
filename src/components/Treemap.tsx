import { max } from 'd3-array';
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

import Rectangle from './Rectangle';

import { stringWidth } from '../utils';

// Constants
const DOUBLE_CLICK_TIMING = 250;
const FONT_SIZE_DEFAULT = 12;
const FONT_PADDING_DEFAULT = 8;
const FONT_MARGIN_DEFAULT = 3;

interface TreemapFieldAccessors {
  label: string;
}

interface LayoutOptions {
  padding: number;
  round: boolean;
  tile: any;
}

interface TreemapProps {
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

export default class Treemap extends React.Component<
  TreemapProps,
  TreemapState
> {
  static defaultProps: Partial<TreemapProps> = {
    colorScale: scaleOrdinal(schemeCategory10),
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

  static getNodeById(id, root) {
    // If id matches root.id, we found the node.
    if (root.id === id) {
      return root;
    }

    // Iterate over children
    if (root.children) {
      for (const child of root.children) {
        const nodeById = Treemap.getNodeById(id, child);
        if (nodeById) {
          return nodeById;
        }
      }
    }

    // If not found, return null.
    return null;
  }

  static getDomainsFromNode = ({ x0, x1, y0, y1 }: HierarchyRectangularNode<any>) => ({
    xDomain: [x0, x1],
    yDomain: [y0, y1],
  })

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

  static getDomainAndRange(props, rootNode) {
    // Establish domain and range for `height` and `width`.
    const domainAndRangeFromProps = Treemap.getDomainsAndRangesFromProps(props);

    // Get domain and range for a root node if it exists.
    const domainFromNode = rootNode ? Treemap.getDomainsFromNode(rootNode) : {};

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
    rootNodeId,
    { xScale, yScale },
  ) {
    // Get root node that has been isolated.
    const node = Treemap.getNodeById(rootNodeId, props.data);

    // Determine domain and range for x and y.
    const domainAndRange = Treemap.getDomainAndRange(props, node);

    // Return object with xScale, yScale properties.
    return Treemap.updateScales({
      ...domainAndRange,
      xScale,
      yScale,
    });
  }

  clickTimeout: any;

  constructor(props) {
    super(props);

    const layout = this.getLayout();

    // Data Processing
    const processedData = layout(this.props.data)
      .descendants()
      .filter(({ depth }) => depth < this.props.showToDepth);

    const {
      xScale,
      yScale,
    } = Treemap.getScales(
      props,
      props.rootNodeId,
      { xScale: scaleLinear(), yScale: scaleLinear() },
    );

    this.state = {
      layout,
      processedData,
      xScale,
      yScale,
    };
  }

  componentDidMount() {
    this.clickTimeout = null;
  }

  componentWillReceiveProps(nexProps) {
    const layout = this.state.layout.size([nexProps.width, nexProps.height]);

    // Data Processing
    const processedData = layout(nexProps.data)
      .descendants()
      .filter(({ depth }) => depth < nexProps.showToDepth);

    const {
      xScale,
      yScale,
    } = Treemap.getScales(nexProps, nexProps.rootNodeId, this.state);

    this.setState({
      layout,
      processedData,
      xScale,
      yScale,
    });
  }

  handleClicks = (event, data, component) => {
    if (this.clickTimeout !== null) {
      this.props.onDoubleClick(event, data, component);
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    } else {
      this.clickTimeout = setTimeout(() => {
        this.props.onClick(event, data, component);
        clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
      }, DOUBLE_CLICK_TIMING);
    }
  }

  getLayout = () => {
    const {
      layoutOptions: {
        padding,
        round,
        tile,
      },
      width,
      height,
    } = this.props;

    return treemap()
      .tile(tile)
      .round(round)
      .size([width, height])
      .padding(padding);
  }

  sizingProperties = d => {
    const [minValue, maxValue] = this.props.fontSize;
    const x = max([0, Math.floor(((d.x1 - d.x0) - FONT_PADDING_DEFAULT))]);
    const y = max([0, Math.floor(((d.y1 - d.y0) - FONT_PADDING_DEFAULT))]);
    const label = d.data.location_name;
    const width = stringWidth(label, FONT_SIZE_DEFAULT) / FONT_SIZE_DEFAULT;
    const direction = (y > x && (width * (minValue + 1)) > x) ? 'topBottom' : 'leftRight';
    return {
      x,
      y,
      width,
      direction,
      minValue,
      maxValue,
    };
  }

  fontSize = d => {
    const {
      x,
      y,
      width,
      direction,
      minValue,
      maxValue,
    } = this.sizingProperties(d);
    let size;
    if (direction === 'leftRight') {
      size = (y < (x / width)) ? y : (x / width);
    }
    if (direction === 'topBottom') {
      size = (x < (y / width)) ? x : (y / width);
    }
    if (size < minValue) {
      size = 0;
    }
    if (size >= maxValue) {
      size = maxValue;
    }
    return size;
  }

  fontDirection = d => {
    const { direction } = this.sizingProperties(d);
    const orientation = {
      leftRight: `translate(${FONT_MARGIN_DEFAULT}px, ${this.fontSize(d)}px) rotate(0)`,
      topBottom: `translate(${this.fontSize(d) / FONT_MARGIN_DEFAULT}px, ${FONT_MARGIN_DEFAULT}px) rotate(90deg)`,
    };
    return (direction === 'leftRight') ? orientation.leftRight : orientation.topBottom;
  }

  renderRect = d => {
    const {
      colorScale,
      onMouseMove,
      onMouseLeave,
      onMouseOver,
      stroke,
      strokeWidth,
    } = this.props;

    const {
      xScale,
      yScale,
    } = this.state;

    return (
      <Rectangle
        data={d}
        key={`rect-${d.id}`}
        fill={colorScale(d.data.type)}
        strokeWidth={strokeWidth}
        stroke={stroke}
        width={xScale(d.x1) - xScale(d.x0)}
        height={yScale(d.y1) - yScale(d.y0)}
        onClick={this.handleClicks}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      />
    );
  }

  renderText = (d, dropshadow = '') => ((
    <text
      fill={dropshadow ? '#000' : '#fff'}
      filter={dropshadow}
      key={`text-${d.id}-${dropshadow}`}
      style={{
        fontSize: this.fontSize(d),
        transform: this.fontDirection(d),
      }}
    >
      {d.data[this.props.fieldAccessors.label]}
    </text>
  ))

  renderCell = d => {
    const { defsUrl } = this.props;

    const {
      xScale,
      yScale,
    } = this.state;

    return (
      <g
        key={`cell-${d.id}`}
        style={{transform: `translate(${xScale(d.x0)}px, ${yScale(d.y0)}px)`}}
      >
        {this.renderRect(d)}
        {defsUrl && this.renderText(d, defsUrl)}
        {this.renderText(d)}
      </g>
    );
  }

  render() {
    return <g>{this.state.processedData.map(this.renderCell)}</g>;
  }
}
