import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useUser } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { TrackingService } from 'src/services';
import strings from 'src/strings';
import { Delivery } from 'src/types/Tracking';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

import ReassignmentRenderer, { Reassignment, ReassignmentRowType, StratumInfo } from './ReassignmentRenderer';

const columns = (): TableColumnType[] => [
  { key: 'species', name: strings.SPECIES, type: 'string' },
  { key: 'siteName', name: strings.PLANTING_SITE, type: 'string' },
  { key: 'originalStratum', name: strings.ORIGINAL_STRATUM, type: 'string' },
  { key: 'originalSubstratum', name: strings.ORIGINAL_SUBSTRATUM, type: 'string' },
  { key: 'newStratum', name: strings.NEW_STRATUM, type: 'string' },
  { key: 'newSubstratum', name: strings.NEW_SUBSTRATUM, type: 'string' },
  { key: 'reassign', name: strings.REASSIGN, type: 'number' },
  { key: 'notes', name: strings.NOTES, type: 'string' },
];

export default function NurseryReassignmentView(): JSX.Element {
  const query = useQuery();
  const { user } = useUser();
  const numberFormatter = useNumberFormatter(user?.locale);
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const snackbar = useSnackbar();
  const [delivery, setDelivery] = useState<Delivery>();
  const [strata, setStrata] = useState<StratumInfo[]>();
  const [siteName, setSiteName] = useState<string>();
  const [reassignments, setReassignments] = useState<{ [substratumId: string]: Reassignment }>({});
  const [noReassignments, setNoReassignments] = useState<boolean>(false);
  const contentRef = useRef(null);

  const { species } = useSpeciesData();

  // populate delivery
  useEffect(() => {
    if (!deliveryId) {
      return;
    }
    const populateDelivery = async () => {
      const response = await TrackingService.getDelivery(Number(deliveryId));
      if (response.requestSucceeded) {
        setDelivery(response.delivery);
      } else {
        snackbar.toastError();
      }
    };

    void populateDelivery();
  }, [deliveryId, snackbar]);

  // populate strata
  useEffect(() => {
    if (!delivery) {
      return;
    }

    const populateStrata = async () => {
      const response = await TrackingService.getPlantingSite(delivery.plantingSiteId);
      if (response.requestSucceeded && response.site) {
        setSiteName(response.site.name);

        if (!response.site.strata) {
          return;
        }

        const stratumInfos = response.site.strata.map((stratum) => ({
          id: stratum.id,
          name: stratum.name,
          substrata: stratum.substrata.map((substratum) => ({ id: substratum.id, name: substratum.fullName })),
        }));

        setStrata(stratumInfos);
      } else {
        snackbar.toastError();
      }
    };

    void populateStrata();
  }, [delivery, snackbar]);

  const goToWithdrawals = () => {
    const withdrawalId = query.has('fromWithdrawal') ? delivery?.withdrawalId : undefined;
    navigate({ pathname: APP_PATHS.NURSERY_WITHDRAWALS + (withdrawalId ? `/${withdrawalId}` : '') });
  };

  const reassign = async () => {
    // get all reassignments that have a valid quantity
    setNoReassignments(false);
    let hasErrors = false;
    const validReassignments = plantings
      .map((planting) => planting?.reassignment)
      .filter((reassignment) => {
        if (reassignment.error) {
          hasErrors = true;
          return false;
        }
        return Number(reassignment.quantity) > 0 && reassignment.newSubstratumId;
      });

    if (hasErrors) {
      return;
    }

    if (!validReassignments.length) {
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

    const response = await TrackingService.reassignPlantings(delivery!.id, request);
    if (response.requestSucceeded) {
      goToWithdrawals();
    } else {
      snackbar.toastError();
    }
  };

  const plantings: ReassignmentRowType[] = useMemo(() => {
    if (!delivery || !siteName || !strata) {
      return [];
    }

    return delivery.plantings
      .map((planting) => {
        if (planting.type !== 'Delivery' || !planting.substratumId) {
          return null;
        }

        const originalStratum = strata.find((stratum) =>
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
          siteName,
          originalStratum,
          originalSubstratum,
          reassignment: reassignments[planting.id] || { plantingId: planting.id, notes: '' },
        };
      })
      .filter((planting): planting is ReassignmentRowType => !!planting);
  }, [delivery, siteName, species, strata, reassignments]);

  const reassignmentRenderer = useMemo(
    () =>
      ReassignmentRenderer({
        numberFormatter,
        strata: strata || [],
        setReassignment: (reassignment: Reassignment) =>
          setReassignments((current) => {
            const newReassignments = { ...current };
            newReassignments[reassignment.plantingId] = reassignment;
            return newReassignments;
          }),
      }),
    [strata, numberFormatter]
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
      {strata ? (
        <PageForm
          cancelID='cancelNurseryReassignment'
          saveID='saveNurseryReassignment'
          onCancel={goToWithdrawals}
          onSave={() => void reassign()}
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
