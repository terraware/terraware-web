import React from 'react';
import './styles.scss';

export interface Props {
  title?: string;
}

export default function NavSection(props: Props): JSX.Element {
  const { title } = props;

  return (
    <div className='nav-section'>
      {title && <span className='nav-section--title'>{title}</span>}
      {!title && <div className='divider' />}
    </div>
  );
}
