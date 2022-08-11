import React, { ReactNode } from 'react';
import './styles.scss';
import Icon from '../icon/Icon';
import { IconButton } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export interface Props {
  title: string;
  size: 'small' | 'medium' | 'large' | 'x-large';
  message?: string | string[];
  children?: ReactNode;
  leftButton?: ReactNode;
  rightButtons?: JSX.Element[];
  middleButtons?: JSX.Element[];
  onClose?: () => void;
  open: boolean;
  scrolled?: boolean;
}

export default function DialogBox(props: Props): JSX.Element | null {
  const { title, size, message, children, leftButton, rightButtons, middleButtons, onClose, open, scrolled } = props;

  const hasFooter = leftButton || rightButtons || middleButtons;

  const { isMobile } = useDeviceInfo();

  return open ? (
    <div
      className={`dialog-box-container ${open ? 'dialog-box--opened' : 'dialog-box--closed'} ${
        isMobile ? 'mobile' : ''
      }`}
    >
      <div className={`dialog-box dialog-box--${size}`}>
        <div className='dialog-box--header'>
          <p className='title'>{title}</p>
          <IconButton onClick={onClose} size='small'>
            <Icon name='close' className='icon-close' />
          </IconButton>
        </div>
        <div
          className={(hasFooter ? 'dialog-box--body' : 'dialog-box--body-no-footer') + (scrolled ? ' scrolled' : '')}
        >
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
                    const rbWithKey = {
                      ...rb,
                      key: `rb-${index}`,
                      props: { ...rb.props, size: rb.props.size || 'medium' },
                    };

                    return rbWithKey;
                  })}
                </div>
              </div>
            )}
            {middleButtons && (
              <div className='dialog-box--actions-container'>
                {middleButtons?.map((mb, index) => {
                  const mbWithKey = {
                    ...mb,
                    key: `mb-${index}`,
                    props: { ...mb.props, size: mb.props.size || 'medium' },
                  };

                  return mbWithKey;
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ) : null;
}
