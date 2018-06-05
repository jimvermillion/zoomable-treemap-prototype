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
import findIndex from 'lodash-es/findIndex';
import noop from 'lodash-es/noop';
import partial from 'lodash-es/partial';
import sortBy from 'lodash-es/sortBy';
import React from 'react';
import {
  NodeGroup,
} from 'react-move';

import TreemapCell from '../components/TreemapCell';
import TreemapText from '../components/TreemapText';

import { animationProcessorFactory } from '../utils';

const DEFAULT_SCALES = {
  xScale: scaleLinear(),
  yScale: scaleLinear(),
};

const OPACITY_ANIMATION = () => ({
  opacity: [1],
  timing: { delay: 333 },
});

const DEFAULT_OPACITY_ANIMATION = {
  opacity: {
    enter: OPACITY_ANIMATION,
    update: OPACITY_ANIMATION,
    leave: () => ({ opacity: [0], timing: { duration: 666 } }),
  },
};

interface AttributionDataAccessors {
  fill?: string;
  value: string;
}

export interface TreemapDataAccessors {
  label: string;
  attribution?: AttributionDataAccessors;
}

interface LayoutOptions {
  padding: number;
  round: boolean;
  tile: any;
}

interface TreemapProps {
  animate?: any;
  colorScale?: (input: number | string) => string;
  data: any;
  defsUrl?: string;
  doubleClickTiming?: number;
  dataAccessors: TreemapDataAccessors;
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
  selected?: number | number[] | string | string[];
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

export default class Treemap extends React.PureComponent<
  TreemapProps,
  TreemapState
> {
  static defaultProps = {
    animate: DEFAULT_OPACITY_ANIMATION,
    colorScale: scaleOrdinal(schemeCategory10),
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

  /**
   * Set/update state in IHME-UI Fashion.
   */
  static propUpdates = {
    layout: (acc, _, prevProps, nextProps, state) => {
      const animationPropNames = [
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
      const treemapData = Treemap.layoutData(nextProps, layout);

      return {
        ...acc,
        layout,
        treemapData,
      };
    },
    animationProcessor: (acc, _, prevProps, nextProps, state) => {
      const animationPropNames = [
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
        scales,
      };
    },
  };

  /**
   * Get or update a treemap layout function.
   */
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

  /**
   * Get data laid out in a treemap form.
   */
  static layoutData({ data, showToDepth, rootNodeId, selection }, layout) {
    const unsorted = layout(data).descendants();

    const filtered = unsorted.filter(({ children, depth, ...node }) => (
      // At the current depth
      (depth === showToDepth
      // or at a previous depth without children
      || (depth < showToDepth && !children))
      && Treemap.nodeHasRootAsAncestor(rootNodeId, node)
    ));

    return (
      selection
        ? sortBy(filtered, datum => findIndex(selection, selected => selected.includes(datum.id)))
        : filtered
    );
  }

  static nodeHasRootAsAncestor(rootNodeId, node) {
    // If no active root node, do not exclude.
    if (!rootNodeId) {
      return true;
    }
    // If `node` is the root node, return true.
    if (node.id === rootNodeId) {
      return true;
    }
    // If we've reaced the base of the hierarchy without finding the root return false
    if (!node.parent) {
      return false;
    }
    // recur.
    return Treemap.nodeHasRootAsAncestor(rootNodeId, node.parent);
  }

  /**
   * Get current x/y scales.
   */
  static getScales(props, { xScale, yScale } = DEFAULT_SCALES) {
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
   * Get x/y domain set by a HierarchyRectangularNode's properties.
   */
  static getDomainsFromNode = ({ x0, x1, y0, y1 }: HierarchyRectangularNode<any>) => ({
    xDomain: [x0, x1],
    yDomain: [y0, y1],
  })

  /**
   * Get a function that fully processes a treemap datum.
   */
  static getDatumProcessor(props, scales) {
    const cellDatumProcessor = Treemap.getCellDatumProcessor(props, scales);
    const textDatumProcessor = Treemap.getTextDatumProcessor(props);

    return datum => {
      // Text processor needs scaled x0, x1, y0, y1.
      const processedCellDatum = cellDatumProcessor(datum);

      return {
        ...textDatumProcessor(datum, processedCellDatum),
        ...processedCellDatum,
      };
    };
  }

  /**
   * Get a function that processes a treemap datum for consumption by a <TreemapCell/> component.
   */
  static getCellDatumProcessor({ dataAccessors: { attribution } }, scales) {
    const cellDatumProcessor = TreemapCell.getDatumProcessor(scales);

    return (datum) => {
      // Resolve props with datum.
      const attributionValue = datum.data[attribution.value];
      const attributionFill = datum.data[attribution.fill];

      return {
        attributionFill,
        attributionValue,
        ...cellDatumProcessor(datum),
      };
    };
  }

  /**
   * Get a function that processes a treemap datum for consumption by a <TreemapText/> component.
   */
  static getTextDatumProcessor(props) {
    return (datum, { height: boundingHeight, width: boundingWidth }) => {
      // Get the label from the datum.
      const label = datum.data[props.dataAccessors.label];

      // Assemble `props` needed by `<TreemapText/>`.
      const textProps = {
        boundingHeight,
        boundingWidth,
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
      doubleClickTiming,
      defsUrl,
      dataAccessors,
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

    return (
      <TreemapCell
        key={key}
        cellFill={colorScale(datum.data.type)}
        datum={datum}
        defsUrl={defsUrl}
        dataAccessors={dataAccessors}
        doubleClickTiming={doubleClickTiming}
        fontPadding={fontPadding}
        fontSizeExtent={fontSizeExtent}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onMouseOver={onMouseOver}
        stroke={stroke}
        strokeWidth={strokeWidth}
        {...processedDatum}
      />
    );
  }

  renderTreemap = (processedData) => (
    <g>
      {processedData.map(this.renderTreemapCell)}
    </g>
  )

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
        {this.renderTreemap}
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
