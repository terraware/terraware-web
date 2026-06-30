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

const withdrawalQuantityFields = (isPlanting: boolean): (keyof BatchWithdrawQuantities)[] =>
  isPlanting
    ? ['readyQuantityWithdrawn']
    : [
        'germinatingQuantityWithdrawn',
        'activeGrowthQuantityWithdrawn',
        'hardeningOffQuantityWithdrawn',
        'readyQuantityWithdrawn',
      ];

const batchQuantityForField = (batch: BatchInfo, field: keyof BatchWithdrawQuantities): number => {
  switch (field) {
    case 'germinatingQuantityWithdrawn':
      return batch.germinatingQuantity;
    case 'activeGrowthQuantityWithdrawn':
      return batch.activeGrowthQuantity;
    case 'hardeningOffQuantityWithdrawn':
      return batch.hardeningOffQuantity;
    case 'readyQuantityWithdrawn':
      return batch.readyQuantity;
  }
  return 0;
};

const BatchWithdrawModal = ({ open, onClose, batchIds }: BatchWithdrawModalProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();

  const [step, setStep] = useState<FlowStep>(0);
  const [batches, setBatches] = useState<BatchInfo[] | undefined>(undefined);
  const [showEmptyBatchesModal, setShowEmptyBatchesModal] = useState(false);

  const [listSpeciesTargets, speciesTargetsResult] = useLazyListSpeciesTargetsForSubstratumQuery();
  const [createBatchWithdrawal, { isLoading: isCreating }] = useCreateBatchWithdrawalMutation();
  const [uploadWithdrawalPhoto] = useUploadWithdrawalPhotoMutation();

  const contributor = isContributor(selectedOrganization);

  const defaultDraft = useCallback(
    (): BatchWithdrawDraft => ({
      purpose: NurseryWithdrawalRequestPurposes.DEAD,
      withdrawnDate: todayIso(),
      notes: '',
      withdrawByBatch: {},
      photos: [],
    }),
    []
  );

  const [draft, setDraft] = useState<BatchWithdrawDraft>(defaultDraft);

  // Fetch batches when the modal opens.
  useEffect(() => {
    if (!open || !selectedOrganization || batchIds.length === 0) {
      return;
    }
    let active = true;
    setBatches(undefined);
    const populate = async () => {
      const results = await NurseryBatchService.getBatches(selectedOrganization.id, batchIds);
      if (!active) {
        return;
      }
      if (!results) {
        setBatches([]);
        return;
      }
      const withdrawableBatches = results
        .map(
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
            totalQuantity: Number(b['totalQuantity(raw)'] ?? 0),
            projectId: b.project_id !== undefined && b.project_id !== null ? Number(b.project_id) : undefined,
            projectName: b.project_name ? String(b.project_name) : undefined,
          })
        )
        .filter((batch) => batch.totalQuantity + batch.germinatingQuantity > 0);
      if (withdrawableBatches.length === 0) {
        snackbar.toastError(strings.NO_BATCHES_TO_WITHDRAW_FROM);
      }
      setBatches(withdrawableBatches);
    };
    void populate();

    return () => {
      active = false;
    };
  }, [open, selectedOrganization, batchIds, snackbar, strings]);

  const updateDraft = useCallback((next: Partial<BatchWithdrawDraft>) => {
    setDraft((prev) => {
      // A withdrawal is bound to a single nursery; clear quantities when the
      // From: Nursery changes so the user re-enters them for the new batches.
      const nurseryChanged = 'fromFacilityId' in next && next.fromFacilityId !== prev.fromFacilityId;
      const projectChanged = 'projectId' in next && next.projectId !== prev.projectId;
      const nextPurpose = next.purpose ?? prev.purpose;
      const purposeChanged = 'purpose' in next && nextPurpose !== prev.purpose;
      const plantingModeChanged =
        purposeChanged &&
        (nextPurpose === NurseryWithdrawalRequestPurposes.OUTPLANT) !==
          (prev.purpose === NurseryWithdrawalRequestPurposes.OUTPLANT);
      const purposeChangedAwayFromPlanting =
        purposeChanged && nextPurpose !== NurseryWithdrawalRequestPurposes.OUTPLANT;
      const resetPlantingTargets = nurseryChanged || purposeChangedAwayFromPlanting;
      return {
        ...prev,
        ...next,
        ...(nurseryChanged || projectChanged || plantingModeChanged ? { withdrawByBatch: {} } : {}),
        ...(nurseryChanged ? { destinationFacilityId: undefined, projectId: undefined } : {}),
        ...(resetPlantingTargets
          ? {
              plantingSiteId: undefined,
              plantingSeasonId: undefined,
              stratumId: undefined,
              substratumId: undefined,
            }
          : {}),
      };
    });
  }, []);

  const setWithdrawByBatch = useCallback(
    (updater: (prev: Record<number, BatchWithdrawQuantities>) => Record<number, BatchWithdrawQuantities>) => {
      setDraft((prev) => ({ ...prev, withdrawByBatch: updater(prev.withdrawByBatch) }));
    },
    []
  );

  const selectedSpeciesTargetArgs = useMemo(() => {
    if (
      draft.purpose !== NurseryWithdrawalRequestPurposes.OUTPLANT ||
      draft.plantingSeasonId === undefined ||
      draft.stratumId === undefined ||
      draft.substratumId === undefined
    ) {
      return undefined;
    }

    return {
      plantingSeasonId: draft.plantingSeasonId,
      substratumId: draft.substratumId,
    };
  }, [draft.plantingSeasonId, draft.purpose, draft.stratumId, draft.substratumId]);

  // Fetch species targets whenever planting purpose + season + substratum are picked.
  useEffect(() => {
    if (selectedSpeciesTargetArgs) {
      void listSpeciesTargets(selectedSpeciesTargetArgs, true);
    }
  }, [listSpeciesTargets, selectedSpeciesTargetArgs]);

  const visibleSpeciesTargets = useMemo(() => {
    if (!selectedSpeciesTargetArgs) {
      return undefined;
    }

    const requestArgs = speciesTargetsResult.originalArgs;
    if (
      requestArgs?.plantingSeasonId !== selectedSpeciesTargetArgs.plantingSeasonId ||
      requestArgs?.substratumId !== selectedSpeciesTargetArgs.substratumId
    ) {
      return undefined;
    }

    return speciesTargetsResult.currentData;
  }, [selectedSpeciesTargetArgs, speciesTargetsResult.currentData, speciesTargetsResult.originalArgs]);

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

  const isPlanting = draft.purpose === NurseryWithdrawalRequestPurposes.OUTPLANT;

  const projectFilteredBatches = useMemo(() => {
    if (!displayedBatches) {
      return undefined;
    }
    if (draft.projectId === undefined) {
      return displayedBatches;
    }
    return displayedBatches.filter((b) => b.projectId === draft.projectId);
  }, [displayedBatches, draft.projectId]);

  const quantityStepBatches = useMemo(
    () => (isPlanting ? projectFilteredBatches?.filter((b) => b.readyQuantity > 0) : projectFilteredBatches),
    [isPlanting, projectFilteredBatches]
  );

  // Species summary in the header
  const speciesSummary = useMemo(() => {
    if (!quantityStepBatches) {
      return [];
    }
    const bySpecies = new Map<number, { name: string; batchNumbers: string[] }>();
    quantityStepBatches.forEach((b) => {
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
  }, [quantityStepBatches]);

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
    if (!quantityStepBatches) {
      return false;
    }
    let total = 0;
    const fields = withdrawalQuantityFields(isPlanting);
    const overAvailable = quantityStepBatches.some((b) => {
      const quantities = draft.withdrawByBatch[b.batchId];
      if (!quantities) {
        return false;
      }
      return fields.some((field) => {
        const quantity = quantities[field] ?? 0;
        total += quantity;
        return quantity > batchQuantityForField(b, field);
      });
    });
    return total > 0 && !overAvailable;
  }, [draft.withdrawByBatch, isPlanting, quantityStepBatches]);

  const onSubmit = useCallback(async () => {
    if (draft.fromFacilityId === undefined || !quantityStepBatches) {
      return;
    }
    const isOutPlant = draft.purpose === NurseryWithdrawalRequestPurposes.OUTPLANT;
    const allowedBatchIds = new Set(quantityStepBatches.map((b) => b.batchId));
    const batchWithdrawals = Object.entries(draft.withdrawByBatch)
      .filter(([batchIdStr]) => allowedBatchIds.has(Number(batchIdStr)))
      .map(([batchIdStr, q]) => ({
        batchId: Number(batchIdStr),
        readyQuantityWithdrawn: q.readyQuantityWithdrawn || 0,
        hardeningOffQuantityWithdrawn: isOutPlant ? 0 : q.hardeningOffQuantityWithdrawn || 0,
        activeGrowthQuantityWithdrawn: isOutPlant ? 0 : q.activeGrowthQuantityWithdrawn || 0,
        germinatingQuantityWithdrawn: isOutPlant ? 0 : q.germinatingQuantityWithdrawn || 0,
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
          (numBatches === 1 ? strings.BATCHES_SINGULAR : strings.BATCHES_PLURAL) as any,
          totalWithdrawn,
          (totalWithdrawn === 1 ? strings.SEEDLINGS_SINGULAR : strings.SEEDLINGS_PLURAL) as any
        ) as string
      );

      // If a withdrawal exhausted a batch on today's date, surface the info
      // modal before closing — matches the old full-page flow's UX hint.
      const today = getTodaysDateFormatted();
      const drainedABatchToday =
        draft.withdrawnDate === today &&
        batchWithdrawals.some((bw) => {
          const source = quantityStepBatches.find((b) => b.batchId === bw.batchId);
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
  }, [createBatchWithdrawal, draft, handleClose, quantityStepBatches, snackbar, strings, uploadWithdrawalPhoto]);

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

  const stepLabels = [strings.PURPOSE, strings.QUANTITIES, strings.PHOTOS];
  const isLoadingBatches = open && batches === undefined;

  return (
    <>
      <EmptyBatchesInfoModal
        open={showEmptyBatchesModal}
        onClose={() => {
          setShowEmptyBatchesModal(false);
          handleClose();
        }}
      />
      {isLoadingBatches && <BusySpinner withSkrim={true} />}
      {batches && (
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

          <Box
            sx={{ backgroundColor: theme.palette.TwClrBgSecondary, padding: theme.spacing(2) }}
            marginBottom={theme.spacing(3)}
          >
            {speciesSummary.map((s, i) => (
              <Box
                key={i}
                display='grid'
                gridTemplateColumns='110px 1fr'
                gap={theme.spacing(2)}
                paddingBottom={i === speciesSummary.length - 1 ? 0 : theme.spacing(1)}
                marginBottom={i === speciesSummary.length - 1 ? 0 : theme.spacing(1)}
                textAlign={'left'}
                sx={{
                  borderBottom:
                    i === speciesSummary.length - 1 ? undefined : `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                }}
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
                  <Box display='flex' flexWrap='wrap' columnGap={theme.spacing(2)} rowGap={theme.spacing(1)}>
                    {s.batchNumbers.map((batchNumber, batchIndex) => (
                      <Typography key={`${batchNumber}-${batchIndex}`} component='span' fontSize='14px'>
                        {batchNumber}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {step === 0 && (
            <PurposeAndDestinationStep
              batches={batches}
              contributor={contributor}
              draft={draft}
              speciesTargets={visibleSpeciesTargets}
              onChange={updateDraft}
            />
          )}
          {step === 1 && quantityStepBatches && (
            <QuantitiesStep
              batches={quantityStepBatches}
              draft={draft}
              speciesTargets={visibleSpeciesTargets}
              setWithdrawByBatch={setWithdrawByBatch}
            />
          )}
          {step === 2 && (
            <AddPhotosStep photos={draft.photos} onPhotosChanged={(files) => updateDraft({ photos: files })} />
          )}
        </DialogBox>
      )}
    </>
  );
};

export default BatchWithdrawModal;
