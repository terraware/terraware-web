import classNames from 'classnames';
import React, { ChangeEventHandler, useState } from 'react';
import Icon from '../icon/Icon';
import './styles.scss';

interface SelectProps {
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  helperText?: string;
  placeholder?: string;
  errorText?: string;
  warningText?: string;
  selectedValue?: string;
  readonly?: boolean;
  options?: string[];
}

export default function Select(props: SelectProps): JSX.Element {
  const {
    selectedValue,
    onChange,
    label,
    disabled,
    id,
    className,
    helperText,
    placeholder,
    errorText,
    warningText,
    readonly,
    options,
  } = props;

  const selectClass = classNames({
    'textfield-value': true,
    'textfield-value--disabled': disabled,
    'textfield-value--error': !!errorText,
    'textfield-value--warning': !!warningText,
    'textfield-value--readonly': readonly,
  });

  const itemClass = classNames({
    'select-value': true,
    'select-value--disabled': disabled,
  });

  const [openedOptions, setOpenedOptions] = useState(false);
  const [value, setValue] = useState(selectedValue);

  const toggleOptions = () => {
    setOpenedOptions(!openedOptions);
  };

  const onOptionSelected = (option: string) => {
    setValue(option);
    setOpenedOptions(false);
  };

  return (
    <div className={`select ${className}`}>
      {label && (
        <label htmlFor={id} className='textfield-label'>
          {label}
        </label>
      )}
      <div className='textfield-container'>
        <div id={id} className={selectClass} onClick={toggleOptions}>
          <input value={value} disabled={true} placeholder={placeholder} onChange={onChange} />
          <Icon name={'caretDown'} className='textfield-value--icon-right' />
        </div>
        {options && openedOptions && (
          <ul className='options-container'>
            {options.map((option) => {
              return (
                <li
                  key={option}
                  onClick={() => onOptionSelected(option)}
                  className={`${itemClass} ${option === value ? 'select-value--selected' : ''} `}
                >
                  {option}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {errorText && (
        <div className='label-container'>
          <Icon name='error' className='textfield-error-text--icon' />
          <label htmlFor={id} className='textfield-error-text'>
            {errorText}
          </label>
        </div>
      )}
      {warningText && (
        <div className='label-container'>
          <Icon name='warning' className='textfield-warning-text--icon' />
          <label htmlFor={id} className='textfield-warning-text'>
            {warningText}
          </label>
        </div>
      )}
      <label htmlFor={id} className='textfield-help-text'>
        {helperText}
      </label>
    </div>
  );
}
