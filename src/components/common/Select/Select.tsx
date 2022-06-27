import classNames from 'classnames';
import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import Icon from '../icon/Icon';
import './styles.scss';

interface SelectProps {
  onChange: (newValue: string) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  helperText?: string | string[];
  placeholder?: string;
  errorText?: string | string[];
  warningText?: string | string[];
  selectedValue?: string;
  readonly?: boolean;
  options?: string[];
  fullWidth?: boolean;
  hideArrow?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
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
    readonly = true,
    options,
    fullWidth,
    hideArrow,
    onBlur,
    onFocus,
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
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const handleClick = (event: any) => {
    // Don't respond to user clicks inside the input box because those are
    // already handled by toggleOptions()
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      inputRef.current &&
      !inputRef.current.contains(event.target)
    ) {
      setOpenedOptions(false);
    }
  };

  useEffect(() => {
    if (openedOptions) {
      scrollToSelectedElement();
    }
  }, [openedOptions]);

  const toggleOptions = () => {
    setOpenedOptions((isOpen) => !isOpen);
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
    setOpenedOptions(true);
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
      <div className={`textfield-container ${fullWidth ? 'textfield-container--fullWidth' : ''}`}>
        <div id={id} className={selectClass} onClick={toggleOptions} ref={inputRef}>
          <input
            value={selectedValue || ''}
            readOnly={readonly}
            placeholder={placeholder}
            onChange={onChangeHandler}
            onKeyDown={onKeyDownHandler}
            onBlur={onBlur}
            onFocus={onFocus}
          />
          {!hideArrow && <Icon name={'caretDown'} className='textfield-value--icon-right' />}
        </div>
        {options && options.length > 0 && openedOptions && (
          <ul className='options-container' ref={dropdownRef}>
            {options.map((option, index) => {
              return (
                <li
                  data-key={option.charAt(0).toUpperCase()}
                  data-selected={option === selectedValue}
                  key={index}
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
