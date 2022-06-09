import React from 'react';
import Button from '../button/Button';
import Icon from '../icon/Icon';
import './styles.scss';

export interface Props {
  text: string;
  onClick?: () => void;
  buttonText?: string;
  title?: string;
  className?: string;
}

export default function ErrorBox(props: Props): JSX.Element {
  const { text, onClick, buttonText, title, className } = props;

  return (
    <div className={`error-box ${className}`}>
      <div className='error-box--container'>
        <Icon name='error' className='error-icon' size='large' />
        <div>
          {title && <h1 className='error-title'>{title}</h1>}
          <p className='error-text'>{text}</p>
        </div>
      </div>
      {buttonText && onClick && (
        <div className='button-container'>
          <Button label={buttonText} priority='secondary' type='passive' onClick={onClick} />
        </div>
      )}
    </div>
  );
}
