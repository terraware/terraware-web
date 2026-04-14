import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { Box, CircularProgress, Grid, useTheme } from '@mui/material';
import { ErrorBox, TableColumnType } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import TitleDescription from 'src/components/common/TitleDescription';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useGetDeliveryQuery, useReassignDeliveryMutation } from 'src/queries/generated/deliveries';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

import ReassignmentRenderer, { Reassignment, ReassignmentRowType } from './ReassignmentRenderer';

export default function NurseryReassignmentView(): JSX.Element {
  const { strings } = useLocalization();
  const query = useQuery();
  const numberFormatter = useNumberFormatter();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();
  const contentRef = useRef(null);

  const [noReassignments, setNoReassignments] = useState<boolean>(false);
  const { isMobile } = useDeviceInfo();
  const params = useParams<{ deliveryId: string }>();
  const deliveryId = Number(params.deliveryId);

  const columns = useMemo(
    (): TableColumnType[] => [
      { key: 'species', name: strings.SPECIES, type: 'string' },
      { key: 'siteName', name: strings.PLANTING_SITE, type: 'string' },
      { key: 'originalStratum', name: strings.ORIGINAL_STRATUM, type: 'string' },
      { key: 'originalSubstratum', name: strings.ORIGINAL_SUBSTRATUM, type: 'string' },
      { key: 'newStratum', name: strings.NEW_STRATUM, type: 'string' },
      { key: 'newSubstratum', name: strings.NEW_SUBSTRATUM, type: 'string' },
      { key: 'reassign', name: strings.REASSIGN, type: 'number' },
      { key: 'notes', name: strings.NOTES, type: 'string' },
    ],
    [strings]
  );

  const [reassignments, setReassignments] = useState<{ [substratumId: string]: Reassignment }>({});
  const [reassignDelivery, reassignDeliveryResponse] = useReassignDeliveryMutation();

  const getDeliveryResponse = useGetDeliveryQuery(deliveryId);
  const delivery = useMemo(() => getDeliveryResponse.currentData?.delivery, [getDeliveryResponse]);
  useEffect(() => {
    if (getDeliveryResponse.isError) {
      snackbar.toastError();
    }
  }, [getDeliveryResponse.isError, snackbar]);

  const { species } = useSpeciesData();
  const { plantingSite } = usePlantingSite(delivery?.plantingSiteId);

  const goToWithdrawals = useCallback(() => {
    const withdrawalId = query.has('fromWithdrawal') ? delivery?.withdrawalId : undefined;
    navigate({ pathname: APP_PATHS.NURSERY_WITHDRAWALS + (withdrawalId ? `/${withdrawalId}` : '') });
  }, [delivery, navigate, query]);

  const plantings: ReassignmentRowType[] = useMemo(() => {
    if (!delivery || !plantingSite) {
      return [];
    }

    return delivery.plantings
      .map((planting) => {
        if (planting.type !== 'Delivery' || !planting.substratumId) {
          return null;
        }

        const originalStratum = plantingSite.strata?.find((stratum) =>
          stratum.substrata.some((substratum) => substratum.id === planting.substratumId)
        );
        if (!originalStratum) {
          return null;
        }
        const originalSubstratum = originalStratum.substrata.find(
          (substratum) => substratum.id === planting.substratumId
        );
        if (!originalSubstratum) {
          return null;
        }

        return {
          numPlants: planting.numPlants,
          species: species.find((_species) => _species.id === planting.speciesId)?.scientificName ?? '',
          siteName: plantingSite?.name,
          originalStratum,
          originalSubstratum,
          reassignment: reassignments[planting.id] || { plantingId: planting.id, notes: '' },
        };
      })
      .filter((planting): planting is ReassignmentRowType => !!planting);
  }, [delivery, plantingSite, species, reassignments]);

  const hasError = useMemo(() => {
    return plantings.map((planting) => planting?.reassignment).some((reassignment) => reassignment.error !== undefined);
  }, [plantings]);

  const validReassignments = useMemo(() => {
    return plantings
      .map((planting) => planting?.reassignment)
      .filter((reassignment) => {
        if (reassignment.error) {
          return false;
        }
        return Number(reassignment.quantity) > 0 && reassignment.newSubstratumId;
      });
  }, [plantings]);

  const reassign = useCallback(() => {
    if (validReassignments.length === 0) {
      setNoReassignments(true);
      return;
    }
    const request = {
      reassignments: validReassignments.map((reassignment) => ({
        fromPlantingId: reassignment.plantingId,
        numPlants: reassignment.quantity!,
        toSubstratumId: reassignment.newSubstratumId!,
        notes: reassignment.notes,
      })),
    };

    void reassignDelivery({ id: deliveryId, reassignDeliveryRequestPayload: request }).unwrap();
  }, [deliveryId, reassignDelivery, validReassignments]);

  useEffect(() => {
    if (reassignDeliveryResponse.isSuccess) {
      goToWithdrawals();
    } else if (reassignDeliveryResponse.isError) {
      snackbar.toastError();
    }
  }, [goToWithdrawals, reassignDeliveryResponse.isError, reassignDeliveryResponse.isSuccess, snackbar]);

  const reassignmentRenderer = useMemo(
    () =>
      ReassignmentRenderer({
        numberFormatter,
        strata: plantingSite?.strata || [],
        setReassignment: (reassignment: Reassignment) =>
          setReassignments((current) => {
            const newReassignments = { ...current };
            newReassignments[reassignment.plantingId] = reassignment;
            return newReassignments;
          }),
      }),
    [plantingSite, numberFormatter]
  );

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box>
          <BackToLink
            id='back'
            to={`${APP_PATHS.NURSERY_WITHDRAWALS}?tab=withdrawal_history`}
            name={strings.WITHDRAWAL_HISTORY}
            style={{
              marginLeft: 0,
              marginTop: theme.spacing(2),
            }}
          />
        </Box>
        <Box marginTop={theme.spacing(3)}>
          <TitleDescription title={strings.REASSIGN_SEEDLINGS} description={strings.REASSIGN_SEEDLINGS_DESCRIPTION} />
        </Box>
      </PageHeaderWrapper>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      {noReassignments && (
        <Box sx={{ marginTop: 3, marginBottom: 3 }}>
          <ErrorBox title={strings.NO_REASSIGNMENTS} text={strings.NO_REASSIGNMENTS_TEXT} />
        </Box>
      )}
      {plantingSite ? (
        <PageForm
          cancelID='cancelNurseryReassignment'
          saveID='saveNurseryReassignment'
          onCancel={goToWithdrawals}
          onSave={() => void reassign()}
          saveDisabled={hasError}
          saveButtonText={strings.REASSIGN}
        >
          <Box
            paddingRight={theme.spacing(3)}
            paddingBottom={theme.spacing(8)}
            display='flex'
            flexDirection={isMobile ? 'row' : 'column'}
            marginTop={theme.spacing(3)}
            minWidth='fit-content'
            ref={contentRef}
          >
            <Card>
              <Table
                id='reassignments'
                columns={columns}
                rows={plantings}
                Renderer={reassignmentRenderer}
                orderBy='species'
                showPagination={false}
              />
            </Card>
          </Box>
        </PageForm>
      ) : (
        <CircularProgress sx={{ margin: 'auto' }} />
      )}
    </TfMain>
  );
}
