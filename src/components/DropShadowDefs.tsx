import React from 'react';

interface DropShadowDefsProps {
  dx?: string;
  dy?: string;
  id: string;
  result?: string;
  shadowHeight?: string;
  shadowWidth?: string;
  stdDeviation?: string;
  svgHeight?: number;
  svgWidth?: number;
}

export default function DropShadowDefs({
  dx = '1',
  dy = '1',
  id,
  result = 'shadow',
  shadowHeight = '120%',
  shadowWidth = '120%',
  stdDeviation = '2',
  svgHeight = 0,
  svgWidth = 0,
}: DropShadowDefsProps) {
  return (
    <svg
      height={svgHeight}
      width={svgWidth}
    >
      <defs>
        <filter
          id={id}
          width={shadowWidth}
          height={shadowHeight}
        >
          <feGaussianBlur
            stdDeviation={stdDeviation}
            result={result}
          />
          <feOffset
            dx={dx}
            dy={dy}
          />
        </filter>
      </defs>
    </svg>
  );
}
