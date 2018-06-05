import {
  combineStyles,
  memoizeByLastCall,
  propsChanged,
  stateFromPropUpdates,
} from 'ihme-ui';
import React from 'react';

import DoubleClickReactComponent, {
  DoubleClickComponentProps,
} from '../components/DoubleClickReactComponent';
import TreemapText from './TreemapText';

const ATTRIBUTION_OPACITY = 0.5;

interface TreemapCellProps extends DoubleClickComponentProps {
  animate?: any;
  attributionFill: string;
  attributionValue?: number;
  cellFill: string;
  colorScale?: (input: number | string) => string;
  datum: any;
  defsUrl: string;
  focused?: boolean;
  focusedStyle: React.CSSProperties;
  fontSize: number;
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
  selected: boolean;
  selectedStyle?: React.CSSProperties;
  stroke: string;
  strokeWidth: number | string;
  style?: React.CSSProperties;
  width: number;
  x0: number;
  x1: number;
  x_translate: number;
  y0: number;
  y1: number;
  y_translate: number;
}

interface TreemapCellState {
  style: React.CSSProperties;
}

export default class TreemapCell
extends DoubleClickReactComponent<
  TreemapCellProps,
  TreemapCellState
> {
  static defaultProps = {
    animate: false,
    doubleClickTiming: 250,
    attributionValue: false,
  };

  /**
   * Set/update state in IHME-UI Fashion.
   */
  static propUpdates = {
    style: (acc, _, prevProps, nextProps) => {
      const stylePropNames = [
        'cellFill',
        'focused',
        'focusedStyle',
        'selected',
        'selectedStyle',
        'stroke',
        'strokeWidth',
        'style',
      ];

      if (!propsChanged(prevProps, nextProps, stylePropNames)) {
        return acc;
      }

      const styles = [
        {
          fill: nextProps.cellFill,
          stroke: nextProps.stroke,
          strokeWidth: nextProps.strokeWidth,
        },
        nextProps.style,
      ];

      if (nextProps.selected) {
        styles.push(nextProps.selectedStyle);
      }

      if (nextProps.focused) {
        styles.push(nextProps.focusedStyle);
      }

      return {
        ...acc,
        style: TreemapCell.combineStyles(styles),
      };
    },
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

  static combineStyles = memoizeByLastCall(combineStyles);

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

  constructor(props) {
    super(props);
    this.handleClicks = this.handleClicks.bind(this);
    this.state = stateFromPropUpdates(TreemapCell.propUpdates, {}, props, {});
  }

  componentWillReceiveProps(nextProps) {
    this.setState(stateFromPropUpdates(TreemapCell.propUpdates, this.props, nextProps, this.state));
  }

  handleClicks(event) {
    super.handleClicks(event, this.props.datum, this);
  }

  onMouseLeave = event => {
    const {
      datum,
      onMouseLeave,
    } = this.props;

    onMouseLeave(event, datum, this);
  }

  onMouseMove = event => {
    const {
      datum,
      onMouseMove,
    } = this.props;

    onMouseMove(event, datum, this);
  }

  onMouseOver = event => {
    const {
      datum,
      onMouseOver,
    } = this.props;

    onMouseOver(event, datum, this);
  }

  renderText = (dropshadow?) => {
    const {
      datum,
      fontSize,
      label,
      rotate,
      x_translate,
      y_translate,
    } = this.props;

    return (
      <TreemapText
        fontSize={fontSize}
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
      strokeWidth,
      height,
      width,
    } = this.props;

    const transformBy = Number(strokeWidth) / 2;

    const attributionWidth = (attributionValue * width) - Number(strokeWidth);

    return (
      <rect
        fill={attributionFill}
        height={Math.max(0, height - Number(strokeWidth))}
        onClick={this.handleClicks}
        onMouseOver={this.onMouseOver}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}
        opacity={ATTRIBUTION_OPACITY}
        transform={`translate(${transformBy}, ${transformBy})`}
        width={Math.max(0, attributionWidth)}
      />
    );
  }

  renderRect = () => (
    <rect
      height={Math.max(0, this.props.height)}
      onClick={this.handleClicks}
      onMouseLeave={this.onMouseLeave}
      onMouseMove={this.onMouseMove}
      onMouseOver={this.onMouseOver}
      style={this.state.style}
      width={Math.max(0, this.props.width)}
    />
  )

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
        {defsUrl && this.renderText(defsUrl)}
        {this.renderText()}
      </g>
    );
  }
}
