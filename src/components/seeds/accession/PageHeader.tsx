import { Box, Fab, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EcoIcon from '@material-ui/icons/Eco';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { Accession } from 'src/api/types/accessions';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.common.white,
      border: '0.5px solid rgba(33, 37, 41, 0.06)',
      minHeight: '156px',
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      maxWidth: '100%',
      margin: '0',
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
    activeIndicator: {
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
  accession: Accession;
}

export default function AccessionPageHeader({ accession }: Props): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const location = useStateLocation();
  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    setCounter(counter - 1);
  }, [counter, location]);

  return (
    <Grid container spacing={3} className={classes.container}>
      <Grid item xs={1} />
      <Grid item xs={10}>
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
                  history.go(counter);
                }
              }}
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
              <Typography
                variant='h4'
                className={classes.title}
                id='header-accessionNumber'
              >
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
                    {new Date(accession.receivedDate).toLocaleDateString(
                      'en-US',
                      {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        timeZone: 'UTC',
                      }
                    )}
                  </span>
                )}
                <DetailDivisor />
                <span id='header-state'>{accession.state}</span>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
}

function DetailDivisor() {
  const classes = useStyles();

  return (
    <FiberManualRecord color='disabled' className={classes.detailDivisor} />
  );
}
