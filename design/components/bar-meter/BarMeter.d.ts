import * as React from 'react';

/**
 * @startingPoint section="Data Display" subtitle="Hours-per-person vs. target meter" viewport="700x140"
 */
export interface BarMeterProps {
  name: string;
  hours: number;
  target: number;
  /** @default 'hrs' */
  unit?: string;
}

export function BarMeter(props: BarMeterProps): JSX.Element;
