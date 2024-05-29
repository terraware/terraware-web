import React from 'react';

import { useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import Link from './Link';

type BackToLinkProps = {
  id: string;
  name: string;
  to: string;
  className?: string;
  replace?: boolean;
};

export default function BackToLink({ id, name, to, className, replace }: BackToLinkProps): JSX.Element {
  const theme = useTheme();

  return (
    <Link
      id={id}
      to={to}
      className={className}
      replace={replace}
      style={{
        alignItems: 'center',
        display: 'flex',
        width: 'fit-content',
      }}
    >
      <Icon
        name='caretLeft'
        size='small'
        style={{
          fill: theme.palette.TwClrIcnBrand,
          marginRight: theme.spacing(1),
        }}
      />
      {name}
    </Link>
  );
}
