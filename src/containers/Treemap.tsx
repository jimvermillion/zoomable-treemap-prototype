import {
  HierarchyNode,
  HierarchyRectangularNode,
  treemap,
  TreemapLayout,
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
import includes from 'lodash-es/includes';
import noop from 'lodash-es/noop';
import partial from 'lodash-es/partial';
import sortBy from 'lodash-es/sortBy';
import React from 'react';
import { NodeGroup } from 'react-move';

import TreemapCell from '../components/TreemapCell';
import TreemapText from '../components/TreemapText';

import {
  AnimateProp,
  AnimationProcessor,
  DatumProcessor,
  TreemapCellProcessedDatum,
  TreemapProcessedDatum,
} from '../types';
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
    leave: () => ({
      opacity: [0],
      timing: { duration: 666 },
    }),
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

export interface TreemapDatum {
  [key: string]: any;
}

type TreemapEventHandler = (
  event: React.MouseEvent<any>,
  data: TreemapDatum,
  component: TreemapCell,
) => void;

type Extent = [number, number];

interface DomainRangeSet {
  xDomain: Extent;
  xRange: Extent;
  yDomain: Extent;
  yRange: Extent;
}

type NodeId = number | string;

interface TreemapProps {
  animate?: AnimateProp;
  colorScale?: (input: number | string) => string;
  data: HierarchyNode<TreemapDatum>;
  defsUrl?: string;
  doubleClickTiming?: number;
  dataAccessors: TreemapDataAccessors;
  focused?: string | number;
  focusedStyle?: React.CSSProperties;
  fontMargin?: number;
  fontPadding?: number;
  fontSize?: number;
  fontSizeExtent?: [number, number];
  height: number;
  layoutOptions?: LayoutOptions;
  onClick?: TreemapEventHandler;
  onDoubleClick?: TreemapEventHandler;
  onMouseEnter?: TreemapEventHandler;
  onMouseLeave?: TreemapEventHandler;
  onMouseMove?: TreemapEventHandler;
  onMouseOver?: TreemapEventHandler;
  rootNodeId?: NodeId;
  selectedStyle?: React.CSSProperties;
  selection?: number[] | string[];
  showToDepth: number;
  stroke?: string;
  strokeWidth?: number | string;
  style?: React.CSSProperties;
  width: number;
}

interface TreemapStateBase {
  animationProcessor: AnimationProcessor;
  datumProcessor: DatumProcessor<TreemapDatum, TreemapProcessedDatum>;
  layout: TreemapLayout<TreemapDatum>;
  treemapData: Array<HierarchyRectangularNode<TreemapDatum>>;
}

export interface ScaleSet {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

type TreemapState = TreemapStateBase & ScaleSet;

export default class Treemap
extends React.PureComponent<
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
    onMouseEnter: noop,
    onMouseLeave: noop,
    onMouseMove: noop,
    showToDepth: 1,
    stroke: '#fff',
    strokeWidth: 3,
  };

  // Common prop names for Treemap.propUpdates to compare `props`/`nextProps`
  static dataPropNames = [
    'animate',
    'data',
    'focused',
    'height',
    'width',
    'rootNodeId',
    'showToDepth',
    'selection',
  ];

  /**
   * Set/update state in IHME-UI Fashion.
   */
  static propUpdates = {
    // Initialize/update treemap-layout function.
    layout: (acc, _, prevProps, nextProps, state) => {
      if (!propsChanged(prevProps, nextProps, Treemap.dataPropNames)) {
        return acc;
      }
      return {
        ...acc,
        layout: Treemap.getLayout(nextProps, state && state.layout),
      };
    },
    // Process data through the treemap layout.
    treemapData: (acc, _, prevProps, nextProps) => {
      if (!propsChanged(prevProps, nextProps, Treemap.dataPropNames)) {
        return acc;
      }
      return {
        ...acc,
        treemapData: Treemap.layoutData(nextProps, acc.layout),
      };
    },
    // Get initial x/y scales.
    scales: (acc, _, prevProps, nextProps, state) => {
      if (!propsChanged(prevProps, nextProps, Treemap.dataPropNames)) {
        return acc;
      }
      return {
        ...acc,
        scales: Treemap.getScales(nextProps, state),
      };
    },
    // Establish datum processor.
    datumProcessor: (acc, _, prevProps, nextProps) => {
      if (!propsChanged(prevProps, nextProps, Treemap.dataPropNames)) {
        return acc;
      }
      return {
        ...acc,
        datumProcessor: Treemap.getDatumProcessor(nextProps, acc.scales),
      };
    },
    // Get animation processor.
    animationProcessor: (acc, _, prevProps, nextProps) => {
      if (!propsChanged(prevProps, nextProps, Treemap.dataPropNames)) {
        return acc;
      }
      const animationProcessor = partial(
        animationProcessorFactory,
        nextProps.animate,
        [...TreemapCell.animatable, ...TreemapText.animatable],
        acc.datumProcessor,
      );
      return {
        ...acc,
        animationProcessor,
      };
    },
  };

  /**
   * Get or update a treemap layout function.
   */
  static getLayout = (
    {
      width,
      height,
      layoutOptions,
    }: TreemapProps,
    layout?: TreemapLayout<TreemapDatum>,
  ): TreemapLayout<TreemapDatum> => {
    if (layout) {
      // If a layout already exists, return it with an updated height.
      return layout.size([width, height]);
    }

    const {
      padding,
      round,
      tile,
    } = layoutOptions;

    return treemap()
      .tile(tile)
      .round(round)
      .size([width, height])
      .padding(padding);
  }

  /**
   * Get data laid out in a treemap form.
   */
  static layoutData(
    {
      data,
      focused,
      showToDepth,
      rootNodeId,
      selection,
    }: TreemapProps,
    layout: TreemapLayout<TreemapDatum>,
  ): Array<HierarchyRectangularNode<TreemapDatum>> {
    // Get d3-treemap-ified data.
    const unsorted = layout(data).descendants();

    // Filter data for what is to be shown.
    const filtered = unsorted.filter(({ children, depth, ...node }) => (
      // At the current depth
      (depth === showToDepth
      // or at a previous depth without children
      || (depth < showToDepth && !children))
      && Treemap.nodeHasRootAsAncestor(rootNodeId, node)
    ));

    // Array of `focused` id, and `selection` ids.
    const selectedAndFocused = [...(selection || []), focused];

    // Sort the data, leaving any selected Ids on top of treemap.
    return sortBy(filtered, datum => findIndex(selectedAndFocused, select => select === datum.id));
  }

  static nodeHasRootAsAncestor(
    rootNodeId: TreemapProps['rootNodeId'],
    node: Partial<HierarchyRectangularNode<TreemapDatum>>,
  ) {
    // If no active root node, do not exclude.
    if (!rootNodeId) {
      return true;
    }
    // If `node` is the root node, return true.
    if (node.id === String(rootNodeId)) {
      return true;
    }
    // If we've reached the base of the hierarchy without finding the root, return false.
    if (!node.parent) {
      return false;
    }
    // recur.
    return Treemap.nodeHasRootAsAncestor(rootNodeId, node.parent);
  }

  /**
   * Get current x/y scales.
   */
  static getScales(
    props: TreemapProps,
    { xScale, yScale }: ScaleSet = DEFAULT_SCALES,
  ): Partial<TreemapState> {
    // Get root node that has been isolated.
    const node = Treemap.getNodeById(
      props.rootNodeId,
      props.data as HierarchyRectangularNode<TreemapDatum>,
    );

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
  static getNodeById(
    id: NodeId,
    root: HierarchyRectangularNode<TreemapDatum>,
  ): HierarchyRectangularNode<TreemapDatum> | null {
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
  static getDomainsAndRanges(
    props: TreemapProps,
    rootNode?: HierarchyRectangularNode<TreemapDatum>,
  ): DomainRangeSet {
    // Establish domain and range for `height` and `width`.
    const domainAndRangeFromProps = Treemap.getDomainsAndRangesFromProps(props);

    // Get domain for a root node if it exists.
    const domainFromNode = rootNode ? Treemap.getDomainsFromNode(rootNode) : {};

    // Override height and width domain/range if root node if present.
    return {
      ...domainAndRangeFromProps,
      ...domainFromNode,
    };
  }

  /**
   * Get x/y domain and range set from props.
   */
  static getDomainsAndRangesFromProps = (
    { height, width }: Partial<TreemapProps>,
  ): DomainRangeSet => {
    const x: Extent = [0, width];
    const y: Extent = [0, height];

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
  static getDomainsFromNode = (
    { x0, x1, y0, y1 }: HierarchyRectangularNode<TreemapDatum>,
  ): Partial<DomainRangeSet> => ({
    xDomain: [x0, x1],
    yDomain: [y0, y1],
  })

  /**
   * Get a function that fully processes a treemap datum.
   */
  static getDatumProcessor(
    props: TreemapProps,
    scales: ScaleSet,
  ): (datum: HierarchyRectangularNode<TreemapDatum>) => Partial<TreemapProcessedDatum> {
    const cellDatumProcessor = Treemap.getCellDatumProcessor(props, scales);
    const textDatumProcessor = Treemap.getTextDatumProcessor(props);

    return datum => {
      // Text processor needs scaled x0, x1, y0, y1.
      const processedCellDatum = cellDatumProcessor(datum);

      return {
        ...textDatumProcessor(datum, processedCellDatum as TreemapCellProcessedDatum),
        ...processedCellDatum,
      };
    };
  }

  /**
   * Get a function that processes a treemap datum for consumption by a <TreemapCell/> component.
   */
  static getCellDatumProcessor(
    { dataAccessors: { attribution } }: TreemapProps,
    scales: ScaleSet,
  ): (datum: HierarchyRectangularNode<TreemapDatum>) => Partial<TreemapProcessedDatum> {
    const cellDatumProcessor = TreemapCell.getDatumProcessor(scales);
    // TODO: this is tagged for prop resolver work!
    return datum => {
      // Resolve props with datum.
      const attributionValue = (
        attribution
        && attribution.value
        && datum.data[attribution.value]
      );

      const attributionFill = (
        attribution
        && attribution.fill
        && datum.data[attribution.fill]
      );

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
  static getTextDatumProcessor(
    props: TreemapProps,
  ): (datum: TreemapDatum, cellDatum: TreemapCellProcessedDatum) => Partial<TreemapProcessedDatum> {
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

    return treemapData.map(datum => ({
      data: datum,
      key: `cell-${datum.id}`,
      state: datumProcessor(datum),
    }));
  }

  renderTreemapCell = ({
    data: datum,
    key,
    state: processedDatum,
  }) => {
    const {
      animate,
      colorScale,
      doubleClickTiming,
      defsUrl,
      dataAccessors,
      focused,
      focusedStyle,
      fontPadding,
      fontSizeExtent,
      onClick,
      onDoubleClick,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      onMouseOver,
      selection,
      selectedStyle,
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
        focused={focused === datum.id}
        focusedStyle={focusedStyle}
        fontPadding={fontPadding}
        fontSizeExtent={fontSizeExtent}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onMouseOver={onMouseOver}
        opacity={animate ? opacity : 1}
        selected={includes(selection, datum.id)}
        selectedStyle={selectedStyle}
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
    return !!this.props.animate;
  }

  render() {
    if (this.shouldAnimate()) {
      return this.renderAnimatedTreemap();
    }

    const processedData = this.processData();
    return this.renderTreemap(processedData);
  }
}
