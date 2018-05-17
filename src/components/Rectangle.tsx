import React from 'react';
import { Transition } from 'react-move';
import Animate from 'react-move/animate';

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

  renderRect = ({
    fill,
    strokeWidth,
    stroke,
    width,
    height,
    transform,
    opacity,
  }: Partial<RectangleProps>) => {
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
      <Animate
        start={{
          fill,
          strokeWidth,
          stroke,
          width,
          height,
          transform,
          opacity,
        }}
        update={{
          fill: [fill],
          strokeWidth: [strokeWidth],
          stroke: [stroke],
          width: [width],
          height: [height],
          transform: [transform],
          opacity: [opacity],
        } as Transition}
      >
        {this.renderRect}
      </Animate>
    );
  }
}
