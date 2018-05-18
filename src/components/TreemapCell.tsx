import { ScaleLinear } from 'd3-scale';
import React from 'react';
import { Animate } from 'react-move';

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

  attributionWidth = ({ data, scaled: { x0, x1 } }) => {
    const { fieldAccessors: { attribution } } = this.props;

    if (data[attribution.name]) {
      const {value} = data[attribution.name];
      const cellWidth = x1 - x0;
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
      fieldAccessors: { attribution },
    } = this.props;

    const fill = d.data[attribution.name] && d.data[attribution.name][attribution.fill];

    const transformBy = Number(strokeWidth) / 2;

    const { y0, y1 } = d.scaled;

    return (
      <TreemapRectangle
        key={`attr-${d.id}`}
        data={d}
        fill={fill}
        height={Math.max(0, y1 - y0 - Number(strokeWidth))}
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
    } = this.props;

    const {
      x0, x1, y0, y1,
    } = d.scaled;

    return (
      <TreemapRectangle
        data={d}
        key={`rect-${d.id}`}
        fill={colorScale(d.data.type)}
        strokeWidth={strokeWidth}
        stroke={stroke}
        width={Math.max(0, x1 - x0)}
        height={Math.max(0, y1 - y0)}
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
      <Animate
        start={() => ({
          x0: Math.max(0, xScale(datum.x0)),
          x1: Math.max(0, xScale(datum.x1)),
          y0: Math.max(0, yScale(datum.y0)),
          y1: Math.max(0, yScale(datum.y1)),
          opacity: 0,
        })}
        enter={[{
          x0: [Math.max(0, xScale(datum.x0))],
          x1: [Math.max(0, xScale(datum.x1))],
          y0: [Math.max(0, yScale(datum.y0))],
          y1: [Math.max(0, yScale(datum.y1))],
        }, {
          opacity: [1],
          timing: { delay: 333 },
        }]}
        update={[{
          x0: [Math.max(0, xScale(datum.x0))],
          x1: [Math.max(0, xScale(datum.x1))],
          y0: [Math.max(0, yScale(datum.y0))],
          y1: [Math.max(0, yScale(datum.y1))],
        }, {
          opacity: [1],
          timing: { delay: 333 },
        }]}
      >
        {animatable => {
          const {
            x0,
            y0,
            opacity,
          } = animatable;

          const datumWithAnimatable = {
            ...datum,
            scaled: animatable,
          };

          return (
            <g
              style={{
                opacity: opacity as number,
                transform: `translate(${x0}px, ${y0}px)`,
              }}
            >
              {this.renderRect(datumWithAnimatable)}
              {(datum.data[attribution.name]) && this.renderAttribution(datumWithAnimatable)}
              {defsUrl && this.renderText(datumWithAnimatable, defsUrl)}
              {this.renderText(datumWithAnimatable)}
            </g>
          );
        }}
      </Animate>
    );
  }
}
