import React from 'react';

import { Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Separator } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    height: '32px',
    lineHeight: '32px',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
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
  const { isAcceleratorRoute, isAllowedViewConsole } = useAcceleratorConsole();
  const { activeLocale } = useLocalization();

  if (!activeLocale) {
    return null;
  }

  if (isAcceleratorRoute) {
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

  if (!isAcceleratorRoute && isAllowedViewConsole) {
    return (
      <div>
        <Grid container>
          <Grid item>
            <Link className={classes.link} fontSize={16} lineHeight='32px' to={APP_PATHS.ACCELERATOR}>
              {strings.ACCELERATOR_CONSOLE}
            </Link>
          </Grid>
          <Grid item>
            <Separator />
          </Grid>
        </Grid>
      </div>
    );
  }

  return null;
}
