import React, { useRef } from 'react';

import { CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { Button, IconName } from '@terraware/web-components';

import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';

export type ButtonType = {
  title: string;
  onClick: () => void;
};

export type PrimaryButtonType = ButtonType & {
  icon?: IconName;
};

export type PageProps = {
  children?: React.ReactNode;
  containerClassName?: string;
  contentStyle?: Record<string, string | number>;
  crumbs?: Crumb[];
  hierarchicalCrumbs?: boolean;
  isLoading?: boolean;
  primaryButton?: PrimaryButtonType;
  rightComponent?: React.ReactNode;
  title?: React.ReactNode;
};

/**
 * A generic page structure with bread crumbs, title, header wrapper and instantiated children.
 */
export default function Page({
  children,
  containerClassName,
  contentStyle,
  crumbs,
  hierarchicalCrumbs,
  isLoading,
  primaryButton,
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
    <TfMain className={containerClassName}>
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

          {primaryButton && (
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Button
                id={`${primaryButton.title}_id}`}
                icon={primaryButton.icon}
                label={primaryButton.title}
                onClick={primaryButton.onClick}
                size='medium'
              />
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
