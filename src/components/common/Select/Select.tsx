import classNames from 'classnames';
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import Icon from '../icon/Icon';
import './styles.scss';

interface SelectProps {
  onChange: (newValue: string) => void;
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
  const dropdownRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (openedOptions) {
      scrollToSelectedElement();
    }
  }, [openedOptions]);

  const toggleOptions = () => {
    setOpenedOptions(!openedOptions);
  };

  const onOptionSelected = (option: string) => {
    if (onChange) {
      onChange(option);
    }
    setOpenedOptions(false);
  };

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const onKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    const pressedLetter = e.key.toUpperCase();
    const items = dropdownRef.current?.getElementsByTagName('li');
    if (items) {
      const arrayOfItems = Array.from(items);
      for (const item of arrayOfItems) {
        if (item.dataset.key === pressedLetter) {
          item.scrollIntoView();
          return;
        }
      }
    }
  };

  const scrollToSelectedElement = () => {
    const items = dropdownRef.current?.getElementsByTagName('li');
    if (items) {
      const arrayOfItems = Array.from(items);
      for (const item of arrayOfItems) {
        if (item.dataset.selected === 'true') {
          item.scrollIntoView();
          return;
        }
      }
    }
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
          <input
            value={selectedValue}
            readOnly={true}
            placeholder={placeholder}
            onChange={onChangeHandler}
            onKeyDown={onKeyDownHandler}
          />
          <Icon name={'caretDown'} className='textfield-value--icon-right' />
        </div>
        {options && openedOptions && (
          <ul className='options-container' ref={dropdownRef}>
            {options.map((option) => {
              return (
                <li
                  data-key={option.charAt(0).toUpperCase()}
                  data-selected={option === selectedValue}
                  key={option}
                  onClick={() => onOptionSelected(option)}
                  className={`${itemClass} ${option === selectedValue ? 'select-value--selected' : ''} `}
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
