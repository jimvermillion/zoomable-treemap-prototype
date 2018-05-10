import {
  treemap,
  treemapResquarify,
} from 'd3';
import { max } from 'd3-array';
import noop from 'lodash-es/noop';
import React from 'react';

import Rectangle from './Rectangle';

import { stringWidth } from '../utils';

const FONT_SIZE_DEFAULT = 12;
const FONT_PADDING_DEFAULT = 8;

interface TreemapFieldAccessors {
  label: string;
}

interface LayoutOptions {
  padding: number | number[];
  round: boolean;
  tile: any;
}

interface TreemapProps {
  colorScale: (input: number | string) => string;
  data: any;
  defsUrl?: string;
  fieldAccessors: TreemapFieldAccessors;
  fontSize: number[];
  height: number;
  layoutOptions: LayoutOptions;
  onClick?: (...args: any[]) => void;
  onDoubleClick?: (...args: any[]) => void;
  onMouseLeave?: (...args: any[]) => void;
  onMouseMove?: (...args: any[]) => void;
  onMouseOver?: (...args: any[]) => void;
  showToDepth: number;
  stroke: string;
  strokeWidth: number | string;
  width: number;
  xScale: (num: number) => number;
  yScale: (num: number) => number;
}

interface TreemapState {
  layout: any;
}

// Time to wait to execute one click (milliseconds)
const DOUBLE_CLICK_TIMING = 250;

export default class Treemap extends React.Component<
  TreemapProps,
  TreemapState
> {
  static defaultProps: Partial<TreemapProps> = {
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
    strokeWidth: 1,
  };

  clickTimeout: any;

  constructor(props) {
    super(props);
    this.state = { layout: this.getLayout() };
  }

  componentDidMount() {
    this.clickTimeout = null;
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
      leftRight: `translate(3px, ${this.fontSize(d)}px) rotate(0)`,
      topBottom: `translate(${this.fontSize(d) / 3}px, 3px) rotate(90deg)`,
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
      xScale,
      yScale,
    } = this.props;

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
    const {
      defsUrl,
      xScale,
      yScale,
    } = this.props;

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
    const {
      data,
      showToDepth,
    } = this.props;

    // Data Processing
    const layout = this.state.layout(data)
      .descendants()
      .filter(({ depth }) => depth <= showToDepth);

    return (
      <g>
        {layout.map(this.renderCell)}
      </g>
    );
  }
}
