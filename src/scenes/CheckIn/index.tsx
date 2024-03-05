import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import { Box, Container, Grid, useTheme } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import PageHeader from 'src/components/PageHeader';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TextField from 'src/components/common/Textfield/Textfield';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import { SeedBankService } from 'src/services';
import strings from 'src/strings';
import { SearchResponseElement } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStateLocation from 'src/utils/useStateLocation';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: 0,
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

export default function CheckIn(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const location = useStateLocation();
  const [pendingAccessions, setPendingAccessions] = useState<SearchResponseElement[] | null>();
  const contentRef = useRef(null);

  useEffect(() => {
    const populatePendingAccessions = async () => {
      if (selectedOrganization) {
        setPendingAccessions(await SeedBankService.getPendingAccessions(selectedOrganization.id));
      }
    };
    populatePendingAccessions();
  }, [selectedOrganization]);

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
      return strings.formatString(strings.ACCESSIONS_TO_BE_CHECKED_IN, pendingAccessions.length);
    }
  };

  const goToAccession = (id: string) => {
    const accessionLocation = {
      pathname: APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', id),
      // eslint-disable-next-line no-restricted-globals
      state: { from: location.pathname },
    };
    history.push(accessionLocation);
  };

  const pendingAccessionsById = transformPendingAccessions();

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <PageHeader
          title={strings.CHECKIN_ACCESSIONS}
          subtitle={getSubtitle()}
          back
          backUrl={APP_PATHS.ACCESSIONS}
          backName={strings.ACCESSIONS}
          snackbarPageKey={'seeds'}
        />
      </PageHeaderWrapper>
      <Container ref={contentRef} maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          {pendingAccessionsById && (
            <Grid item xs={12}>
              {pendingAccessionsById.map((result) => {
                return (
                  <Grid
                    container
                    key={result.accessionNumber as string}
                    columns={16}
                    sx={{
                      backgroundColor: theme.palette.TwClrBg,
                      borderRadius: '24px',
                      padding: theme.spacing(3),
                      marginBottom: theme.spacing(3),
                      '&:last-of-type': {
                        marginBottom: 0,
                      },
                    }}
                  >
                    <Grid item xs={isMobile ? 16 : 3} marginBottom={isMobile ? theme.spacing(3) : 0}>
                      {isMobile ? (
                        <Box display='flex' justifyContent='space-between'>
                          <TextField
                            label={strings.ACCESSION}
                            id='accession'
                            type='text'
                            value={result.accessionNumber as string}
                            display={true}
                          />
                          <Button
                            onClick={() => goToAccession(result.id! as string)}
                            id='viewCollections'
                            label={strings.VIEW}
                            priority='secondary'
                            type='productive'
                          />
                        </Box>
                      ) : (
                        <TextField
                          label={strings.ACCESSION}
                          id='accession'
                          type='text'
                          value={result.accessionNumber as string}
                          display={true}
                        />
                      )}
                    </Grid>
                    <Grid item xs={isMobile ? 16 : 3} marginBottom={isMobile ? theme.spacing(3) : 0}>
                      <TextField
                        label={strings.SPECIES}
                        id='species'
                        type='text'
                        value={result.speciesName as string}
                        display={true}
                      />
                    </Grid>
                    <Grid item xs={isMobile ? 16 : 3} marginBottom={isMobile ? theme.spacing(3) : 0}>
                      <TextField
                        label={strings.SITE_LOCATION}
                        id='location'
                        type='text'
                        value={result.collectionSiteName as string}
                        display={true}
                      />
                    </Grid>
                    <Grid item xs={isMobile ? 16 : 3} marginBottom={isMobile ? theme.spacing(3) : 0}>
                      <TextField
                        label={strings.COLLECTED_DATE}
                        id='collected'
                        type='text'
                        value={result.collectedDate as string}
                        display={true}
                      />
                    </Grid>
                    <Grid item xs={isMobile ? 16 : 3}>
                      <TextField
                        label={strings.RECEIVED_DATE}
                        id='received'
                        type='text'
                        value={result.receivedDate as string}
                        display={true}
                      />
                    </Grid>
                    {!isMobile && (
                      <Grid item xs={1}>
                        <Box height='100%' display='flex' alignItems='center' justifyContent='flex-end'>
                          <Button
                            onClick={() => goToAccession(result.id! as string)}
                            id='viewCollections'
                            label={strings.VIEW}
                            priority='secondary'
                            type='productive'
                          />
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Grid>
      </Container>
    </TfMain>
  );
}
