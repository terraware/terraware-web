import MomentUtils from '@date-io/moment';
import {
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { useHistory } from 'react-router';
import { useRecoilValue } from 'recoil';
import { SearchResponseResults } from 'src/api/types/search';
import Button from '../../../components/common/button/Button';
import { pendingAccessionsSelector } from '../../../state/selectors/pendingCheckIn';
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
  })
);

export default function Checkin(): JSX.Element {
  const classes = useStyles();
  const history = useHistory();

  const pendingAccessions = useRecoilValue(pendingAccessionsSelector);

  const transformPendingAccessions = () => {
    const accessionsById: Record<number, SearchResponseResults> = {};
    pendingAccessions.results?.forEach((accession) => {
      if (accessionsById[Number(accession.id)]) {
        accessionsById[Number(accession.id)].bagNumber += ` ${accession.bagNumber}`;
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
                    console.log(result);
                    return (
                      <TableContainer component={Paper} key={result.accessionNumber}>
                        <Table aria-label='simple table'>
                          <TableHead>
                            <TableRow>
                              <TableCell>{result.bagNumber}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>{strings.ACCESSION}</TableCell>
                              <TableCell align='right'>{strings.SPECIES}</TableCell>
                              <TableCell align='right'>{strings.SITE_LOCATION}</TableCell>
                              <TableCell align='right'>{strings.COLLECTED_DATE}</TableCell>
                              <TableCell align='right'>{strings.RECEIVED_DATE}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell component='th' scope='row'>
                                {result.accessionNumber}
                              </TableCell>
                              <TableCell align='right'>{result.species}</TableCell>
                              <TableCell align='right'>{result.siteLocation}</TableCell>
                              <TableCell align='right'>{result.collectedDate}</TableCell>
                              <TableCell align='right'>{result.receivedDate}</TableCell>
                              <TableCell align='right'>
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
