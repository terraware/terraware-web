import React, { type JSX } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Separator } from '@terraware/web-components';

import useFunderPortal from 'src/hooks/useFunderPortal';
import { useUser } from 'src/providers';
import strings from 'src/strings';

export default function FunderBreadcrumbs(): JSX.Element | null {
  const theme = useTheme();
  const { isFunderRoute } = useFunderPortal();
  const { user } = useUser();

  if (isFunderRoute || user?.userType === 'Funder') {
    return (
      <div>
        <Grid container>
          <Grid item>
            <span
              style={{
                color: theme.palette.TwClrTxtAccentAux,
                fontFamily: 'Inter',
                fontSize: '20px',
                fontWeight: 700,
                padding: '0.5em 0.8em',
                userSelect: 'none',
              }}
            >
              {strings.FUNDER_PORTAL}
            </span>
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
