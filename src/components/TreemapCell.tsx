import React from 'react';

import DoubleClickReactComponent, {
  DoubleClickComponentProps,
} from '../components/DoubleClickReactComponent';
import { TreemapDataAccessors } from '../containers/Treemap';
import TreemapRectangle from './TreemapRectangle';
import TreemapText from './TreemapText';

const ATTRIBUTION_OPACITY = 0.5;

interface TreemapCellProcessedDatum {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  opacity: number;
  height: number;
  width: number;
  label: string;
  x_translate: number;
  y_translate: number;
  rotate: number;
}

interface TreemapCellProps extends DoubleClickComponentProps {
  animate?: any;
  attributionFill: string;
  cellFill: string;
  colorScale?: (input: number | string) => string;
  datum: any;
  defsUrl: string;
  dataAccessors: TreemapDataAccessors;
  fontPadding: number;
  fontSizeExtent: [number, number];
  onClick: (...args: any[]) => void;
  onDoubleClick: (...args: any[]) => void;
  onMouseLeave: (...args: any[]) => void;
  onMouseMove: (...args: any[]) => void;
  onMouseOver: (...args: any[]) => void;
  attributionValue?: number;
  stroke: string;
  strokeWidth: number | string;
  processedDatum: TreemapCellProcessedDatum;
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

  renderText = (datum, dropshadow?) => ((
    <TreemapText
      key={`text-${datum.id}-${dropshadow}`}
      datum={datum}
      filterDefsUrl={dropshadow}
      processedDatum={this.props.processedDatum}
      label={this.props.processedDatum.label}
    />
  ))

  renderAttribution = ({
    height,
    width,
  }: TreemapCellProcessedDatum) => {
    const {
      attributionFill,
      attributionValue,
      datum,
      onMouseMove,
      onMouseLeave,
      onMouseOver,
      strokeWidth,
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

  renderRect = ({
    height,
    width,
  }) => {
    const {
      cellFill,
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

  renderCell = (processedDatum) => {
    const {
      datum,
      defsUrl,
      attributionValue,
    } = this.props;

    const {
      x0,
      y0,
      opacity,
    } = processedDatum;

    return (
      <g
        key={`cell-${datum.id}`}
        style={{
          opacity: opacity as number,
          transform: `translate(${x0}px, ${y0}px)`,
        }}
      >
        {this.renderRect(processedDatum)}
        {attributionValue && this.renderAttribution(processedDatum)}
        {defsUrl && this.renderText(datum, defsUrl)}
        {this.renderText(datum)}
      </g>
    );
  }

  render() {
    const { processedDatum } = this.props;
    return this.renderCell(processedDatum);
  }
}
