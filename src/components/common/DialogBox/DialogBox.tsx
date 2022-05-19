import React, { ReactNode } from 'react';
import './styles.scss';
import Icon from '../icon/Icon';
import { IconButton } from '@material-ui/core';

export interface Props {
  title: string;
  size: 'small' | 'medium' | 'large' | 'x-large';
  message?: string;
  children?: ReactNode;
  leftButton?: ReactNode;
  rightButtons?: JSX.Element[];
  middleButtons?: JSX.Element[];
  onClose?: () => void;
  open: boolean;
}

export default function DialogBox(props: Props): JSX.Element {
  const { title, size, message, children, leftButton, rightButtons, middleButtons, onClose, open } = props;

  const hasFooter = leftButton || rightButtons || middleButtons;

  return (
    <div className={`dialog-box-container ${open ? 'dialog-box--opened' : 'dialog-box--closed'}`}>
      <div className={`dialog-box dialog-box--${size}`}>
        <div className='dialog-box--header'>
          <p className='title'>{title}</p>
          <IconButton onClick={onClose} size='small'>
            <Icon name='close' className='icon-close' />
          </IconButton>
        </div>
        <div className={hasFooter ? 'dialog-box--body' : 'dialog-box--body-no-footer'}>
          <div className='dialog-box--message'>{message}</div>
          <div className='dialog-box--boundary'>{children}</div>
        </div>
        {hasFooter && (
          <div className='dialog-box--footer'>
            {leftButton && (
              <div className='dialog-box--footer-container'>
                <div className='left-button'>{leftButton}</div>
                <div className='right-buttons'>
                  {rightButtons?.map((rb, index) => {
                    const rbWithKey = { ...rb, key: `rb-${index}` };

                    return rbWithKey;
                  })}
                </div>
              </div>
            )}
            {middleButtons && (
              <div className='dialog-box--actions-container'>
                {middleButtons?.map((mb, index) => {
                  const mbWithKey = { ...mb, key: `mb-${index}` };

                  return mbWithKey;
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
