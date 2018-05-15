import React, { ReactElement } from 'react';

interface SVGChildElementProps {
  height: number | string;
  width: number | string;
}

type SVGChildElement = ReactElement<SVGChildElementProps>;

export default function ResponsiveSVG({
  children,
  ...props,
}) {
  return (
    <svg {...props}>
      {
        React.Children.map(
          children,
          (child: SVGChildElement) => child && React.cloneElement(child, props),
        )
      }
    </svg>
  );
}
