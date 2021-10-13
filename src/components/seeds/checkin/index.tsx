import MomentUtils from '@date-io/moment';
import { Container, Grid, Paper, Table, TableBody, TableCell as MuiTableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { useHistory } from 'react-router';
import { useRecoilValue } from 'recoil';
import { SearchResponseResults } from 'src/api/types/search';
import Button from '../../../components/common/button/Button';
import { pendingAccessionsSelector } from '../../../state/selectors/seeds/pendingCheckIn';
import strings from '../../../strings';
import useStateLocation from '../../../utils/useStateLocation';
import PageHeader from '../PageHeader';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(4),
    },
    downloadReport: {
      background: theme.palette.common.black,
      color: theme.palette.common.white,
      marginLeft: theme.spacing(2),
      '&:hover, &:focus': {
        backgroundColor: `${theme.palette.common.black}!important`,
      },
    },
    addAccession: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    checkinMessage: {
      marginBottom: theme.spacing(6),
    },
    title: {
      fontSize: '18px',
      color: theme.palette.gray[800],
      fontWeight: 600,
    },
  })
);

const TableCell = withStyles({
  root: {
    borderBottom: 'none',
    padding: '6px',
  },
})(MuiTableCell);

export default function Checkin(): JSX.Element {
  const classes = useStyles();
  const history = useHistory();

  const pendingAccessions = useRecoilValue(pendingAccessionsSelector);

  const transformPendingAccessions = () => {
    const accessionsById: Record<number, SearchResponseResults> = {};
    pendingAccessions.results?.forEach((accession) => {
      if (accessionsById[Number(accession.id)]) {
        accessionsById[Number(accession.id)] = {
          ...accessionsById[Number(accession.id)],
          bagNumber: `${accessionsById[Number(accession.id)].bagNumber}, ${accession.bagNumber}`,
        };
      } else {
        accessionsById[Number(accession.id)] = accession;
      }
    });

    return Object.values(accessionsById);
  };

  const pendingAccessionsById = transformPendingAccessions();

  const getSubtitle = () => {
    if (pendingAccessions.results) {
      return `${pendingAccessions.results.length} ${strings.BAGS_TOTAL}`;
    }
  };

  const location = useStateLocation();

  const goToAccession = (id: string) => {
    const accessionLocation = {
      pathname: `/accessions/${id}`,
      // eslint-disable-next-line no-restricted-globals
      state: { from: location.pathname },
    };
    history.push(accessionLocation);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <main>
        <PageHeader title={strings.CHECKIN_BAGS} subtitle={getSubtitle()} back={true} backUrl={'/accessions'} />
        <Container maxWidth={false} className={classes.mainContainer}>
          <Grid container spacing={3}>
            <Grid item xs={1} />
            {pendingAccessionsById && (
              <Grid item xs={10}>
                <div>
                  {pendingAccessionsById.map((result) => {
                    return (
                      <TableContainer component={Paper} key={result.accessionNumber} style={{ padding: '24px', marginBottom: '32px' }}>
                        <Table aria-label='simple table'>
                          <TableHead>
                            <TableRow>
                              <TableCell className={classes.title}>{result.bagNumber}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>{strings.ACCESSION}</TableCell>
                              <TableCell>{strings.SPECIES}</TableCell>
                              <TableCell>{strings.SITE_LOCATION}</TableCell>
                              <TableCell>{strings.COLLECTED_DATE}</TableCell>
                              <TableCell>{strings.RECEIVED_DATE}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell component='th' scope='row'>
                                {result.accessionNumber}
                              </TableCell>
                              <TableCell>{result.species}</TableCell>
                              <TableCell>{result.siteLocation}</TableCell>
                              <TableCell>{result.collectedDate}</TableCell>
                              <TableCell>{result.receivedDate}</TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => goToAccession(result.id!)}
                                  id='viewCollections'
                                  label={strings.VIEW_ACCESSION}
                                  priority='secondary'
                                  type='passive'
                                />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  })}
                </div>
              </Grid>
            )}
            <Grid item xs={1} />
          </Grid>
        </Container>
      </main>
    </MuiPickersUtilsProvider>
  );
}
