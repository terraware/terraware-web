import React from 'react';
import Button from '../button/Button';
import Icon from '../icon/Icon';
import './styles.scss';

export interface Props {
  text: string;
  onClick?: () => void;
  buttonText?: string;
}

export default function ErrorBox(props: Props): JSX.Element {
  const { text, onClick, buttonText } = props;

  return (
    <div className='error-box'>
      <Icon name='error' className='error-icon' size='large' />
      <div>
        <p className='error-text'>{text}</p>
        {buttonText && onClick && (
          <div className='button-container'>
            <Button label={buttonText} priority='secondary' type='passive' onClick={onClick} />
          </div>
        )}
      </div>
    </div>
  );
}
