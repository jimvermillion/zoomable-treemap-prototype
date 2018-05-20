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
import {
  propsChanged,
  stateFromPropUpdates,
} from 'ihme-ui';
import noop from 'lodash-es/noop';
import partial from 'lodash-es/partial';
import React from 'react';
import {
  NodeGroup,
} from 'react-move';

import DoubleClickReactComponent, {
  DoubleClickComponentProps,
} from '../components/DoubleClickReactComponent';
import TreemapCell from '../components/TreemapCell';
import TreemapText from '../components/TreemapText';

import { animationProcessorFactory } from '../utils';

const DEFAULT_SCALES = {
  xScale: scaleLinear(),
  yScale: scaleLinear(),
};

const DEFAULT_OPACITY_ANIMATION = {
  opacity: () => ({
    opacity: [1],
    timing: { delay: 333 },
  }),
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
  animate?: any;
  colorScale?: (input: number | string) => string;
  data: any;
  defsUrl?: string;
  fieldAccessors: TreemapFieldAccessors;
  fontPadding?: number;
  fontSize?: number;
  fontSizeExtent?: [number, number];
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
  animationProcessor: any;
  datumProcessor: any;
  layout: any;
  treemapData: any;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export default class Treemap extends DoubleClickReactComponent<
  TreemapProps,
  TreemapState
> {
  static defaultProps = {
    animate: DEFAULT_OPACITY_ANIMATION,
    colorScale: scaleOrdinal(schemeCategory10),
    doubleClickTiming: 250,
    fontPadding: 8,
    fontMargin: 3,
    fontSize: 12,
    fontSizeExtent: [10, 48],
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

  static propUpdates = { // TODO: split up processors when we figure out why it was broken
    animationProcessor: (acc, _, prevProps, nextProps, state) => {
      const animationPropNames = [ // TODO: AUDIT THIS LIST
        'animate',
        'data',
        'height',
        'width',
        'rootNodeId',
        'showToDepth',
      ];

      if (!propsChanged(prevProps, nextProps, animationPropNames)) {
        return acc;
      }

      // Get the `treemap` layout.
      const layout = Treemap.getLayout(nextProps, state && state.layout);

      // Process data through the treemap layout.
      const treemapData = Treemap.processDataWithLayout(nextProps, layout);

      // Get initial x/y scales.
      const scales = Treemap.getScales(nextProps, state);

      // Establish data processor.
      const datumProcessor = Treemap.getDatumProcessor(nextProps, scales);

      // Get animation processor.
      const animationProcessor = partial(
        animationProcessorFactory,
        nextProps.animate,
        [...TreemapCell.animatable, ...TreemapText.animatable],
        datumProcessor,
      );

      return {
        ...acc,
        animationProcessor,
        datumProcessor,
        layout,
        scales,
        treemapData,
      };
    },
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

  static processDataWithLayout({ data, showToDepth }, layout) {
    return layout(data)
      .descendants()
      .filter(({ depth }) => depth <= showToDepth);
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

  static getTextDatumProcessor(props) {
    return (datum) => {
      const label = datum.data[props.fieldAccessors.label];

      const textProps = {
        datum,
        fontPadding: props.fontPadding,
        fontMargin: props.fontMargin,
        fontSize: props.fontSize,
        fontSizeExtent: props.fontSizeExtent,
        label,
      };

      return {
        ...TreemapText.processDatum(textProps),
        label,
      };
    };
  }

  static getCellDatumProcessor({ fieldAccessors }, scales) {
    const cellDatumProcessor = TreemapCell.getDatumProcessor(scales);

    return (datum) => {
      const shouldRenderAttribution = datum.data[fieldAccessors.attribution.name];

      const attributionFill = ( // TODO Use propResolver?
        shouldRenderAttribution
        && datum.data[fieldAccessors.attribution.name][fieldAccessors.attribution.fill]
      );

      return {
        attributionFill,
        shouldRenderAttribution,
        ...cellDatumProcessor(datum),
      };
    };
  }

  static getDatumProcessor(props, scales) {
    const textDatumProcessor = Treemap.getTextDatumProcessor(props);
    const cellDatumProcessor = Treemap.getCellDatumProcessor(props, scales);

    return datum => ({ ...textDatumProcessor(datum), ...cellDatumProcessor(datum) });
  }

  constructor(props) {
    super(props);
    this.state = stateFromPropUpdates(Treemap.propUpdates, {}, props, {});
  }

  componentWillReceiveProps(nextProps) {
    this.setState(stateFromPropUpdates(Treemap.propUpdates, this.props, nextProps, this.state));
  }

  processData() {
    const {
      treemapData,
      datumProcessor,
    } = this.state;

    return treemapData.map(datumProcessor);
  }

  renderTreemapCell = ({
    data: datum,
    key,
    state: processedDatum,
  }) => {
    const {
      colorScale,
      defsUrl,
      fieldAccessors,
      fontPadding,
      fontSizeExtent,
      onClick,
      onDoubleClick,
      onMouseLeave,
      onMouseMove,
      onMouseOver,
      stroke,
      strokeWidth,
    } = this.props;

    const {
      attributionFill,
      shouldRenderAttribution,
    } = processedDatum;

    return (
      <TreemapCell
        key={key}
        attributionFill={attributionFill}
        shouldRenderAttribution={shouldRenderAttribution}
        cellFill={colorScale(datum.data.type)}
        datum={datum}
        defsUrl={defsUrl}
        fieldAccessors={fieldAccessors}
        fontPadding={fontPadding}
        fontSizeExtent={fontSizeExtent}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onMouseOver={onMouseOver}
        processedDatum={processedDatum}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  renderTreemap(processedData) {
    return (
      <g>{processedData.map(this.renderTreemapCell)}</g>
    );
  }

  renderAnimatedTreemap() {
    const {
      animationProcessor,
      treemapData,
    } = this.state;

    return (
      <NodeGroup
        data={treemapData}
        keyAccessor={datum => `cell-${datum.id}`}
        start={animationProcessor('start')}
        enter={animationProcessor('enter')}
        update={animationProcessor('update')}
        leave={animationProcessor('leave')}
      >
        {nodes => <g>{nodes.map(this.renderTreemapCell)}</g>}
     </NodeGroup>);
  }

  shouldAnimate() {
    return this.props.animate;
  }

  render() {
    if (this.shouldAnimate()) {
      return this.renderAnimatedTreemap();
    }

    const processedData = this.processData();
    return this.renderTreemap(processedData);
  }
}
