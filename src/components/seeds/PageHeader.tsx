import { Box, Container, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import Title from '../common/Title';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      backgroundColor: theme.palette.common.white,
      border: '0.5px solid rgba(33, 37, 41, 0.06)',
    },
    container: {
      minHeight: '156px',
      maxWidth: '100%',
    },
    titleSpacing: {
      paddingTop: theme.spacing(4),
    },
    title: {
      fontWeight: theme.typography.fontWeightMedium,
    },
    subtitle: {
      fontWeight: theme.typography.fontWeightLight,
    },
  })
);

interface Props {
  title: string;
  subtitle: string | React.ReactNode;
  children?: React.ReactNode;
  rightComponent?: React.ReactNode;
  page?: string;
  parentPage?: string;
}

export default function PageHeader({
  title,
  subtitle,
  children,
  rightComponent,
  page,
  parentPage,
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3} className={classes.container}>
        {page && parentPage && (
          <Grid item xs={12}>
            <Title page={page} parentPage={parentPage} />
          </Grid>
        )}
        <Grid item xs={1} />
        <Grid item xs={10}>
          <Box display='flex' justifyContent='space-between' alignItems='center' className={classes.titleSpacing}>
            <Typography id='title' variant='h4' className={classes.title}>
              {title}
            </Typography>
            {rightComponent}
          </Box>
          <Typography id='subtitle' variant='h6' className={classes.subtitle}>
            {subtitle}
          </Typography>
          {children}
        </Grid>
        <Grid item xs={1} />
      </Grid>
    </Container>
  );
}
