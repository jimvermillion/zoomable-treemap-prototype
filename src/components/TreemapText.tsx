import React from 'react';

import {
  DatumProcessor,
  TreemapTextProcessedDatum,
} from '../types';

import { stringWidth } from '../utils';

interface TextOrientation {
  rotate: number;
  x_translate: number;
  y_translate: number;
}

interface TreemapTextProps extends TextOrientation {
  dropShadowFill?: string;
  fill?: string;
  filterDefsUrl?: string;
  fontSize?: number;
  label?: string;
}

interface TextSizingInputs {
  fontMargin: number;
  fontPadding: number;
  fontSize: number;
  fontSizeExtent: [number, number];
  height: number;
  label?: string;
  width: number;
}

interface SizingProperties {
  x: number;
  y: number;
  width: number;
  shouldBeVertical: boolean;
  minValue: number;
  maxValue: number;
}

type TreemapTextDatumProcessor = DatumProcessor<
  TextSizingInputs,
  TreemapTextProcessedDatum
>;

export default class TreemapText extends React.PureComponent<TreemapTextProps> {
  static defaultProps = {
    dropShadowFill: '#000',
    fill: '#fff',
    filterDefsUrl: '',
    label: '',
  };

  static animatable = [
    'x_translate',
    'y_translate',
    'rotate',
    'fontSize',
  ];

  static processDatum: TreemapTextDatumProcessor = (props) => ({
    ...TreemapText.fontDirection(props),
    fontSize: TreemapText.fontSize(props),
  })

  static sizingProperties = ({
    fontPadding,
    fontSize,
    fontSizeExtent,
    height,
    label = '',
    width,
  }: Partial<TextSizingInputs>): SizingProperties => {
    const [minValue, maxValue] = fontSizeExtent;

    const x = Math.max(0, Math.floor((width) - fontPadding));

    const y = Math.max(0, Math.floor((height) - fontPadding));

    const labelWidth = stringWidth(label, fontSize) / fontSize;

    const shouldBeVertical = (
      // Bounding Rect is taller than it is wide
      y > x
      // and label width is wider than bounding rectangle width.
      && (labelWidth * (minValue + 1)) > x
    );

    return {
      x,
      y,
      width: labelWidth,
      shouldBeVertical,
      minValue,
      maxValue,
    };
  }

  static fontSize = (props: TextSizingInputs): number => {
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

  static fontDirection = (props: TextSizingInputs): TextOrientation => {
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
          cursor: 'default',
          fontSize: fontSize as number,
          userSelect: 'none',
        }}
        transform={`translate(${x_translate}, ${y_translate}) rotate(${rotate})`}
      >
        {label}
      </text>
    );
  }
}
