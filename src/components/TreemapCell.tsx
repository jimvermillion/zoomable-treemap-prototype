import { ScaleLinear } from 'd3-scale';
import partial from 'lodash-es/partial';
import React from 'react';
import { Animate } from 'react-move';

import DoubleClickReactComponent, {
  DoubleClickComponentProps,
} from '../components/DoubleClickReactComponent';
import TreemapRectangle from './TreemapRectangle';
import TreemapText from './TreemapText';

import { animationProcessorFactory } from '../utils/animate';

const ATTRIBUTION_OPACITY = 0.5;
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

interface TreemapCellProcessedData {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  opacity: number;
  height: number;
  width: number;
}

interface TreemapCellProps extends DoubleClickComponentProps {
  animate?: any;
  colorScale: (input: number | string) => string;
  datum: any;
  defsUrl: string;
  fieldAccessors: TreemapFieldAccessors;
  onClick: (...args: any[]) => void;
  onDoubleClick: (...args: any[]) => void;
  onMouseLeave: (...args: any[]) => void;
  onMouseMove: (...args: any[]) => void;
  onMouseOver: (...args: any[]) => void;
  stroke: string;
  strokeWidth: number | string;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export default class TreemapCell
extends DoubleClickReactComponent<TreemapCellProps, {}> {
  static defaultProps = {
    animate: DEFAULT_OPACITY_ANIMATION,
    doubleClickTiming: 250,
  };

  static animatable = [
    'x0',
    'x1',
    'y0',
    'y1',
    'opacity',
    'height',
    'width',
  ];

  static datumProcessor({ xScale, yScale, datum }) {
    const x0 = Math.max(0, xScale(datum.x0));
    const x1 = Math.max(0, xScale(datum.x1));
    const y0 = Math.max(0, yScale(datum.y0));
    const y1 = Math.max(0, yScale(datum.y1));

    return (_?): TreemapCellProcessedData => ({
      x0,
      x1,
      y0,
      y1,
      opacity: 0,
      height: Math.max(0, y1 - y0),
      width: Math.max(0, x1 - x0),
    });
  }

  renderText = (datum, dropshadow?) => ((
    <TreemapText
      key={`text-${datum.id}-${dropshadow}`}
      datum={datum}
      filterDefsUrl={dropshadow}
      label={datum.data[this.props.fieldAccessors.label]}
    />
  ))

  attributionWidth = ({ x0, x1 }) => {
    const {
      datum: { data },
      fieldAccessors: { attribution },
    } = this.props;

    if (data[attribution.name]) {
      const {value} = data[attribution.name];
      const cellWidth = x1 - x0;
      return (cellWidth * value);
    }

    return 0;
  }

  renderAttribution = ({
    height,
    ...processedData,
  }: TreemapCellProcessedData) => {
    const {
      datum,
      onMouseMove,
      onMouseLeave,
      onMouseOver,
      strokeWidth,
      fieldAccessors: { attribution },
    } = this.props;

    const fill = (
      datum.data[attribution.name]
      && datum.data[attribution.name][attribution.fill]
    );

    const transformBy = Number(strokeWidth) / 2;

    return (
      <TreemapRectangle
        key={`attr-${datum.id}`}
        data={datum}
        fill={fill}
        height={Math.max(0, height - Number(strokeWidth))}
        onClick={this.handleClicks}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onMouseOver={onMouseOver}
        opacity={ATTRIBUTION_OPACITY}
        transform={`translate(${transformBy}, ${transformBy})`}
        width={this.attributionWidth(processedData) - Number(strokeWidth)}
      />
    );
  }

  renderRect = ({
    height,
    width,
  }) => {
    const {
      colorScale,
      datum,
      onMouseMove,
      onMouseLeave,
      onMouseOver,
      stroke,
      strokeWidth,
    } = this.props;

    return (
      <TreemapRectangle
        data={datum}
        key={`rect-${datum.id}`}
        fill={colorScale(datum.data.type)}
        strokeWidth={strokeWidth}
        stroke={stroke}
        width={width}
        height={height}
        onClick={this.handleClicks}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      />
    );
  }

  renderCell = processedDatum => {
    const {
      datum,
      defsUrl,
      fieldAccessors: { attribution },
    } = this.props;

    const {
      x0,
      y0,
      opacity,
    } = processedDatum;

    return (
      <g
        style={{
          opacity: opacity as number,
          transform: `translate(${x0}px, ${y0}px)`,
        }}
      >
        {this.renderRect(processedDatum)}
        {(datum.data[attribution.name]) && this.renderAttribution(processedDatum)}
        {defsUrl && this.renderText(datum, defsUrl)}
        {this.renderText(datum)}
      </g>
    );
  }

  renderAnimatedCell = () => {
    const {
      animate,
      datum: _,
    } = this.props;

    const animationProcessor = partial(
      animationProcessorFactory,
      animate,
      TreemapCell.animatable,
      TreemapCell.datumProcessor(this.props),
    );

    return (
      <Animate
        start={animationProcessor('start')(_)}
        enter={animationProcessor('enter')(_)}
        update={animationProcessor('update')(_)}
        leave={animationProcessor('leave')(_)}
      >
        {this.renderCell}
      </Animate>
    );
  }

  shouldAnimate() {
    return !!this.props.animate;
  }

  render() {
    if (this.shouldAnimate()) {
      return this.renderAnimatedCell();
    }

    const processedDatum = TreemapCell.datumProcessor(this.props)();
    return this.renderCell(processedDatum);
  }
}
