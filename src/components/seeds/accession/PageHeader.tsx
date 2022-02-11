import { Box, Fab, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { Accession } from 'src/api/types/accessions';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.common.white,
      maxWidth: '100%',
      margin: '0',
    },
    backIcon: {
      marginRight: theme.spacing(4),
      backgroundColor: theme.palette.common.white,
      height: '32px',
      width: '32px',
      minHeight: '32px',
    },
    pageTitle: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: '600' as React.CSSProperties['fontWeight'],
    },
    titleBox: {
      paddingBottom: '16px',
    },
    subtitle: {
      fontWeight: theme.typography.fontWeightLight,
    },
    activeIndicator: {
      marginRight: theme.spacing(1),
      fontSize: theme.typography.h6.fontSize,
    },
    detailDivisor: {
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
      fontSize: theme.typography.caption.fontSize,
    },
  })
);

interface Props {
  accession: Accession;
}

export default function AccessionPageHeader({ accession }: Props): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const location = useStateLocation();

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <Box display='flex' alignItems='flex-start'>
          <Box display='flex'>
            <Fab
              id='close'
              size='small'
              aria-label='close'
              className={classes.backIcon}
              onClick={() => {
                if (location.state?.from) {
                  history.push(getLocation(location.state.from, location));
                } else {
                  // TODO: this path is almost certainly never used. Remove it.
                  history.push('/accessions');
                }
              }}
            >
              <ArrowBackIcon />
            </Fab>
          </Box>
          <Box display='flex' flexDirection='column'>
            <Box display='flex' alignItems='center' className={classes.titleBox}>
              <Typography variant='h4' className={classes.pageTitle} id='header-accessionNumber'>
                {accession.accessionNumber}
              </Typography>
            </Box>
            <Box display='flex' alignItems='center'>
              <FiberManualRecord
                color={accession.active === 'Active' ? 'primary' : 'disabled'}
                className={classes.activeIndicator}
              />
              <Typography variant='subtitle1' className={classes.subtitle}>
                <span id='header-status'>{accession.active}</span>
                {accession.species && <DetailDivisor />}
                <span id='header-species'>{accession.species}</span>
                {accession.receivedDate && <DetailDivisor />}
                {accession.receivedDate && (
                  <span id='header-date'>
                    {new Date(accession.receivedDate).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </span>
                )}
                <DetailDivisor />
                <span id='header-state'>{accession.state}</span>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

function DetailDivisor() {
  const classes = useStyles();

  return <FiberManualRecord color='disabled' className={classes.detailDivisor} />;
}
