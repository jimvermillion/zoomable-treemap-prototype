import { max } from 'd3-array';
import React from 'react';

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
  label: string | number;
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
  };

  sizingProperties = d => {
    const {
      fontPadding,
      fontSize,
      fontSizeExtent,
      label,
    } = this.props;

    const [minValue, maxValue] = fontSizeExtent;

    const x = max([0, Math.floor((d.x1 - d.x0) - fontPadding)]);

    const y = max([0, Math.floor((d.y1 - d.y0) - fontPadding)]);

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

  fontSize = d => {
    const {
      x,
      y,
      width,
      shouldBeVertical,
      minValue,
      maxValue,
    } = this.sizingProperties(d);

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

  fontDirection = d => {
    const { fontMargin } = this.props;

    const { shouldBeVertical } = this.sizingProperties(d);

    const labelSize = this.fontSize(d);

    const horizontal = `translate(${fontMargin}px, ${labelSize}px) rotate(0)`;

    const vertical = `translate(${labelSize / fontMargin}px, ${fontMargin}px) rotate(90deg)`;

    return shouldBeVertical ? vertical : horizontal ;
  }

  render() {
    const {
      datum,
      filterDefsUrl,
      fill,
      dropShadowFill,
      label,
    } = this.props;

    return (
      <text
        fill={filterDefsUrl ? dropShadowFill : fill}
        filter={filterDefsUrl}
        key={`text-${datum.id}-${filterDefsUrl}`}
        style={{
          fontSize: this.fontSize(datum),
          transform: this.fontDirection(datum),
        }}
      >
        {label}
      </text>
    );
  }
}
