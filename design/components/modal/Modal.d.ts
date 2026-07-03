import * as React from 'react';

/**
 * @startingPoint section="Feedback" subtitle="Confirmation / edit modal" viewport="700x320"
 */
export interface ModalProps {
  title: string;
  children?: React.ReactNode;
  onClose?: () => void;
  /** Footer actions, typically <Button> elements */
  footer?: React.ReactNode;
}

export function Modal(props: ModalProps): JSX.Element;
