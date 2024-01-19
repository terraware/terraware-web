import React, { MouseEvent, ReactNode, SyntheticEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Link as MuiLink, Theme } from '@mui/material';

export type LinkProps = {
  children: ReactNode;
  to?: string;
  onClick?: (e?: MouseEvent | SyntheticEvent) => void;
  className?: string;
  fontSize?: string | number;
  target?: string;
  id?: string;
  disabled?: boolean;
  replace?: boolean;
};

type StyleProps = {
  fontSize: string | number;
};

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.TwClrTxtBrand,
    fontFamily: 'Inter',
    fontSize: (props: StyleProps) => props.fontSize,
    fontWeight: 500,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export default function Link(props: LinkProps): JSX.Element {
  const { to, children, className, onClick, fontSize, target, id, disabled, replace } = props;
  const classes = useStyles({ fontSize: fontSize || '14px' });
  const classNameToUse = `${classes.link} ${className || ''}`;

  if (to) {
    return (
      <RouterLink to={{ pathname: to }} className={classNameToUse} target={target} id={id} replace={replace}>
        {children}
      </RouterLink>
    );
  }

  return (
    <MuiLink
      component='button'
      className={classNameToUse}
      onClick={onClick}
      id={id}
      disabled={disabled}
      sx={{
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </MuiLink>
  );
}
