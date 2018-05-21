import React from 'react';

import DoubleClickReactComponent, {
  DoubleClickComponentProps,
} from '../components/DoubleClickReactComponent';
import { TreemapDataAccessors } from '../containers/Treemap';
import TreemapRectangle from './TreemapRectangle';
import TreemapText from './TreemapText';

const ATTRIBUTION_OPACITY = 0.5;

interface TreemapCellProps extends DoubleClickComponentProps {
  animate?: any;
  attributionFill: string;
  attributionValue?: number;
  cellFill: string;
  colorScale?: (input: number | string) => string;
  dataAccessors: TreemapDataAccessors;
  datum: any;
  defsUrl: string;
  fontPadding: number;
  fontSizeExtent: [number, number];
  height: number;
  label: string;
  onClick: (...args: any[]) => void;
  onDoubleClick: (...args: any[]) => void;
  onMouseLeave: (...args: any[]) => void;
  onMouseMove: (...args: any[]) => void;
  onMouseOver: (...args: any[]) => void;
  opacity: number;
  rotate: number;
  stroke: string;
  strokeWidth: number | string;
  width: number;
  x0: number;
  x1: number;
  x_translate: number;
  y0: number;
  y1: number;
  y_translate: number;
}

export default class TreemapCell
extends DoubleClickReactComponent<TreemapCellProps, {}> {
  static defaultProps = {
    animate: false,
    doubleClickTiming: 250,
    attributionValue: false,
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

  static getDatumProcessor({ xScale, yScale }) {
    return (datum) => {
      const x0 = xScale(datum.x0);
      const x1 = xScale(datum.x1);
      const y0 = yScale(datum.y0);
      const y1 = yScale(datum.y1);

      return {
        x0,
        x1,
        y0,
        y1,
        opacity: 0,
        height: y1 - y0,
        width: x1 - x0,
      };
    };
  }

  renderText = (datum, dropshadow?) => {
    const {
      label,
      rotate,
      x_translate,
      y_translate,
    } = this.props;

    return (
      <TreemapText
        key={`text-${datum.id}-${dropshadow}`}
        datum={datum}
        filterDefsUrl={dropshadow}
        label={label}
        rotate={rotate}
        x_translate={x_translate}
        y_translate={y_translate}
      />
    );
  }

  renderAttribution = () => {
    const {
      attributionFill,
      attributionValue,
      datum,
      onMouseMove,
      onMouseLeave,
      onMouseOver,
      strokeWidth,
      height,
      width,
    } = this.props;

    const transformBy = Number(strokeWidth) / 2;

    const attributionWidth = (attributionValue * width) - Number(strokeWidth);

    return (
      <TreemapRectangle
        key={`attr-${datum.id}`}
        data={datum}
        fill={attributionFill}
        height={height - Number(strokeWidth)}
        onClick={this.handleClicks}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onMouseOver={onMouseOver}
        opacity={ATTRIBUTION_OPACITY}
        transform={`translate(${transformBy}, ${transformBy})`}
        width={attributionWidth}
      />
    );
  }

  renderRect = () => {
    const {
      cellFill,
      datum,
      onMouseMove,
      onMouseLeave,
      onMouseOver,
      stroke,
      strokeWidth,
      height,
      width,
    } = this.props;

    return (
      <TreemapRectangle
        data={datum}
        key={`rect-${datum.id}`}
        fill={cellFill}
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

  render() {
    const {
      datum,
      defsUrl,
      attributionValue,
      x0,
      y0,
      opacity,
    } = this.props;

    return (
      <g
        key={`cell-${datum.id}`}
        style={{
          opacity: opacity as number,
          transform: `translate(${x0}px, ${y0}px)`,
        }}
      >
        {this.renderRect()}
        {attributionValue && this.renderAttribution()}
        {defsUrl && this.renderText(datum, defsUrl)}
        {this.renderText(datum)}
      </g>
    );
  }
}
