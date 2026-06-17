import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Step, StepLabel, Stepper, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import EmptyBatchesInfoModal from 'src/components/BatchWithdrawFlow/EmptyBatchesInfoModal';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization, useOrganization } from 'src/providers';
import {
  useCreateBatchWithdrawalMutation,
  useUploadWithdrawalPhotoMutation,
} from 'src/queries/generated/nurseryWithdrawals';
import { useLazyListSpeciesTargetsForSubstratumQuery } from 'src/queries/search/speciesTargetsForSubstratum';
import { NurseryBatchService } from 'src/services';
import { NurseryWithdrawalRequestPurposes } from 'src/types/Batch';
import { isContributor } from 'src/utils/organization';
import useSnackbar from 'src/utils/useSnackbar';

import AddPhotosStep from './AddPhotosStep';
import PurposeAndDestinationStep from './PurposeAndDestinationStep';
import QuantitiesStep from './QuantitiesStep';
import { BatchInfo, BatchWithdrawDraft, BatchWithdrawQuantities } from './types';

type BatchWithdrawModalProps = {
  open: boolean;
  onClose: () => void;
  batchIds: number[];
};

type FlowStep = 0 | 1 | 2;

const todayIso = () => DateTime.local().toISODate() ?? '';

const BatchWithdrawModal = ({ open, onClose, batchIds }: BatchWithdrawModalProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();

  const [step, setStep] = useState<FlowStep>(0);
  const [batches, setBatches] = useState<BatchInfo[] | undefined>(undefined);
  const [showEmptyBatchesModal, setShowEmptyBatchesModal] = useState(false);

  const [listSpeciesTargets, { data: speciesTargets }] = useLazyListSpeciesTargetsForSubstratumQuery();
  const [createBatchWithdrawal, { isLoading: isCreating }] = useCreateBatchWithdrawalMutation();
  const [uploadWithdrawalPhoto] = useUploadWithdrawalPhotoMutation();

  const contributor = isContributor(selectedOrganization);

  const defaultDraft = useCallback(
    (): BatchWithdrawDraft => ({
      purpose: isContributor(selectedOrganization)
        ? NurseryWithdrawalRequestPurposes.NURSERY_TRANSFER
        : NurseryWithdrawalRequestPurposes.OUTPLANT,
      withdrawnDate: todayIso(),
      notes: '',
      withdrawByBatch: {},
      photos: [],
    }),
    [selectedOrganization]
  );

  const [draft, setDraft] = useState<BatchWithdrawDraft>(defaultDraft);

  // Fetch batches when the modal opens.
  useEffect(() => {
    if (!open || !selectedOrganization || batchIds.length === 0) {
      return;
    }
    const populate = async () => {
      const results = await NurseryBatchService.getBatches(selectedOrganization.id, batchIds);
      if (!results) {
        setBatches([]);
        return;
      }
      setBatches(
        results.map(
          (b): BatchInfo => ({
            batchId: Number(b.id),
            batchNumber: String(b.batchNumber ?? ''),
            speciesId: Number(b.species_id),
            scientificName: String(b.species_scientificName ?? ''),
            commonName: b.species_commonName ? String(b.species_commonName) : undefined,
            facilityId: Number(b.facility_id),
            facilityName: String(b.facility_name ?? ''),
            germinatingQuantity: Number(b['germinatingQuantity(raw)'] ?? 0),
            activeGrowthQuantity: Number(b['activeGrowthQuantity(raw)'] ?? 0),
            hardeningOffQuantity: Number(b['hardeningOffQuantity(raw)'] ?? 0),
            readyQuantity: Number(b['readyQuantity(raw)'] ?? 0),
          })
        )
      );
    };
    void populate();
  }, [open, selectedOrganization, batchIds]);

  const updateDraft = useCallback((next: Partial<BatchWithdrawDraft>) => {
    setDraft((prev) => {
      // A withdrawal is bound to a single nursery; clear quantities when the
      // From: Nursery changes so the user re-enters them for the new batches.
      const nurseryChanged = 'fromFacilityId' in next && next.fromFacilityId !== prev.fromFacilityId;
      return { ...prev, ...next, ...(nurseryChanged ? { withdrawByBatch: {} } : {}) };
    });
  }, []);

  const setWithdrawByBatch = useCallback(
    (updater: (prev: Record<number, BatchWithdrawQuantities>) => Record<number, BatchWithdrawQuantities>) => {
      setDraft((prev) => ({ ...prev, withdrawByBatch: updater(prev.withdrawByBatch) }));
    },
    []
  );

  // Fetch species targets whenever season + substratum are picked.
  useEffect(() => {
    if (draft.plantingSeasonId !== undefined && draft.substratumId !== undefined) {
      void listSpeciesTargets({ plantingSeasonId: draft.plantingSeasonId, substratumId: draft.substratumId }, true);
    }
  }, [draft.plantingSeasonId, draft.substratumId, listSpeciesTargets]);

  const handleClose = useCallback(() => {
    setStep(0);
    setDraft(defaultDraft());
    setBatches(undefined);
    onClose();
  }, [defaultDraft, onClose]);

  // A withdrawal can only be from a single nursery; filter selected batches down
  // to the chosen From: Nursery before showing them anywhere.
  const displayedBatches = useMemo(() => {
    if (!batches) {
      return undefined;
    }
    if (draft.fromFacilityId === undefined) {
      return batches;
    }
    return batches.filter((b) => b.facilityId === draft.fromFacilityId);
  }, [batches, draft.fromFacilityId]);

  // Species summary in the header
  const speciesSummary = useMemo(() => {
    if (!displayedBatches) {
      return [];
    }
    const bySpecies = new Map<number, { name: string; batchNumbers: string[] }>();
    displayedBatches.forEach((b) => {
      const existing = bySpecies.get(b.speciesId);
      if (existing) {
        existing.batchNumbers.push(b.batchNumber);
      } else {
        bySpecies.set(b.speciesId, {
          name: b.scientificName + (b.commonName ? ` (${b.commonName})` : ''),
          batchNumbers: [b.batchNumber],
        });
      }
    });
    return [...bySpecies.values()];
  }, [displayedBatches]);

  // Step 1 validation: purpose-specific destination + withdraw date.
  const canGoNextFromStep1 = useMemo(() => {
    if (!draft.withdrawnDate || draft.fromFacilityId === undefined) {
      return false;
    }
    if (draft.purpose === NurseryWithdrawalRequestPurposes.OUTPLANT) {
      return draft.plantingSiteId !== undefined && draft.stratumId !== undefined && draft.substratumId !== undefined;
    }
    if (draft.purpose === NurseryWithdrawalRequestPurposes.NURSERY_TRANSFER) {
      return draft.destinationFacilityId !== undefined;
    }
    return true;
  }, [draft]);

  const canGoNextFromStep2 = useMemo(() => {
    if (!displayedBatches) {
      return false;
    }
    let total = 0;
    const overReady = displayedBatches.some((b) => {
      const ready = draft.withdrawByBatch[b.batchId]?.readyQuantityWithdrawn ?? 0;
      total += ready;
      return ready > b.readyQuantity;
    });
    return total > 0 && !overReady;
  }, [displayedBatches, draft.withdrawByBatch]);

  const onSubmit = useCallback(async () => {
    if (draft.fromFacilityId === undefined || !displayedBatches) {
      return;
    }
    // Only submit quantities for batches that belong to the selected nursery —
    // a withdrawal can only span a single facility.
    const allowedBatchIds = new Set(displayedBatches.map((b) => b.batchId));
    const batchWithdrawals = Object.entries(draft.withdrawByBatch)
      .filter(([batchIdStr]) => allowedBatchIds.has(Number(batchIdStr)))
      .map(([batchIdStr, q]) => ({
        batchId: Number(batchIdStr),
        readyQuantityWithdrawn: q.readyQuantityWithdrawn || 0,
        hardeningOffQuantityWithdrawn: q.hardeningOffQuantityWithdrawn || 0,
        activeGrowthQuantityWithdrawn: q.activeGrowthQuantityWithdrawn || 0,
        germinatingQuantityWithdrawn: q.germinatingQuantityWithdrawn || 0,
      }))
      .filter(
        (bw) =>
          bw.readyQuantityWithdrawn +
            bw.hardeningOffQuantityWithdrawn +
            bw.activeGrowthQuantityWithdrawn +
            bw.germinatingQuantityWithdrawn >
          0
      );

    if (batchWithdrawals.length === 0) {
      snackbar.toastError(strings.NO_BATCHES_TO_WITHDRAW_FROM);
      return;
    }

    const isOutPlant = draft.purpose === NurseryWithdrawalRequestPurposes.OUTPLANT;
    const isNurseryTransfer = draft.purpose === NurseryWithdrawalRequestPurposes.NURSERY_TRANSFER;

    try {
      const response = await createBatchWithdrawal({
        batchWithdrawals,
        facilityId: draft.fromFacilityId,
        purpose: draft.purpose as Exclude<typeof draft.purpose, 'Undo'>,
        plantingSiteId: isOutPlant ? draft.plantingSiteId : undefined,
        plantingSeasonId: isOutPlant ? draft.plantingSeasonId : undefined,
        substratumId: isOutPlant ? draft.substratumId : undefined,
        destinationFacilityId: isNurseryTransfer ? draft.destinationFacilityId : undefined,
        notes: draft.notes ? draft.notes : undefined,
        withdrawnDate: draft.withdrawnDate,
      }).unwrap();

      if (draft.photos.length > 0 && response?.withdrawal?.id) {
        await Promise.allSettled(
          draft.photos.map((file) =>
            uploadWithdrawalPhoto({ withdrawalId: response.withdrawal.id, body: { file } }).unwrap()
          )
        );
      }

      const numBatches = batchWithdrawals.length;
      const totalWithdrawn = batchWithdrawals.reduce(
        (sum, bw) =>
          sum +
          bw.readyQuantityWithdrawn +
          bw.hardeningOffQuantityWithdrawn +
          bw.activeGrowthQuantityWithdrawn +
          bw.germinatingQuantityWithdrawn,
        0
      );
      snackbar.toastSuccess(
        strings.formatString(
          strings.BATCH_WITHDRAW_SUCCESS,
          numBatches,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (numBatches === 1 ? strings.BATCHES_SINGULAR : strings.BATCHES_PLURAL) as any,
          totalWithdrawn,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (totalWithdrawn === 1 ? strings.SEEDLINGS_SINGULAR : strings.SEEDLINGS_PLURAL) as any
        ) as string
      );

      // If a withdrawal exhausted a batch on today's date, surface the info
      // modal before closing — matches the old full-page flow's UX hint.
      const today = getTodaysDateFormatted();
      const drainedABatchToday =
        draft.withdrawnDate === today &&
        batchWithdrawals.some((bw) => {
          const source = displayedBatches.find((b) => b.batchId === bw.batchId);
          return (
            source &&
            bw.germinatingQuantityWithdrawn === source.germinatingQuantity &&
            bw.activeGrowthQuantityWithdrawn === source.activeGrowthQuantity &&
            bw.hardeningOffQuantityWithdrawn === source.hardeningOffQuantity &&
            bw.readyQuantityWithdrawn === source.readyQuantity
          );
        });

      if (drainedABatchToday) {
        setShowEmptyBatchesModal(true);
      } else {
        handleClose();
      }
    } catch (e) {
      snackbar.toastError();
    }
  }, [createBatchWithdrawal, displayedBatches, draft, handleClose, snackbar, strings, uploadWithdrawalPhoto]);

  const middleButtons: JSX.Element[] = useMemo(() => {
    const cancel = (
      <Button
        key='cancel'
        label={strings.CANCEL}
        onClick={handleClose}
        priority='secondary'
        type='passive'
        disabled={isCreating}
      />
    );
    if (step === 0) {
      return [
        cancel,
        <Button key='next' label={strings.NEXT} onClick={() => setStep(1)} disabled={!canGoNextFromStep1} />,
      ];
    }
    const back = (
      <Button
        key='back'
        label={strings.BACK}
        onClick={() => setStep((s) => (s === 2 ? 1 : 0) as FlowStep)}
        priority='secondary'
        disabled={isCreating}
      />
    );
    if (step === 1) {
      return [
        cancel,
        back,
        <Button key='next' label={strings.NEXT} onClick={() => setStep(2)} disabled={!canGoNextFromStep2} />,
      ];
    }
    return [
      cancel,
      back,
      <Button
        key='withdraw'
        label={strings.WITHDRAW}
        onClick={() => void onSubmit()}
        disabled={isCreating || !canGoNextFromStep2}
      />,
    ];
  }, [step, strings, canGoNextFromStep1, canGoNextFromStep2, handleClose, isCreating, onSubmit]);

  const stepLabels = [strings.PURPOSE_AND_DESTINATION, strings.QUANTITIES, strings.ADD_PHOTOS];

  return (
    <>
      <EmptyBatchesInfoModal
        open={showEmptyBatchesModal}
        onClose={() => {
          setShowEmptyBatchesModal(false);
          handleClose();
        }}
      />
      <DialogBox
        open={open}
        onClose={handleClose}
        title={strings.WITHDRAW_FROM_BATCHES}
        size='large'
        skrim
        middleButtons={middleButtons}
        scrolled
      >
        <Stepper activeStep={step} sx={{ margin: theme.spacing(1, 0, 3) }}>
          {stepLabels.map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '.MuiStepIcon-root': {
                    fill: theme.palette.TwClrBgTertiary,
                  },
                  '.MuiStepIcon-root.Mui-active': {
                    fill: theme.palette.TwClrIcnSecondary,
                  },
                  '.MuiStepIcon-root.Mui-completed': {
                    fill: theme.palette.TwClrTxtBrand,
                  },
                  '.MuiStepLabel-label': {
                    fontSize: '14px',
                    fontWeight: 400,
                    color: index === step ? theme.palette.TwClrTxt : theme.palette.TwClrTxtSecondary,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {!batches ? (
          <BusySpinner />
        ) : (
          <>
            <Box
              sx={{ backgroundColor: theme.palette.TwClrBgSecondary, padding: theme.spacing(2), borderRadius: '8px' }}
              marginBottom={theme.spacing(3)}
            >
              {speciesSummary.map((s, i) => (
                <Box
                  key={i}
                  display='grid'
                  gridTemplateColumns='110px 1fr'
                  gap={theme.spacing(2)}
                  paddingY={theme.spacing(0.5)}
                  textAlign={'left'}
                >
                  <Box>
                    <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} paddingBottom={1}>
                      {strings.SPECIES}
                    </Typography>
                    <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
                      {strings
                        .formatString(
                          s.batchNumbers.length === 1 ? strings.X_BATCH : strings.X_BATCHES,
                          s.batchNumbers.length
                        )
                        .toString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography fontSize='14px' paddingBottom={1}>
                      {s.name}
                    </Typography>
                    <Typography fontSize='14px'>{s.batchNumbers.join('  ')}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {step === 0 && (
              <PurposeAndDestinationStep
                batches={batches}
                contributor={contributor}
                draft={draft}
                speciesTargets={speciesTargets}
                onChange={updateDraft}
              />
            )}
            {step === 1 && displayedBatches && (
              <QuantitiesStep
                batches={displayedBatches}
                draft={draft}
                speciesTargets={speciesTargets}
                setWithdrawByBatch={setWithdrawByBatch}
              />
            )}
            {step === 2 && (
              <AddPhotosStep photos={draft.photos} onPhotosChanged={(files) => updateDraft({ photos: files })} />
            )}
          </>
        )}
      </DialogBox>
    </>
  );
};

export default BatchWithdrawModal;
