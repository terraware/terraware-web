import classNames from 'classnames';
import React from 'react';
import Icon from '../icon/Icon';
import { IconName } from '../icon/icons';
import './styles.scss';

type TextfieldType = 'text' | 'textarea';

type Handler = (id: string, value: unknown) => void;

export interface Props {
  onChange?: Handler;
  label: string;
  disabled?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  id: string;
  className?: string;
  helperText?: string;
  placeholder?: string;
  errorText?: string;
  warningText?: string;
  value?: string;
  readonly?: boolean;
  display?: boolean;
  type: TextfieldType;
  onKeyDown?: (key: string) => void;
  onClickRightIcon?: () => void;
}

export default function TextField(props: Props): JSX.Element {
  const {
    value,
    onChange,
    label,
    disabled,
    iconLeft,
    iconRight,
    id,
    className,
    helperText,
    placeholder,
    errorText,
    warningText,
    readonly,
    display,
    type,
    onKeyDown,
    onClickRightIcon,
  } = props;

  const textfieldClass = classNames({
    'textfield-value': true,
    'textfield-value--disabled': disabled,
    'textfield-value--error': !!errorText,
    'textfield-value--warning': !!warningText,
    'textfield-value--readonly': readonly,
  });

  const textfieldOnChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const textValue = event.target.value;
    if (textValue.match(/^\s+$/)) {
      return;
    }
    if (onChange) {
      onChange(id, textValue);
    }
  };

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e.key);
    }
  };

  const renderRightIcon = () => {
    if (iconRight === 'cancel' && !value) {
      return null;
    }
    return (
      <button onClick={onClickRightIcon} className='textfield-value--icon-container'>
        <Icon name={iconRight!} className='textfield-value--icon-right' />
      </button>
    );
  };

  return (
    <div className={`textfield ${className}`}>
      <label htmlFor={id} className='textfield-label'>
        {label}
      </label>
      {!display &&
        (type === 'text' ? (
          <div id={id} className={textfieldClass}>
            {iconLeft && <Icon name={iconLeft} className='textfield-value--icon-left' />}
            <input
              value={value || ''}
              disabled={readonly || disabled}
              placeholder={placeholder}
              onChange={textfieldOnChange}
              onKeyDown={onKeyDownHandler}
            />
            {iconRight ? renderRightIcon() : null}
          </div>
        ) : (
          <textarea
            className={textfieldClass}
            value={value}
            disabled={readonly || disabled}
            placeholder={placeholder}
            onChange={textfieldOnChange}
          />
        ))}
      {display && <p className='textfield-value--display'>{value}</p>}
      {errorText && (
        <div className='textfield-label-container'>
          <Icon name='error' className='textfield-error-text--icon' />
          <label htmlFor={id} className='textfield-error-text'>
            {errorText}
          </label>
        </div>
      )}
      {warningText && (
        <div className='textfield-label-container'>
          <Icon name='warning' className='textfield-warning-text--icon' />
          <label htmlFor={id} className='textfield-warning-text'>
            {warningText}
          </label>
        </div>
      )}
      {helperText && (
        <label htmlFor={id} className='textfield-help-text'>
          {helperText}
        </label>
      )}
    </div>
  );
}
