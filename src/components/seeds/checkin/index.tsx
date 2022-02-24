import MomentUtils from '@date-io/moment';
import {
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell as MuiTableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useRecoilState } from 'recoil';
import { getPendingAccessions, SearchResponseElement } from 'src/api/seeds/search';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { checkInSelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';

import useStateLocation from 'src/utils/useStateLocation';
import PageHeader from '../PageHeader';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    main: {
      background: '#ffffff',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    },
    mainContainer: {
      padding: '32px 0',
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

export type CheckInProps = {
  organization?: ServerOrganization;
};

export default function CheckIn(props: CheckInProps): JSX.Element {
  const classes = useStyles();
  const { organization } = props;
  const history = useHistory();
  const location = useStateLocation();
  const [pendingAccessions, setPendingAccessions] = useState<SearchResponseElement[] | null>();
  const [selectedOrgInfo, setSelectedOrgInfo] = useRecoilState(checkInSelectedOrgInfo);

  useEffect(() => {
    const populatePendingAccessions = async () => {
      if (organization) {
        setPendingAccessions(await getPendingAccessions(selectedOrgInfo, organization?.id));
      }
    };
    populatePendingAccessions();
  }, [selectedOrgInfo, organization]);

  const transformPendingAccessions = () => {
    const accessionsById: Record<number, SearchResponseElement> = {};
    pendingAccessions?.forEach((accession) => {
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

  const getSubtitle = () => {
    if (pendingAccessions) {
      return `${pendingAccessions.length} ${strings.BAGS_TOTAL}`;
    }
  };

  const goToAccession = (id: string) => {
    const accessionLocation = {
      pathname: APP_PATHS.ACCESSIONS_ITEM.replace(':accessionId', id),
      // eslint-disable-next-line no-restricted-globals
      state: { from: location.pathname },
    };
    history.push(accessionLocation);
  };

  const pendingAccessionsById = transformPendingAccessions();

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <main className={classes.main}>
        <PageHeader
          title={strings.CHECKIN_BAGS}
          subtitle={getSubtitle()}
          back={true}
          backUrl={APP_PATHS.ACCESSIONS}
          organization={organization}
          selectedOrgInfo={selectedOrgInfo}
          onChangeSelectedOrgInfo={(newValues) => setSelectedOrgInfo(newValues)}
        />
        <Container maxWidth={false} className={classes.mainContainer}>
          <Grid container>
            {pendingAccessionsById && (
              <Grid item xs={12}>
                <div>
                  {pendingAccessionsById.map((result) => {
                    return (
                      <TableContainer
                        component={Paper}
                        key={result.accessionNumber as number}
                        style={{ padding: '24px', marginBottom: '32px' }}
                      >
                        <Table aria-label='simple table'>
                          <TableHead>
                            <TableRow>
                              <TableCell className={classes.title}>{result.bagNumber as string}</TableCell>
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
                                {result.accessionNumber as string}
                              </TableCell>
                              <TableCell>{result.speciesName as string}</TableCell>
                              <TableCell>{result.siteLocation as string}</TableCell>
                              <TableCell>{result.collectedDate as string}</TableCell>
                              <TableCell>{result.receivedDate as string}</TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => goToAccession(result.id! as string)}
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
          </Grid>
        </Container>
      </main>
    </MuiPickersUtilsProvider>
  );
}
