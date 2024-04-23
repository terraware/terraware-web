import React, { CSSProperties, MouseEvent, ReactNode, SyntheticEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Link as MuiLink, useTheme } from '@mui/material';

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
  style?: CSSProperties;
};

export default function Link(props: LinkProps): JSX.Element {
  const { to, children, className, onClick, fontSize, fontWeight, lineHeight, target, id, disabled, replace, style } =
    props;

  const theme = useTheme();

  const styleToUse = {
    fontSize: fontSize || '14px',
    fontWeight: fontWeight || 500,
    lineHeight: lineHeight || '21px',
    color: theme.palette.TwClrTxtBrand,
    fontFamily: 'Inter',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
    ...style,
  };

  if (to) {
    return (
      <RouterLink to={to} className={className} target={target} id={id} replace={replace} style={styleToUse}>
        {children}
      </RouterLink>
    );
  }

  return (
    <MuiLink
      component='button'
      className={className}
      onClick={onClick}
      id={id}
      disabled={disabled}
      sx={{
        ...styleToUse,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </MuiLink>
  );
}
