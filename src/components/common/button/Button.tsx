import React from 'react';
import Icon from '../icon/Icon';
import { IconName } from '../icon/icons';
import { Size } from '../types';
import './styles.scss';

export interface Props {
  onClick: () => void;
  label: string;
  type?: 'productive' | 'passive' | 'destructive';
  priority?: 'primary' | 'secondary';
  size?: Size;
  disabled?: boolean;
  icon?: IconName;
  processing?: boolean;
  id?: string;
  className?: string;
}

export default function Button(props: Props): JSX.Element {
  const {
    onClick,
    label,
    type = 'productive',
    priority = 'primary',
    size = 'small',
    disabled,
    icon,
    processing,
    id,
    className,
  } = props;

  return (
    <button
      id={id}
      onClick={onClick}
      className={`button ${type}-${priority} button--${size} ${type}-${priority}--${size} ${
        icon && !processing ? 'button-with-icon' : ''
      } ${className ?? ''}`}
      disabled={disabled}
    >
      {processing && <Icon name='spinner' size={size} />}
      {!processing && icon && <Icon name={icon} size={size} />}
      {!processing && label}
    </button>
  );
}
