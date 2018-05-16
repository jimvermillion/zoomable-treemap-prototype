import React from 'react';

interface RectangleProps {
  data: any;
  fill: string;
  height: number;
  stroke?: string;
  strokeWidth?: number | string;
  onClick: (...args: any[]) => void;
  onMouseOver: (...args: any[]) => void;
  onMouseLeave: (...args: any[]) => void;
  onMouseMove: (...args: any[]) => void;
  width: number;
  opacity?: number;
  transform?: string;
}

export default class Rectangle extends React.PureComponent<RectangleProps> {
  static defaultProps: Partial<RectangleProps> = {
    stroke: null,
    strokeWidth: null,
    transform: null,
    opacity: null,
  };

  onClick = event => {
    const {
      data,
      onClick,
    } = this.props;

    onClick(event, data, this);
  }

  onMouseLeave = event => {
    const {
      data,
      onMouseLeave,
    } = this.props;

    onMouseLeave(event, data, this);
  }

  onMouseMove = event => {
    const {
      data,
      onMouseMove,
    } = this.props;

    onMouseMove(event, data, this);
  }

  onMouseOver = event => {
    const {
      data,
      onMouseOver,
    } = this.props;

    onMouseOver(event, data, this);
  }

  render() {
    const {
      fill,
      strokeWidth,
      stroke,
      width,
      height,
      transform,
      opacity,
    } = this.props;

    return (
      <rect
        transform={transform}
        fill={fill}
        strokeWidth={strokeWidth}
        stroke={stroke}
        width={width}
        height={height}
        opacity={opacity}
        onClick={this.onClick}
      />
    );
  }
}
