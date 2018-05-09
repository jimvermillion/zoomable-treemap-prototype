import { treemap, treemapResquarify } from 'd3';
import { max } from "d3-array";
import React from 'react';

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
  width: number;
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

    stringWidth = (stringThing, size = 12) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            context.font = `${size}px Verdana`;
            return Math.ceil(context.measureText(stringThing).width);
        }
        return 0;
    }

    _fontSize = d => {
        const minValue = 10;
        const maxValue = 48;

        const x = max([0, Math.floor(((d.x1 - d.x0) - 8))]);
        const y = max([0, Math.floor(((d.y1 - d.y0) - 8))]);

        let size;
        const label = d.data.location_name;
        const width = (this.stringWidth(label, 12) / 12);
        const direction = ((y > x && (width * (minValue + 1)) > x) ? 'tb' : 'lr');

        if (direction === 'lr') { size = (y < (x / width)) ? y : (x / width); }
        if (direction === 'tb') { size = (x < (y / width)) ? x : (y / width); }

        if (size < minValue) { size = 0; }
        if (size >= maxValue) { size = maxValue; }

        return size;
    }

    _fontDirection = d => {
        const min = 10;
        const x = max([0, Math.floor(((d.x1 - d.x0) - 8))]);
        const y = max([0, Math.floor(((d.y1 - d.y0) - 8))]);
        const label = d.data.location_name;
        const width = this.stringWidth(label, 12) / 12;
        const direction = (y > x && (width * (min + 1)) > x) ? 'tb' : 'lr';
        const lr = `translate(3px, ${this._fontSize(d)}px) rotate(0)`;
        const tb = `translate(${this._fontSize(d) / 3}px, 3px) rotate(90deg)`;
        return (direction === 'lr') ? lr : tb;
    }

  renderText = (d) => ((
    <text
      key={`text-${d.id}`}
      style={{
        fontSize: this._fontSize(d),
        transform: this._fontDirection(d),
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
