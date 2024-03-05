import React from 'react';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';

const useStyles = makeStyles((theme: Theme) => ({
  selected: {
    backgroundColor: theme.palette.TwClrBgAccent,
    borderRadius: '16px',
    color: theme.palette.TwClrBaseWhite,
    fontFamily: 'Inter',
    fontSize: '16px',
    fontWeight: 500,
    padding: '0.5em 0.8em',
    userSelect: 'none',
  },
  separator: {
    color: theme.palette.TwClrBaseGray300,
    fontSize: '16px',
    margin: '0 1em',
    userSelect: 'none',
  },
}));

export default function AcceleratorBreadcrumbs(): JSX.Element | null {
  const classes = useStyles();

  return (
    <div>
      <Link fontSize={16} to={APP_PATHS.HOME}>
        Terraware
      </Link>
      <span className={classes.separator}>/</span>
      <span className={classes.selected}>{strings.ACCELERATOR_CONSOLE}</span>
    </div>
  );
}
