import React from 'react';
import { ReactComponent as Logo } from './logo.svg';
import './styles.scss';

export interface Props {
  children: JSX.Element | JSX.Element[];
}

export default function Navbar(props: Props): JSX.Element {
  const { children } = props;

  return (
    <div className='navbar'>
      <div className='logo'>
        <Logo />
      </div>
      {children}
    </div>
  );
}
