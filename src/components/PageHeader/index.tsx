import React, { type JSX } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import Title from 'src/components/common/Title';

interface Props {
  back?: boolean;
  backName?: string;
  backUrl?: string;
  children?: React.ReactNode[];
  leftComponent?: React.ReactNode;
  page?: string;
  parentPage?: string;
  rightComponent?: React.ReactNode;
  snackbarPageKey?: string;
  subtitle?: string | React.ReactNode;
  title?: string | string[];
  titleClassName?: string;
}

export default function PageHeader({
  title,
  subtitle,
  children,
  leftComponent,
  rightComponent,
  back,
  backName,
  backUrl,
  page,
  parentPage,
  snackbarPageKey,
  titleClassName,
}: Props): JSX.Element {
  const theme = useTheme();

  const getPageHeading = () => {
    if (page && parentPage) {
      return <Title page={page} parentPage={parentPage} />;
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        '&.MuiContainer-root': {
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: theme.spacing(4),
        },
      }}
    >
      <Grid container spacing={0} sx={{ maxWidth: '100%' }}>
        <Grid item xs={12}>
          {back && backUrl && backName && (
            <BackToLink
              id='back'
              to={backUrl}
              replace={back}
              name={backName}
              style={{
                marginLeft: 0,
                marginBottom: theme.spacing(3),
              }}
            />
          )}
        </Grid>
        {page && parentPage && title && (
          <Grid item xs={12}>
            {getPageHeading()}
          </Grid>
        )}
        <Grid item xs={12} sx={{ display: 'flex' }}>
          <Box sx={{ width: '100%' }}>
            <Box padding={theme.spacing(0, 3, children?.some((el) => el) ? 3 : 0, 3)}>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography
                  id='title'
                  variant='h4'
                  className={titleClassName}
                  sx={{
                    fontSize: '24px',
                    lineHeight: '32px',
                    fontWeight: 600,
                  }}
                >
                  {title || getPageHeading()}
                </Typography>
                {!!leftComponent && <div style={{ marginRight: 'auto' }}>{leftComponent}</div>}
                {!!rightComponent && <div>{rightComponent}</div>}
              </Box>
              {subtitle && (
                <Typography
                  id='subtitle'
                  variant='h6'
                  sx={{
                    fontWeight: 400,
                    paddingTop: theme.spacing(1.5),
                    fontSize: '14px',
                    lineHeight: '20px',
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            <PageSnackbar pageKey={snackbarPageKey} />
            {children}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
