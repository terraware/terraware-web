import React, { RefObject, useRef } from 'react';

import { CircularProgress, Grid, Typography, useTheme } from '@mui/material';

import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';

export type PageProps = {
  children?: React.ReactNode;
  contentStyle?: Record<string, string | number>;
  crumbs?: Crumb[];
  hierarchicalCrumbs?: boolean;
  isLoading?: boolean;
  rightComponent?: React.ReactNode;
  title?: React.ReactNode;
};

/**
 * A generic page structure with bread crumbs, title, header wrapper and instantiated children.
 */
export default function Page({
  children,
  contentStyle,
  crumbs,
  hierarchicalCrumbs,
  isLoading,
  rightComponent,
  title,
}: PageProps): JSX.Element {
  const contentRef = useRef(null);
  const theme = useTheme();

  if (isLoading) {
    return (
      <TfMain>
        <CircularProgress sx={{ margin: 'auto' }} />
      </TfMain>
    );
  }

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <>{crumbs && <BreadCrumbs crumbs={crumbs} hierarchical={hierarchicalCrumbs ?? true} />}</>
        <Grid container justifyContent='space-between' alignItems='center'>
          {title && typeof title !== 'string' && (
            <Grid item xs={8}>
              {title}
            </Grid>
          )}
          {title && typeof title === 'string' && (
            <Grid item xs={8}>
              <Typography
                sx={{
                  marginTop: theme.spacing(3),
                  marginBottom: theme.spacing(4),
                  paddingLeft: theme.spacing(3),
                  fontSize: '24px',
                  fontWeight: 600,
                  color: theme.palette.TwClrBaseGray800,
                }}
              >
                {title}
              </Typography>
            </Grid>
          )}
          {rightComponent && (
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              {rightComponent}
            </Grid>
          )}
        </Grid>
      </PageHeaderWrapper>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      <Grid container ref={contentRef} sx={contentStyle}>
        {children}
      </Grid>
    </TfMain>
  );
}
