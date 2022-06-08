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
  const matchEmail = text.match(/(.*)(help@terraformation.com)(.*)/i);

  let textElements: JSX.Element | string = text;
  if (matchEmail && matchEmail.length === 4) {
    const [, preEmail, email, postEmail] = matchEmail;
    textElements = (
      <>
        <span>{preEmail}</span>
        <a href={'mailto:' + email}>{email}</a>
        <span>{postEmail}</span>
      </>
    );
  }

  return (
    <div className={`error-box ${className}`}>
      <div className='error-box--container'>
        <Icon name='error' className='error-icon' size='large' />
        <div>
          {title && <h1 className='error-title'>{title}</h1>}
          <p className='error-text'>{textElements}</p>
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
