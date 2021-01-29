import { Box, Fab, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EcoIcon from '@material-ui/icons/Eco';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { Accession } from '../api/types/accessions';
import StateChip from './common/StateChip';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.common.white,
      border: '0.5px solid rgba(33, 37, 41, 0.06)',
      minHeight: '156px',
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    backIcon: {
      marginRight: theme.spacing(4),
      backgroundColor: theme.palette.common.white,
    },
    titleBox: {
      paddingBottom: theme.spacing(1),
    },
    title: {
      fontWeight: theme.typography.fontWeightMedium,
    },
    subtitle: {
      fontWeight: theme.typography.fontWeightLight,
    },
    statusIndicator: {
      marginRight: theme.spacing(1),
      fontSize: theme.typography.h6.fontSize,
    },
    detailDivisor: {
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
      fontSize: theme.typography.caption.fontSize,
    },
    ecoIcon: {
      fontSize: theme.typography.h3.fontSize,
    },
  })
);

interface Props {
  accession?: Accession;
}

export default function AccessionPageHeader({ accession }: Props): JSX.Element {
  const classes = useStyles();

  const status = accession?.status ?? 'active';

  return (
    <Grid container spacing={3} className={classes.container}>
      <Grid item xs={1}></Grid>
      <Grid item xs={10}>
        <Box display='flex' alignItems='flex-start'>
          <Box display='flex'>
            <Fab
              size='small'
              aria-label='close'
              className={classes.backIcon}
              component={Link}
              to='/'
            >
              <ArrowBackIcon />
            </Fab>
          </Box>
          <Box display='flex' flexDirection='column'>
            <Box
              display='flex'
              alignItems='center'
              className={classes.titleBox}
            >
              <EcoIcon color='primary' className={classes.ecoIcon} />
              <Typography variant='h4' className={classes.title}>
                {accession?.id}
              </Typography>
            </Box>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <FiberManualRecord
                color={status ? 'primary' : 'disabled'}
                className={classes.statusIndicator}
              />
              <Typography variant='subtitle1' className={classes.subtitle}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <DetailDivisor />
                {accession?.species}
                <DetailDivisor />
                {accession?.receivedOn
                  ? moment(accession.receivedOn).format('MM/DD/YYYY')
                  : ''}
                <DetailDivisor />
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

function DetailDivisor() {
  const classes = useStyles();

  return (
    <FiberManualRecord color='disabled' className={classes.detailDivisor} />
  );
}
