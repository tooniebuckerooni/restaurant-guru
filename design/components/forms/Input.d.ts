import * as React from 'react';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** @default 'text' */
  type?: string;
  /** Error message; also reddens the border */
  error?: string;
}

/**
 * @startingPoint section="Forms" subtitle="Text input + select" viewport="700x220"
 */
export function Input(props: InputProps): JSX.Element;

export interface SelectOption { value: string; label: string; }

export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<SelectOption | string>;
}

export function Select(props: SelectProps): JSX.Element;
