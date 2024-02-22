import React from 'react';
import { Container, Grid, Box, Typography, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Title from 'src/components/common/Title';
import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    '&.MuiContainer-root': {
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: theme.spacing(4),
    },
  },
  container: {
    maxWidth: '100%',
  },
  pageTitle: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 600,
  },
  subtitle: {
    fontWeight: 400,
    paddingTop: theme.spacing(1.5),
    fontSize: '14px',
    lineHeight: '20px',
  },
  flex: {
    display: 'flex',
  },
  back: {
    marginBottom: theme.spacing(3),
  },
  backToLink: {
    marginLeft: 0,
    marginBottom: theme.spacing(3),
  },
  mainContent: {
    width: '100%',
  },
}));

interface Props {
  back?: boolean;
  backName?: string;
  backUrl?: string;
  children?: React.ReactNode[];
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
  rightComponent,
  back,
  backName,
  backUrl,
  page,
  parentPage,
  snackbarPageKey,
  titleClassName,
}: Props): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();

  const getPageHeading = () => {
    if (page && parentPage) {
      return <Title page={page} parentPage={parentPage} />;
    }
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={0} className={classes.container}>
        <Grid item xs={12}>
          {back && backUrl && backName && (
            <BackToLink id='back' to={backUrl} className={classes.backToLink} replace={back} name={backName} />
          )}
        </Grid>
        {page && parentPage && title && (
          <Grid item xs={12}>
            {getPageHeading()}
          </Grid>
        )}
        <Grid item xs={12} className={classes.flex}>
          <div className={classes.mainContent}>
            <Box padding={theme.spacing(0, 3, children?.some((el) => el) ? 3 : 0, 3)}>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography
                  id='title'
                  variant='h4'
                  className={`${classes.pageTitle} ${titleClassName}`}
                  sx={{ fontSize: '24px', lineHeight: '32px', fontWeight: 600 }}
                >
                  {title || getPageHeading()}
                </Typography>
                {!!rightComponent && <div>{rightComponent}</div>}
              </Box>
              {subtitle && (
                <Typography id='subtitle' variant='h6' className={classes.subtitle}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <PageSnackbar pageKey={snackbarPageKey} />
            {children}
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}
