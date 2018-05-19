import partial from 'lodash-es/partial';
import React from 'react';
import {
  Animate,
  PlainObject,
} from 'react-move';

import {
  animationProcessorFactory,
  stringWidth,
} from '../utils';

interface TreemapTextProps {
  animate?: boolean;
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

  static datumProcessor(props) {
    return () => ({
      ...TreemapText.fontDirection(props),
      fontSize: TreemapText.fontSize(props),
    });
  }

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

    const x = Math.max(0, Math.floor((x1 - x0) - fontPadding));

    const y = Math.max(0, Math.floor((y1 - y0) - fontPadding));

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

  renderText = ({
    x_translate,
    y_translate,
    rotate,
    fontSize,
  }: PlainObject) => {
    const {
      filterDefsUrl,
      fill,
      dropShadowFill,
      label,
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

  renderAnimatedText = () => {
    const {
      animate,
      datum: _,
    } = this.props;

    const animationProcessor = partial(
      animationProcessorFactory,
      animate,
      TreemapText.animatable,
      TreemapText.datumProcessor(this.props),
    );

    return (
      <Animate
        start={animationProcessor('start')(_)}
        enter={animationProcessor('enter')(_)}
        update={animationProcessor('update')(_)}
        leave={animationProcessor('leave')(_)}
      >
        {this.renderText}
      </Animate>
    );
  }

  shouldAnimate() {
    return !!this.props.animate;
  }

  render() {
    if (this.shouldAnimate()) {
      return this.renderAnimatedText();
    }

    const processedDatum = TreemapText.datumProcessor(this.props)();
    return this.renderText(processedDatum);
  }
}
