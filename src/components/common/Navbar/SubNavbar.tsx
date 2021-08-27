import React from 'react';
import './styles.scss';

export interface SubNavbarProps {
  children: JSX.Element | JSX.Element[];
}

export default function SubNavbar(props: SubNavbarProps): JSX.Element {
  const { children } = props;

  return <div>{children}</div>;
}
