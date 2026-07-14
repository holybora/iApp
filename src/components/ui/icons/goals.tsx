import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Circle } from 'react-native-svg';

export function Goals({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={1.5} fill={color} />
    </Svg>
  );
}
