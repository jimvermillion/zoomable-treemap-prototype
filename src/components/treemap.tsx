import {
  treemap,
  treemapResquarify,
} from 'd3';
import { max } from 'd3-array';
import React from 'react';

import { stringWidth } from '../utils';

const FONT_SIZE_DEFAULT = 12;
const FONT_PADDING_DEFAULT = 8;

// Eventually handle dynamically with reference to space available

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
  fieldAccessors: TreemapFieldAccessors;
  height: number;
  showToDepth: number;
  stroke: string;
  strokeWidth: number | string;
  layoutOptions: LayoutOptions;
  textDropshadow: string;
  width: number;
  fontSize: any;
}

interface TreemapState {
  layout: any;
}

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
    showToDepth: 1,
    stroke: '#fff',
    strokeWidth: 1,
  };

  constructor(props) {
    super(props);
    this.state = { layout: this.getLayout() };
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

  renderRect = d => ((
    <rect
      key={`rect-${d.id}`}
      fill={this.props.colorScale(d.data.type)}
      strokeWidth={this.props.strokeWidth}
      stroke={this.props.stroke}
      width={d.x1 - d.x0}
      height={d.y1 - d.y0}
    />
  ))

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

  renderCell = d => ((
    <g
      key={`cell-${d.id}`}
      style={{ transform: `translate(${d.x0}px, ${d.y0}px)` }}
    >
      {this.renderRect(d)}
      {this.props.textDropshadow && this.renderText(d, this.props.textDropshadow)}
      {this.renderText(d)}
    </g>
  ))

  render() {
    const {
      data,
      showToDepth,
    } = this.props;

    // Data Processing
    const layout = this.state.layout(data)
      .descendants()
      .filter(({ depth }) => depth < showToDepth);

    return (
      <g>
        {layout.map(this.renderCell)}
      </g>
    );
  }
}
