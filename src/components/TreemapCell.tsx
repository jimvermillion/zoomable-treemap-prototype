import React from 'react';

import DoubleClickReactComponent, {
  DoubleClickComponentProps,
} from '../components/DoubleClickReactComponent';
import TreemapRectangle from './TreemapRectangle';
import TreemapText from './TreemapText';

const ATTRIBUTION_OPACITY = 0.5;

interface AttributionFieldAccessors {
  name: string;
  fill?: string;
}

interface TreemapFieldAccessors {
  label: string;
  attribution?: AttributionFieldAccessors;
}

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
  colorScale?: (input: number | string) => string; // TODO: audit props
  datum: any;
  defsUrl: string;
  fieldAccessors: TreemapFieldAccessors;
  fontPadding: number;
  fontSizeExtent: [number, number];
  onClick: (...args: any[]) => void;
  onDoubleClick: (...args: any[]) => void;
  onMouseLeave: (...args: any[]) => void;
  onMouseMove: (...args: any[]) => void;
  onMouseOver: (...args: any[]) => void;
  shouldRenderAttribution?: boolean;
  stroke: string;
  strokeWidth: number | string;
  processedDatum: TreemapCellProcessedDatum;
}

export default class TreemapCell
extends DoubleClickReactComponent<TreemapCellProps, {}> {
  static defaultProps = {
    animate: false,
    doubleClickTiming: 250,
    shouldRenderAttribution: false,
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
    // TODO: this is now a mess. Clarify ...this.props.
    <TreemapText
      key={`text-${datum.id}-${dropshadow}`}
      {...this.props}
      datum={datum}
      filterDefsUrl={dropshadow}
      label={this.props.processedDatum.label}
    />
  ))

  attributionWidth = ({ x0, x1 }) => {
    const {
      datum: { data },
      fieldAccessors: { attribution }, // TODO: ANYTHING THAT NEEDS A PROP RESOLVER, DO IN TREEMAP
    } = this.props;

    if (data[attribution.name]) {
      const { value } = data[attribution.name];
      const cellWidth = x1 - x0;
      return (cellWidth * value);
    }

    return 0;
  }

  renderAttribution = ({
    height,
    ...processedData,
  }: TreemapCellProcessedDatum) => {
    const {
      attributionFill,
      datum,
      onMouseMove,
      onMouseLeave,
      onMouseOver,
      strokeWidth,
    } = this.props;

    const transformBy = Number(strokeWidth) / 2;

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
        width={this.attributionWidth(processedData) - Number(strokeWidth)}
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
      shouldRenderAttribution,
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
        {shouldRenderAttribution && this.renderAttribution(processedDatum)}
        {defsUrl && this.renderText(datum, defsUrl)}
        {this.renderText(datum)}
      </g>
    );
  }
// TODO: reinstall singular animation work. Both may be the best implementation.
  render() {
    const {
      // datum,
      processedDatum,
    } = this.props;

    return this.renderCell(
      processedDatum,
      // || TreemapCell.getDatumProcessor(this.props)(datum),
    );
  }
}
