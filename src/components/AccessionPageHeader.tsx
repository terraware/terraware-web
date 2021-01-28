import { Box, Fab, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React from 'react';
import { Accession } from '../api/types/accessions';
import StateChip from './common/StateChip';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.common.white,
      border: '0.5px solid rgba(33, 37, 41, 0.06)',
      minHeight: '156px',
    },
    closeIcon: {
      backgroundColor: theme.palette.common.white,
    },
    title: {
      paddingTop: theme.spacing(4),
      fontWeight: theme.typography.fontWeightMedium,
    },
    subtitle: {
      fontWeight: theme.typography.fontWeightLight,
    },
  })
);

interface Props {
  accession?: Accession;
}

export default function AccessionPageHeader({ accession }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Grid container spacing={3} className={classes.container}>
      <Grid item xs={1}></Grid>
      <Grid item xs={10}>
        <Box display='flex' alignItems='center'>
          <Fab
            size='small'
            aria-label='close'
            className={classes.closeIcon}
            onClick={() => (window.location.href = '/')}
          >
            <ArrowBackIcon />
          </Fab>
          <Box display='flex' flexDirection='column'>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Typography variant='h4' className={classes.title}>
                {accession?.id}
              </Typography>
            </Box>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Typography variant='h6' className={classes.subtitle}>
                {accession?.status} {accession?.species}{' '}
                {accession?.collectedOn}
                <StateChip state={accession?.state} />
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={1}></Grid>
    </Grid>
  );
}
