import * as React from 'react';

export type ToastTone = 'success' | 'warning' | 'error' | 'neutral';

/**
 * @startingPoint section="Feedback" subtitle="Toast notification" viewport="700x140"
 */
export interface ToastProps {
  /** @default 'success' */
  tone?: ToastTone;
  message: string;
  onDismiss?: () => void;
}

export function Toast(props: ToastProps): JSX.Element;
