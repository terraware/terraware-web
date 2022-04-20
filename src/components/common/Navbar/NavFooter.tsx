import React, { ReactNode } from 'react';
import './styles.scss';

export interface Props {
  children: ReactNode;
}

export default function NavFooter(props: Props): JSX.Element {
  const { children } = props;

  return <div className='nav-footer'>{children}</div>;
}
