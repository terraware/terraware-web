import React, { PropsWithChildren, ReactElement } from 'react';
import { NavItemProps } from './NavItem';
import './styles.scss';

export interface SubNavbarProps {
  children:
    | ReactElement<PropsWithChildren<NavItemProps>>
    | ReactElement<PropsWithChildren<NavItemProps>>[];
}

export default function SubNavbar(props: SubNavbarProps): JSX.Element {
  const { children } = props;

  return <div>{children}</div>;
}
