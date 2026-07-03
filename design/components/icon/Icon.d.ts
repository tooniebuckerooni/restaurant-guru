import * as React from 'react';

/**
 * @startingPoint section="Foundations" subtitle="Lucide icon wrapper" viewport="700x140"
 */
export interface IconProps {
  /** Lucide icon name, e.g. 'zap', 'x', 'calendar', 'repeat-2' */
  name: string;
  /** @default 18 */
  size?: number;
  /** @default 2 */
  strokeWidth?: number;
  /** @default 'currentColor' */
  color?: string;
  style?: React.CSSProperties;
}

export function Icon(props: IconProps): JSX.Element;
