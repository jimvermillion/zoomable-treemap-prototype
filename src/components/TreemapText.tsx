import React from 'react';

import { stringWidth } from '../utils';

interface TreemapTextProps {
  animate?: boolean;
  datum: any;
  dropShadowFill?: string;
  fill?: string;
  filterDefsUrl?: string;
  fontMargin?: number;
  fontPadding?: number;
  fontSize?: number;
  fontSizeExtent?: [number, number];
  label?: string | number;
  processedDatum?: any;
  rotate: number;
  x_translate: number;
  y_translate: number;
}

export default class TreemapText extends React.PureComponent<TreemapTextProps> {
  static defaultProps = {
    animate: true,
    dropShadowFill: '#000',
    fill: '#fff',
    filterDefsUrl: '',
    fontSizeExtent: [10, 48],
    fontPadding: 8,
    fontMargin: 3,
    fontSize: 12,
    label: '',
  };

  static animatable = [
    'x_translate',
    'y_translate',
    'rotate',
    'fontSize',
  ];

  static processDatum = (props) => ({
    ...TreemapText.fontDirection(props),
    fontSize: TreemapText.fontSize(props),
  })

  static sizingProperties = ({
    boundingHeight,
    boundingWidth,
    fontPadding,
    fontSize,
    fontSizeExtent,
    label,
  }) => {
    const [minValue, maxValue] = fontSizeExtent;

    const x = Math.max(0, Math.floor((boundingWidth) - fontPadding));

    const y = Math.max(0, Math.floor((boundingHeight) - fontPadding));

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
      dropShadowFill,
      fill,
      filterDefsUrl,
      fontSize,
      label,
      rotate,
      x_translate,
      y_translate,
    } = this.props;

    return (
      <text
        fill={filterDefsUrl ? dropShadowFill : fill}
        filter={filterDefsUrl}
        style={{
          fontSize: fontSize as number,
          transform: `translate(${x_translate}px, ${y_translate}px) rotate(${rotate}deg)`,
        }}
      >
        {label}
      </text>
    );
  }
}
