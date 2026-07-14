import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Rect } from 'react-native-svg';

export function Stats({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect x={4} y={12} width={4} height={8} rx={1} fill={color} />
      <Rect x={10} y={7} width={4} height={13} rx={1} fill={color} />
      <Rect x={16} y={3} width={4} height={17} rx={1} fill={color} />
    </Svg>
  );
}
