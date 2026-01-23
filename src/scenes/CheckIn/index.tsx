import React, { type JSX, useCallback, useEffect, useRef, useState } from 'react';

import { Box, Container, Grid, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import PageHeader from 'src/components/PageHeader';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TextField from 'src/components/common/Textfield/Textfield';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import { SeedBankService } from 'src/services';
import { AccessionService } from 'src/services';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import { SearchResponseElement } from 'src/types/Search';
import { isContributor } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation from 'src/utils/useStateLocation';

import CheckInAllConfirmationDialog from './CheckInAllConfirmationDialog';

export default function CheckIn(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const [pendingAccessions, setPendingAccessions] = useState<SearchResponseElement[] | null>();
  const contentRef = useRef(null);
  const snackbar = useSnackbar();
  const [checkInAllConfirmationDialogOpen, setCheckInAllConfirmationDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const userCanEdit = !isContributor(selectedOrganization);

  const reloadData = useCallback(() => {
    const populatePendingAccessions = async () => {
      if (selectedOrganization) {
        setPendingAccessions(await SeedBankService.getPendingAccessions(selectedOrganization.id));
      }
    };
    void populatePendingAccessions();
  }, [selectedOrganization]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const checkInAccession = async (accession: Accession) => {
    if (accession) {
      try {
        await AccessionService.checkInAccession(accession.id);
        reloadData();
        snackbar.toastSuccess(
          strings.formatString(strings.ACCESSION_NUMBER_CHECKED_IN, accession.accessionNumber.toString())
        );
      } catch (e) {
        // swallow error?
        snackbar.toastError();
      }
    }
  };

  const checkInAllAccessions = async () => {
    if (pendingAccessions) {
      try {
        setBusy(true);
        await Promise.all(
          (pendingAccessions || []).map((accession) => AccessionService.checkInAccession(Number(accession.id)))
        );
        setBusy(false);
        reloadData();
        setCheckInAllConfirmationDialogOpen(false);
        snackbar.toastSuccess(strings.ALL_ACCESSIONS_CHECKED_IN);
        navigate(APP_PATHS.ACCESSIONS);
      } catch (e) {
        setBusy(false);
        snackbar.toastError();
      }
    }
  };

  const transformPendingAccessions = () => {
    const accessionsById: Record<number, SearchResponseElement> = {};
    pendingAccessions?.forEach((accession) => {
      if (accessionsById[Number(accession.id)]) {
        accessionsById[Number(accession.id)] = {
          ...accessionsById[Number(accession.id)],
          bagNumber: `${accessionsById[Number(accession.id)].bagNumber as number}, ${accession.bagNumber as number}`,
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
      state: { from: location.pathname },
    };
    navigate(accessionLocation);
  };

  const pendingAccessionsById = transformPendingAccessions();

  return (
    <TfMain>
      <CheckInAllConfirmationDialog
        open={checkInAllConfirmationDialogOpen}
        onCancel={() => setCheckInAllConfirmationDialogOpen(false)}
        onSubmit={() => void checkInAllAccessions()}
      />
      {busy && <BusySpinner withSkrim={true} />}
      <PageHeaderWrapper nextElement={contentRef.current}>
        <PageHeader
          title={strings.CHECKIN_ACCESSIONS}
          subtitle={getSubtitle()}
          back
          backUrl={APP_PATHS.ACCESSIONS}
          backName={strings.ACCESSIONS}
          snackbarPageKey={'seeds'}
          rightComponent={
            userCanEdit ? (
              <Button
                label={strings.CHECK_IN_ALL}
                onClick={() => setCheckInAllConfirmationDialogOpen(true)}
                size='medium'
                id='newAccession'
              />
            ) : null
          }
        />
      </PageHeaderWrapper>
      <Container ref={contentRef} maxWidth={false} sx={{ padding: 0 }}>
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
                    <Grid item xs={isMobile ? 16 : 2} marginBottom={isMobile ? theme.spacing(3) : 0}>
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
                          {userCanEdit && (
                            <Button
                              onClick={() => void checkInAccession(result as Accession)}
                              id='checkInCollection'
                              label={strings.CHECK_IN}
                              priority='secondary'
                              type='productive'
                            />
                          )}
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
                    <Grid item xs={isMobile ? 16 : 2} marginBottom={isMobile ? theme.spacing(3) : 0}>
                      <TextField
                        label={strings.COLLECTED_DATE}
                        id='collected'
                        type='text'
                        value={result.collectedDate as string}
                        display={true}
                      />
                    </Grid>
                    <Grid item xs={isMobile ? 16 : 2}>
                      <TextField
                        label={strings.RECEIVED_DATE}
                        id='received'
                        type='text'
                        value={result.receivedDate as string}
                        display={true}
                      />
                    </Grid>
                    {!isMobile && (
                      <Grid item xs={4}>
                        <Box height='100%' display='flex' alignItems='center' justifyContent='flex-end'>
                          <Button
                            onClick={() => goToAccession(result.id! as string)}
                            id='viewCollections'
                            label={strings.VIEW}
                            priority='secondary'
                            type='productive'
                          />
                          {userCanEdit && (
                            <Button
                              onClick={() => void checkInAccession(result as Accession)}
                              id='checkInCollection'
                              label={strings.CHECK_IN}
                              priority='secondary'
                              type='productive'
                            />
                          )}
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
