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
} from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles, withStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useRecoilState } from 'recoil';
import { getPendingAccessions, SearchResponseElement } from 'src/api/seeds/search';
import Button from 'src/components/common/button/Button';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { checkInSelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useStateLocation from 'src/utils/useStateLocation';
import PageHeader from '../PageHeader';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import featureEnabled from 'src/features';

const useStyles = makeStyles((theme: Theme) => ({
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
  tableHead: {
    whiteSpace: 'nowrap',
  },
}));

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
  const { isDesktop } = useDeviceInfo();
  const classes = useStyles();
  const { organization } = props;
  const history = useHistory();
  const location = useStateLocation();
  const [pendingAccessions, setPendingAccessions] = useState<SearchResponseElement[] | null>();
  const [selectedOrgInfo, setSelectedOrgInfo] = useRecoilState(checkInSelectedOrgInfo);

  useEffect(() => {
    const populatePendingAccessions = async () => {
      if (organization) {
        setPendingAccessions(await getPendingAccessions(organization?.id));
      }
    };
    populatePendingAccessions();
  }, [organization]);

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
      return `${pendingAccessions.length} ${strings.ACCESSIONS_TOTAL}`;
    }
  };

  const goToAccession = (id: string) => {
    const isV2 = featureEnabled('V2 Accessions');
    const accessionLocation = {
      pathname: (isV2 ? APP_PATHS.ACCESSIONS2_ITEM : APP_PATHS.ACCESSIONS_ITEM).replace(':accessionId', id),
      // eslint-disable-next-line no-restricted-globals
      state: { from: location.pathname },
    };
    history.push(accessionLocation);
  };

  const pendingAccessionsById = transformPendingAccessions();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TfMain>
        <PageHeader
          title={strings.CHECKIN_ACCESSIONS}
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
                          <TableHead className={classes.tableHead}>
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
                              <TableCell>{result.collectionSiteName as string}</TableCell>
                              <TableCell>{result.collectedDate as string}</TableCell>
                              <TableCell>{result.receivedDate as string}</TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => goToAccession(result.id! as string)}
                                  id='viewCollections'
                                  label={isDesktop ? strings.VIEW_ACCESSION : strings.VIEW}
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
      </TfMain>
    </LocalizationProvider>
  );
}
