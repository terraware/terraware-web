import React from 'react';
import Icon from '../icon/Icon';
import { IconName } from '../icon/icons';
import './styles.scss';

export interface NavItemProps {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onClick?: () => void;
  id?: string;
  isFooter?: boolean;
}

export default function NavItem(props: NavItemProps): JSX.Element {
  const { label, icon, selected, onClick, id, isFooter } = props;

  const onClickHandler = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`
        nav-item
        ${selected ? 'nav-item--selected' : ''}
        ${isFooter ? 'nav-item--footer' : ''}
      `}
    >
      <button className='nav-item-content' onClick={onClickHandler} id={id}>
        {icon && <Icon name={icon} className='nav-item--icon' />}
        <span className='nav-item--label'>{label}</span>
      </button>
    </div>
  );
}
