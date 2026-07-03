import * as React from 'react';

/** Visual style. Primary = brand actions, Secondary = default UI actions,
 *  Ghost = low-emphasis / toolbar icons, Danger = destructive actions. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  /** @default 'primary' */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Optional leading icon element */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function Button(props: ButtonProps): JSX.Element;
