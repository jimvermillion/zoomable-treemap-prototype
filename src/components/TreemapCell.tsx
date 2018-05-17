import { ScaleLinear } from 'd3-scale';
import React from 'react';

import DoubleClickReactComponent, { DoubleClickComponentProps } from '../components/DoubleClickReactComponent';
import Rectangle from './Rectangle';
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

interface TreemapCellProps extends DoubleClickComponentProps {
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
  renderText = (datum, dropshadow?) => ((
    <TreemapText
      key={`text-${datum.id}-${dropshadow}`}
      datum={datum}
      filterDefsUrl={dropshadow}
      label={datum.data[this.props.fieldAccessors.label]}
    />
  ))

  attributionWidth = ({ data, x1, x0 }) => {
    const {
      fieldAccessors: { attribution },
      xScale,
    } = this.props;

    if (data[attribution.name]) {
      const {value} = data[attribution.name];
      const cellWidth = xScale(x1) - xScale(x0);
      return (cellWidth * value);
    }

    return 0;
  }

  renderAttribution = d => {
    const {
      onMouseMove,
      onMouseLeave,
      onMouseOver,
      strokeWidth,
      fieldAccessors: {attribution: {name: attributionName, fill: attributionFill}},
      yScale,
    } = this.props;

    const fill = d.data[attributionName] && d.data[attributionName][attributionFill];

    const transformBy = Number(strokeWidth) / 2;

    return (
      <Rectangle
        key={`attr-${d.id}`}
        data={d}
        fill={fill}
        height={yScale(d.y1) - yScale(d.y0) - Number(strokeWidth)}
        onClick={this.handleClicks}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onMouseOver={onMouseOver}
        opacity={ATTRIBUTION_OPACITY}
        transform={`translate(${transformBy}, ${transformBy})`}
        width={this.attributionWidth(d) - Number(strokeWidth)}
      />
    );
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

  render() {
    const {
      datum,
      defsUrl,
      fieldAccessors: { attribution },
      xScale,
      yScale,
    } = this.props;

    return (
      <g
        style={{transform: `translate(${xScale(datum.x0)}px, ${yScale(datum.y0)}px)`}}
      >
        {this.renderRect(datum)}
        {(datum.data[attribution.name]) ? this.renderAttribution(datum) : null}
        {defsUrl && this.renderText(datum, defsUrl)}
        {this.renderText(datum)}
      </g>
    );
  }
}
