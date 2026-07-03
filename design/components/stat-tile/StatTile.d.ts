import * as React from 'react';

/**
 * @startingPoint section="Data Display" subtitle="Metric tile (hours, labor cost)" viewport="700x160"
 */
export interface StatTileProps {
  label: string;
  /** Pre-formatted display value, e.g. "312 hrs" or "$4,820" */
  value: string;
  /** Optional small trend chip, e.g. "+6% vs last wk" */
  delta?: string;
  /** @default 'success' */
  deltaTone?: 'success' | 'error' | 'neutral';
}

export function StatTile(props: StatTileProps): JSX.Element;
