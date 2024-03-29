import React, { MouseEvent, ReactNode, SyntheticEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Link as MuiLink, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

export type LinkProps = {
  children: ReactNode;
  to?: string | { pathname: string | undefined } | undefined;
  onClick?: (e?: MouseEvent | SyntheticEvent) => void;
  className?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  lineHeight?: string | number;
  target?: string;
  id?: string;
  disabled?: boolean;
  replace?: boolean;
};

type StyleProps = {
  fontSize: string | number;
  fontWeight: string | number;
  lineHeight: string | number;
};

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.TwClrTxtBrand,
    fontFamily: 'Inter',
    fontSize: (props: StyleProps) => props.fontSize,
    fontWeight: (props: StyleProps) => props.fontWeight,
    lineHeight: (props: StyleProps) => props.lineHeight,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export default function Link(props: LinkProps): JSX.Element {
  const { to, children, className, onClick, fontSize, fontWeight, lineHeight, target, id, disabled, replace } = props;
  const classes = useStyles({
    fontSize: fontSize || '14px',
    fontWeight: fontWeight || 500,
    lineHeight: lineHeight || '21px',
  });
  const classNameToUse = `${classes.link} ${className || ''}`;

  if (to) {
    return (
      <RouterLink to={to} className={classNameToUse} target={target} id={id} replace={replace}>
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
