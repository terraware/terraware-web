import React, { PropsWithChildren, ReactElement } from 'react';
import Icon from '../icon/Icon';
import { IconName } from '../icon/icons';
import './styles.scss';
import { SubNavbarProps } from './SubNavbar';

export interface NavItemProps {
  label: string;
  icon?: IconName;
  children?: JSX.Element;
  selected?: boolean;
  isSubItem?: boolean;
  onClick?: (open: boolean | undefined) => void;
  id?: string;
}

export default function NavItem(props: NavItemProps): JSX.Element {
  const { label, icon, children, selected, onClick, id } = props;

  const hasChildrenSelected = () => {
    if (children) {
      const item = children as unknown as ReactElement<
        PropsWithChildren<SubNavbarProps>
      >;
      if (item.props.children) {
        const subChildren = item.props.children;
        if (Array.isArray(subChildren)) {
          return subChildren.some((subChild) => {
            const subItem = subChild as ReactElement<
              PropsWithChildren<NavItemProps>
            >;

            return subItem.props.selected;
          });
        } else {
          const subItem = subChildren as ReactElement<
            PropsWithChildren<NavItemProps>
          >;

          return subItem.props.selected;
        }
      }
    }

    return false;
  };

  const onClickHandler = () => {
    if (onClick) {
      onClick(!open);
    }
    if (children) {
      setOpen(!open);
    }
  };

  const [open, setOpen] = React.useState(hasChildrenSelected());

  return (
    <div
      className={`nav-item ${selected ? 'nav-item--selected' : ''} ${
        hasChildrenSelected() ? 'nav-item--children-selected' : ''
      }`}
    >
      <button className='nav-item-content' onClick={onClickHandler} id={id}>
        {icon && <Icon name={icon} className='nav-item--icon' />}
        <span className='nav-item--label'>{label}</span>
        {children && (
          <Icon
            name={open ? 'chevronUp' : 'chevronDown'}
            className='nav-item--arrow'
          />
        )}
      </button>
      {children && open && children}
    </div>
  );
}
