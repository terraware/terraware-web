import React, { ReactElement, useCallback } from 'react';
import Icon from '../icon/Icon';
import { IconName } from '../icon/icons';
import './styles.scss';
import { SubNavbarProps } from './SubNavbar';

export interface NavItemProps {
  label: string;
  icon?: IconName;
  children?: ReactElement<SubNavbarProps>;
  selected?: boolean;
  isSubItem?: boolean;
  onClick?: (open: boolean | undefined) => void;
  id?: string;
  isFooter?: boolean;
}

export default function NavItem(props: NavItemProps): JSX.Element {
  const { label, icon, children, selected, onClick, id, isFooter } = props;

  const hasChildrenSelected = useCallback(() => {
    if (children) {
      if (children.props.children) {
        const subChildren = children.props.children;
        if (Array.isArray(subChildren)) {
          return subChildren.some((subChild) => subChild.props.selected);
        }

        return subChildren.props.selected;
      }
    }

    return false;
  }, [children]);

  React.useEffect(() => {
    if (children && hasChildrenSelected()) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [children, hasChildrenSelected, selected]);

  const [open, setOpen] = React.useState(hasChildrenSelected());

  const onClickHandler = () => {
    if (onClick) {
      onClick(!open);
    }
  };

  return (
    <div
      className={`
        nav-item
        ${selected ? 'nav-item--selected' : ''}
        ${hasChildrenSelected() ? 'nav-item--children-selected' : ''}
        ${isFooter ? 'nav-item--footer' : ''}
      `}
    >
      <button className='nav-item-content' onClick={onClickHandler} id={id}>
        {icon && <Icon name={icon} className='nav-item--icon' />}
        <span className='nav-item--label'>{label}</span>
        {children && <Icon name={open ? 'chevronUp' : 'chevronDown'} className='nav-item--arrow' />}
      </button>
      {children && open && children}
    </div>
  );
}
