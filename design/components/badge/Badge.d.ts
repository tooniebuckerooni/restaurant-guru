import * as React from 'react';

export type BadgeKind = 'status' | 'role';
export type BadgeTone = 'success' | 'warning' | 'error' | 'draft' | 'brand';
export type BadgeRole = 'bartender' | 'server' | 'kitchen' | 'host' | 'barback' | 'manager' | 'driver' | 'cleaner';

/**
 * @startingPoint section="Feedback" subtitle="Status & role badges" viewport="700x160"
 */
export interface BadgeProps {
  /** @default 'status' */
  kind?: BadgeKind;
  /** Used when kind='status'. @default 'draft' */
  tone?: BadgeTone;
  /** Used when kind='role' */
  role?: BadgeRole;
  /** @default true */
  dot?: boolean;
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): JSX.Element;
