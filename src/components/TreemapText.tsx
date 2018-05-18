import { max } from 'd3-array';
import React from 'react';
import Animate from 'react-move/Animate';

import { stringWidth } from '../utils';

interface TreemapTextProps {
  datum: any;
  dropShadowFill?: string;
  fill?: string;
  filterDefsUrl?: string;
  fontSizeExtent?: [number, number];
  fontMargin?: number;
  fontPadding?: number;
  fontSize?: number;
  label?: string | number;
}

export default class TreemapText extends React.Component<TreemapTextProps> {
  static defaultProps = {
    dropShadowFill: '#000',
    fill: '#fff',
    filterDefsUrl: '',
    fontSizeExtent: [10, 48],
    fontPadding: 8,
    fontMargin: 3,
    fontSize: 12,
    label: '',
  };

  static sizingProperties = ({
    fontPadding,
    fontSize,
    fontSizeExtent,
    label,
    datum: {
      x0,
      x1,
      y0,
      y1,
    },
  }) => {
    const [minValue, maxValue] = fontSizeExtent;

    const x = max([0, Math.floor((x1 - x0) - fontPadding)]);

    const y = max([0, Math.floor((y1 - y0) - fontPadding)]);

    const width = stringWidth(label, fontSize) / fontSize;

    const shouldBeVertical = (
      // Bounding Rect is taller than it is wide
      y > x
      // and label width is wider than bounding rectangle width.
      && (width * (minValue + 1)) > x
    );

    return {
      x,
      y,
      width,
      shouldBeVertical,
      minValue,
      maxValue,
    };
  }

  static fontSize = (props) => {
    const {
      x,
      y,
      width,
      shouldBeVertical,
      minValue,
      maxValue,
    } = TreemapText.sizingProperties(props);

    let size;

    if (shouldBeVertical) {
      size = (x < (y / width)) ? x : (y / width);
    }

    if (!shouldBeVertical) {
      size = (y < (x / width)) ? y : (x / width);
    }

    // Too small to fit: clamp at zero.
    if (size < minValue) {
      size = 0;
    }

    // Too big to fit: clamp at max.
    if (size >= maxValue) {
      size = maxValue;
    }

    return size;
  }

  static fontDirection = (props) => {
    const { fontMargin } = props;

    const { shouldBeVertical } = TreemapText.sizingProperties(props);

    const labelSize = TreemapText.fontSize(props);

    const horizontal = {
      x_translate: fontMargin,
      y_translate: labelSize,
      rotate: 0,
    };

    const vertical = {
      x_translate: labelSize / fontMargin,
      y_translate: fontMargin,
      rotate: 90,
    };

    return shouldBeVertical ? vertical : horizontal ;
  }

  render() {
    const {
      filterDefsUrl,
      fill,
      dropShadowFill,
      label,
    } = this.props;

    const {
      x_translate,
      y_translate,
      rotate,
    } = TreemapText.fontDirection(this.props);

    const styleFontSize = TreemapText.fontSize(this.props);

    return (
      <Animate
        start={{
          ...TreemapText.fontDirection(this.props),
          styleFontSize,
        }}
        update={{
          x_translate: [x_translate],
          y_translate: [y_translate],
          rotate: [rotate],
          styleFontSize: [styleFontSize],
        }}
      >
        {({
            x_translate: x,
            y_translate: y,
            rotate: r,
            styleFontSize: fontSize,
        }) => <text
          fill={filterDefsUrl ? dropShadowFill : fill}
          filter={filterDefsUrl}
          style={{
            fontSize: fontSize as number,
            transform: `translate(${x}px, ${y}px) rotate(${r}deg)`,
          }}
        >
          {label}
        </text>}
      </Animate>
    );
  }
}
