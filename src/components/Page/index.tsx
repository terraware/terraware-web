import React, { CSSProperties, useRef } from 'react';

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
  containerStyles?: CSSProperties;
  titleStyle?: CSSProperties;
  contentStyle?: Record<string, string | number>;
  titleContainerStyle?: CSSProperties;
  crumbs?: Crumb[];
  hierarchicalCrumbs?: boolean;
  isLoading?: boolean;
  primaryButton?: PrimaryButtonType;
  leftComponent?: JSX.Element;
  rightComponent?: React.ReactNode;
  title?: React.ReactNode;
  description?: string;
};

/**
 * A generic page structure with bread crumbs, title, header wrapper and instantiated children.
 */
export default function Page({
  children,
  containerStyles,
  contentStyle,
  titleStyle,
  titleContainerStyle,
  crumbs,
  hierarchicalCrumbs,
  isLoading,
  primaryButton,
  leftComponent,
  rightComponent,
  title,
  description,
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
    <TfMain style={containerStyles}>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <>{crumbs && <BreadCrumbs crumbs={crumbs} hierarchical={hierarchicalCrumbs ?? true} />}</>
        <Grid
          container
          justifyContent='space-between'
          alignItems='center'
          marginBottom={theme.spacing(2)}
          paddingX={theme.spacing(2)}
          sx={titleContainerStyle}
        >
          {title && typeof title !== 'string' && (
            <Grid item xs={8}>
              {title}
            </Grid>
          )}
          {title && typeof title === 'string' && (
            <Grid item>
              <Typography
                sx={{
                  paddingLeft: theme.spacing(3),
                  fontSize: '24px',
                  fontWeight: 600,
                  color: theme.palette.TwClrBaseGray800,
                  ...titleStyle,
                }}
              >
                {title}
              </Typography>
            </Grid>
          )}
          {leftComponent && (
            <Grid item xs={4} style={{ marginRight: 'auto' }}>
              {leftComponent}
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
        {description ? (
          <Grid item xs={12} marginBottom={theme.spacing(2)} paddingX={theme.spacing(2)} sx={titleContainerStyle}>
            <Typography margin={0} fontSize='14px' fontWeight={400} sx={{ paddingLeft: theme.spacing(3) }}>
              {description}
            </Typography>
          </Grid>
        ) : (
          ''
        )}
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
