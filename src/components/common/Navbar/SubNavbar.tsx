import React, { ReactElement } from 'react';
import { NavItemProps } from './NavItem';
import './styles.scss';

export interface SubNavbarProps {
  children: ReactElement<NavItemProps> | ReactElement<NavItemProps>[];
}

export default function SubNavbar(props: SubNavbarProps): JSX.Element {
  const { children } = props;

  return <div className='subnavbar'>{children}</div>;
}
