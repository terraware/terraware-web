import React, { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Link as MuiLink, Theme } from '@mui/material';

export type LinkProps = {
  children: ReactNode;
  to?: string;
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
};

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.TwClrTxtBrand,
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export default function Link(props: LinkProps): JSX.Element {
  const { to, children, className, onClick } = props;
  const classes = useStyles();
  const classNameToUse = `${classes.link} ${className || ''}`;

  if (to) {
    return (
      <RouterLink to={to} className={classNameToUse}>
        {children}
      </RouterLink>
    );
  }

  return (
    <MuiLink component='button' className={classNameToUse} onClick={onClick}>
      {children}
    </MuiLink>
  );
}
