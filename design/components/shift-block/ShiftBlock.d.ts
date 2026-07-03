import * as React from 'react';

export type ShiftRole = 'bartender' | 'server' | 'kitchen' | 'host' | 'barback' | 'manager' | 'driver' | 'cleaner';
export type ShiftStatus = 'default' | 'conflict' | 'open' | 'pending-swap';

/**
 * @startingPoint section="Scheduling" subtitle="Shift block — default, conflict, open, pending-swap" viewport="700x260"
 */
export interface ShiftBlockProps {
  /** Staff member name. Omitted for 'open' status. */
  name?: string;
  /** @default 'server' */
  role?: ShiftRole;
  /** Display time range, e.g. "9:00 AM – 3:00 PM" */
  time: string;
  /** @default 'default' */
  status?: ShiftStatus;
  onClick?: () => void;
}

export function ShiftBlock(props: ShiftBlockProps): JSX.Element;
