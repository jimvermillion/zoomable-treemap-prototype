import {
  treemap,
  treemapResquarify,
} from 'd3';
import React from 'react';

// Eventually handle dynamically with reference to space available
const FONT_SIZE = 14;

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
  data: any,
  fieldAccessors: TreemapFieldAccessors;
  height: number;
  showToDepth: number;
  stroke: string;
  strokeWidth: number | string;
  layoutOptions: LayoutOptions;
  width: number;
};

interface TreemapState {
  layout: any,
};

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
    this.state = { layout: this.getLayout() }
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
  ));

  renderText = (d) => ((
    <text
      key={`text-${d.id}`}
      style={{
        fontSize: FONT_SIZE,
        transform: `translate(3px, ${FONT_SIZE}px)`,
      }}
    >
      {d.data[this.props.fieldAccessors.label]}
    </text>
  ));

  renderCell = d => ((
    <g
      key={`cell-${d.id}`}
      style={{ transform: `translate(${d.x0}px, ${d.y0}px)` }}
    >
      {this.renderRect(d)}
      {this.renderText(d)}
    </g>
  ));

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
