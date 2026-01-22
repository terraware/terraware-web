import React, { CSSProperties, type JSX, MouseEvent, ReactNode, SyntheticEvent } from 'react';
import { Link as RouterLink } from 'react-router';

import { Link as MuiLink, useTheme } from '@mui/material';

import 'src/theme';

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

  const baseStyle = {
    fontSize: fontSize || '14px',
    fontWeight: fontWeight || 500,
    lineHeight: lineHeight || '21px',
    color: theme.palette.TwClrTxtBrand,
    fontFamily: 'Inter',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  };

  if (to) {
    return (
      <RouterLink
        to={to}
        className={className}
        target={target}
        id={id}
        replace={replace}
        style={{ ...baseStyle, ...style }}
      >
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
        ...baseStyle,
        opacity: disabled ? 0.5 : 1,
        '&[disabled]:hover': {
          textDecoration: 'none',
        },
      }}
    >
      {children}
    </MuiLink>
  );
}
