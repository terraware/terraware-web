import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Step, StepLabel, Stepper, Typography, useTheme } from '@mui/material';
import getDateDisplayValue, { getTodaysDateFormatted, isInTheFuture } from '@terraware/web-components/utils/date';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { useTrackModalAbandonment } from 'src/hooks/useTrackModalAbandonment';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useOrganization, useUser } from 'src/providers/hooks';
import {
  CreateViabilityTestRequestPayload,
  useCreateNurseryTransferWithdrawalMutation,
  useCreateViabilityTestMutation,
  useCreateWithdrawalMutation,
} from 'src/queries/generated/accessionsV2';
import { useCreateBatchPhotoMutation } from 'src/queries/generated/nurseryBatches';
import { OrganizationUserService } from 'src/services';
import { OrganizationUser, User } from 'src/types/User';
import { getSeedBank } from 'src/utils/organization';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import WithdrawDateWarningModal from '../WithdrawDateWarningModal';
import PhotosStep from './PhotosStep';
import PurposeStep from './PurposeStep';
import QuantitiesStep from './QuantitiesStep';
import { AccessionWithdrawInfo, PHOTOS_ENABLED_PURPOSES, WithdrawDraft, WithdrawQuantity } from './types';
import { estimatedSeedCount, validateRow } from './withdrawCalc';

type WithdrawSeedsFormProps = {
  open: boolean;
  onClose: () => void;
  accessions: AccessionWithdrawInfo[];
  user: User;
  onWithdrawn?: () => void;
};

type FlowStep = 0 | 1 | 2;

const WithdrawSeedsForm = ({ open, onClose, accessions, user, onWithdrawn }: WithdrawSeedsFormProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { isAllowed } = useUser();
  const snackbar = useSnackbar();
  const trackEvent = useTrackEvent();
  const markSubmitted = useTrackModalAbandonment('accession_withdraw', open);

  const [createWithdrawal] = useCreateWithdrawalMutation();
  const [createNurseryTransferWithdrawal] = useCreateNurseryTransferWithdrawalMutation();
  const [createViabilityTest] = useCreateViabilityTestMutation();
  const [createBatchPhoto] = useCreateBatchPhotoMutation();

  const userCanEdit = isAllowed('EDIT_ACCESSION', { organization: selectedOrganization });
  const isBulk = accessions.length > 1;

  const seedBank = useMemo(
    () =>
      selectedOrganization && accessions[0]?.facilityId
        ? getSeedBank(selectedOrganization, accessions[0].facilityId)
        : undefined,
    [accessions, selectedOrganization]
  );
  const timeZone = useLocationTimeZone().get(seedBank).id;

  const defaultWithdrawByWeight = useMemo(
    () => accessions.every((accession) => accession.remainingQuantity?.units !== 'Seeds') && accessions.length > 0,
    [accessions]
  );

  const makeDefaultDraft = useCallback(
    (): WithdrawDraft => ({
      purpose: 'Nursery',
      testType: 'Lab',
      withdrawnByUserId: user.id,
      date: getTodaysDateFormatted(timeZone),
      notes: '',
      withdrawByWeight: defaultWithdrawByWeight,
      withdrawByAccession: {},
      photos: [],
    }),
    [defaultWithdrawByWeight, timeZone, user.id]
  );

  const [draft, setDraft] = useState<WithdrawDraft>(makeDefaultDraft);
  const [step, setStep] = useState<FlowStep>(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [users, setUsers] = useState<OrganizationUser[]>();
  const [isCreating, setIsCreating] = useState(false);
  const [showDateWarning, setShowDateWarning] = useState(false);
  // Accessions already withdrawn in a prior (partial) submit are removed from the flow so a
  // retry cannot withdraw them again and decrement their inventory twice.
  const [completedAccessionIds, setCompletedAccessionIds] = useState<Set<number>>(() => new Set());

  const activeAccessions = useMemo(
    () => accessions.filter((accession) => !completedAccessionIds.has(accession.id)),
    [accessions, completedAccessionIds]
  );

  const isNursery = draft.purpose === 'Nursery';
  const isViability = draft.purpose === 'Viability Testing';
  const showPhotosStep = PHOTOS_ENABLED_PURPOSES.includes(draft.purpose);

  useEffect(() => {
    if (selectedOrganization) {
      void OrganizationUserService.getOrganizationUsers(selectedOrganization.id).then((response) => {
        if (response.requestSucceeded) {
          setUsers(response.users);
        }
      });
    }
  }, [selectedOrganization]);

  const updateDraft = useCallback((next: Partial<WithdrawDraft>) => {
    setDraft((prev) => {
      const purposeChanged = 'purpose' in next && next.purpose !== prev.purpose;
      const leavingNursery = purposeChanged && prev.purpose === 'Nursery' && next.purpose !== 'Nursery';
      return {
        ...prev,
        ...next,
        ...(leavingNursery ? { destinationFacilityId: undefined, batchId: undefined, readyByDate: undefined } : {}),
      };
    });
  }, []);

  const onChangeWithdrawBy = useCallback((byWeight: boolean) => {
    // Units differ between count and weight, so drop entered quantities on a mode switch.
    setDraft((prev) => ({ ...prev, withdrawByWeight: byWeight, withdrawByAccession: {} }));
  }, []);

  const setRow = useCallback((accessionId: number, quantity: WithdrawQuantity) => {
    setDraft((prev) => ({
      ...prev,
      withdrawByAccession: { ...prev.withdrawByAccession, [accessionId]: quantity },
    }));
  }, []);

  const setAllRows = useCallback((rows: Record<number, WithdrawQuantity>) => {
    setDraft((prev) => ({ ...prev, withdrawByAccession: rows }));
  }, []);

  const validateDate = useCallback(
    (id: string, value?: unknown): boolean => {
      if (!value) {
        if (id === 'date') {
          setFieldErrors((prev) => ({ ...prev, date: strings.REQUIRED_FIELD }));
          return false;
        }
        setFieldErrors((prev) => ({ ...prev, [id]: '' }));
        return true;
      }
      if (isNaN(new Date(value as string).getTime())) {
        setFieldErrors((prev) => ({ ...prev, [id]: strings.INVALID_DATE }));
        return false;
      }
      if (id === 'date' && isInTheFuture(value as string, timeZone)) {
        setFieldErrors((prev) => ({ ...prev, date: strings.NO_FUTURE_DATES }));
        return false;
      }
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
      return true;
    },
    [strings, timeZone]
  );

  const onChangeDate = useCallback(
    (id: 'date' | 'readyByDate', value: unknown) => {
      const dateString = value ? getDateDisplayValue((value as Date).getTime(), timeZone) : null;
      if (validateDate(id, value)) {
        updateDraft({ [id]: dateString ?? undefined });
      }
    },
    [timeZone, updateDraft, validateDate]
  );

  const handleClose = useCallback(() => {
    setStep(0);
    setDraft(makeDefaultDraft());
    setFieldErrors({});
    onClose();
  }, [makeDefaultDraft, onClose]);

  // Rows the user has entered any amount for (including an invalid 0/negative). Blank rows are
  // optional, but a populated row must pass validation before the form can be submitted.
  const populatedRows = useMemo(
    () =>
      activeAccessions
        .map((accession) => ({ accession, quantity: draft.withdrawByAccession[accession.id] }))
        .filter(({ quantity }) => quantity?.value !== undefined),
    [activeAccessions, draft.withdrawByAccession]
  );

  // The rows that will actually be withdrawn (a positive amount).
  const rowsToWithdraw = useMemo(
    () => populatedRows.filter(({ quantity }) => (quantity?.value ?? 0) > 0),
    [populatedRows]
  );

  const quantitiesValid = useMemo(() => {
    if (rowsToWithdraw.length === 0) {
      return false;
    }
    if (isViability && rowsToWithdraw.length !== 1) {
      return false;
    }
    // Validate every populated row, not just the ones being withdrawn, so a visibly-invalid entry
    // (0, negative, over-remaining, missing subset) blocks submission instead of being ignored.
    return populatedRows.every(
      ({ accession, quantity }) =>
        validateRow(accession, draft.purpose, draft.withdrawByWeight, quantity?.value, quantity?.units ?? 'Grams') ===
        ''
    );
  }, [draft.purpose, draft.withdrawByWeight, isViability, populatedRows, rowsToWithdraw.length]);

  const canGoNextFromStep1 = useMemo(() => {
    if (!draft.date || fieldErrors.date) {
      return false;
    }
    if (isNursery) {
      return draft.destinationFacilityId !== undefined && !fieldErrors.readyByDate && !fieldErrors.inventoryBatch;
    }
    if (isViability) {
      return !!draft.testType;
    }
    return true;
  }, [
    draft.date,
    draft.destinationFacilityId,
    draft.testType,
    fieldErrors.date,
    fieldErrors.inventoryBatch,
    fieldErrors.readyByDate,
    isNursery,
    isViability,
  ]);

  const seedCountFor = useCallback(
    (accession: AccessionWithdrawInfo, quantity?: WithdrawQuantity) =>
      estimatedSeedCount(accession, draft.withdrawByWeight, quantity?.value, quantity?.units ?? 'Grams'),
    [draft.withdrawByWeight]
  );

  // Each submit helper returns the ids of the accessions it successfully withdrew.
  const submitNursery = useCallback(async (): Promise<number[]> => {
    const succeeded: number[] = [];
    let batchId = draft.batchId;
    for (const { accession, quantity } of rowsToWithdraw) {
      try {
        const response = await createNurseryTransferWithdrawal({
          accessionId: accession.id,
          createNurseryTransferRequestPayload: {
            destinationFacilityId: draft.destinationFacilityId as number,
            batchId,
            germinatingQuantity: seedCountFor(accession, quantity),
            activeGrowthQuantity: 0,
            readyQuantity: 0,
            hardeningOffQuantity: 0,
            date: draft.date,
            readyByDate: draft.readyByDate || undefined,
            notes: draft.notes || undefined,
            withdrawnByUserId: draft.withdrawnByUserId,
          },
        }).unwrap();
        if (batchId === undefined) {
          batchId = Number(response.batch.id);
          // Persist the created batch so that, if a later transfer fails, a retry reuses this batch
          // instead of creating a second one for the same species.
          const createdBatchId = batchId;
          setDraft((prev) => ({ ...prev, batchId: createdBatchId }));
        }
        succeeded.push(accession.id);
      } catch {
        // The loop threads the batch id forward, so it is order-dependent: stop here and leave
        // every remaining (unattempted) accession pending so onSubmit reports and retries them.
        break;
      }
    }

    if (batchId !== undefined && draft.photos.length > 0) {
      await Promise.allSettled(draft.photos.map((file) => createBatchPhoto({ batchId, body: { file } }).unwrap()));
    }

    return succeeded;
  }, [createBatchPhoto, createNurseryTransferWithdrawal, draft, rowsToWithdraw, seedCountFor]);

  const submitWithdrawal = useCallback(async (): Promise<number[]> => {
    const results = await Promise.allSettled(
      rowsToWithdraw.map(({ accession, quantity }) =>
        createWithdrawal({
          accessionId: accession.id,
          createWithdrawalRequestPayload: {
            date: draft.date,
            notes: draft.notes || undefined,
            purpose: draft.purpose,
            withdrawnByUserId: draft.withdrawnByUserId,
            withdrawnQuantity: {
              quantity: quantity?.value ?? 0,
              units: draft.withdrawByWeight ? quantity?.units ?? 'Grams' : 'Seeds',
            },
          },
        }).unwrap()
      )
    );
    return results
      .map((result, index) => (result.status === 'fulfilled' ? rowsToWithdraw[index].accession.id : null))
      .filter((value): value is number => value !== null);
  }, [createWithdrawal, draft, rowsToWithdraw]);

  const submitViabilityTest = useCallback(async (): Promise<number[]> => {
    const { accession, quantity } = rowsToWithdraw[0];
    const payload: CreateViabilityTestRequestPayload = {
      testType: (draft.testType ?? 'Lab') as CreateViabilityTestRequestPayload['testType'],
      substrate: draft.substrate as CreateViabilityTestRequestPayload['substrate'],
      treatment: draft.treatment as CreateViabilityTestRequestPayload['treatment'],
      seedsTested: seedCountFor(accession, quantity),
      startDate: draft.date,
      withdrawnByUserId: draft.withdrawnByUserId,
    };
    try {
      await createViabilityTest({ accessionId: accession.id, createViabilityTestRequestPayload: payload }).unwrap();
      return [accession.id];
    } catch {
      return [];
    }
  }, [createViabilityTest, draft, rowsToWithdraw, seedCountFor]);

  const onSubmit = useCallback(async () => {
    if (!quantitiesValid) {
      return;
    }
    setIsCreating(true);
    try {
      let succeededIds: number[];
      if (isNursery) {
        succeededIds = await submitNursery();
      } else if (isViability) {
        succeededIds = await submitViabilityTest();
      } else {
        succeededIds = await submitWithdrawal();
      }

      // Anything requested but not confirmed succeeded (an outright failure, or a nursery row the
      // ordered loop never reached) is a failure the user must see and can retry.
      const succeeded = new Set(succeededIds);
      const failed = rowsToWithdraw
        .filter(({ accession }) => !succeeded.has(accession.id))
        .map(({ accession }) => accession.accessionNumber);

      if (failed.length === 0) {
        // Report the estimated number of seeds withdrawn (matching the previous flow), not the
        // number of accessions, so withdrawal analytics keep their meaning.
        const withdrawnSeeds = rowsToWithdraw.reduce(
          (sum, { accession, quantity }) => sum + seedCountFor(accession, quantity),
          0
        );
        trackEvent(MIXPANEL_EVENTS.ACCESSION_WITHDRAWN, {
          purpose: draft.purpose,
          quantity: withdrawnSeeds,
        });
        markSubmitted();
        snackbar.toastSuccess(strings.ACCESSION_WITHDRAW_SUCCESS);
        onWithdrawn?.();
        handleClose();
      } else {
        trackEvent(MIXPANEL_EVENTS.SAVE_FAILED, { entity_type: 'accession_withdrawal' });
        snackbar.toastError(strings.formatString(strings.WITHDRAW_PARTIAL_FAILURE, failed.join(', ')).toString());
        // Remove the accessions that did succeed from the flow entirely (and drop their entered
        // amounts) so the user cannot withdraw them a second time on retry.
        if (succeededIds.length > 0) {
          onWithdrawn?.();
          setCompletedAccessionIds((prev) => new Set([...prev, ...succeededIds]));
          setDraft((prev) => {
            const withdrawByAccession = { ...prev.withdrawByAccession };
            succeededIds.forEach((id) => delete withdrawByAccession[id]);
            return { ...prev, withdrawByAccession };
          });
        }
        setStep(1);
      }
    } finally {
      setIsCreating(false);
    }
  }, [
    draft.purpose,
    handleClose,
    isNursery,
    isViability,
    markSubmitted,
    onWithdrawn,
    quantitiesValid,
    rowsToWithdraw,
    seedCountFor,
    snackbar,
    strings,
    submitNursery,
    submitViabilityTest,
    submitWithdrawal,
    trackEvent,
  ]);

  const handleWithdrawClick = useCallback(() => {
    // Warn if the withdrawal date predates the received date of any accession being withdrawn.
    const withdrawalDate = draft.date ? new Date(draft.date) : undefined;
    const predatesReceived =
      withdrawalDate !== undefined &&
      rowsToWithdraw.some(
        ({ accession }) => accession.receivedDate && withdrawalDate < new Date(accession.receivedDate)
      );
    if (predatesReceived) {
      setShowDateWarning(true);
      return;
    }
    void onSubmit();
  }, [draft.date, onSubmit, rowsToWithdraw]);

  const lastStep: FlowStep = showPhotosStep ? 2 : 1;

  const middleButtons = useMemo(() => {
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
    const back = (
      <Button
        key='back'
        label={strings.BACK}
        onClick={() => setStep((s) => (s - 1) as FlowStep)}
        priority='secondary'
        disabled={isCreating}
      />
    );
    const withdraw = (
      <Button
        key='withdraw'
        label={strings.WITHDRAW}
        onClick={handleWithdrawClick}
        disabled={isCreating || !quantitiesValid}
      />
    );

    if (step === 0) {
      // Step 0 (Purpose) is never the last step: the flow always has at least Quantities after it.
      return [
        cancel,
        <Button key='next' label={strings.NEXT} onClick={() => setStep(1)} disabled={!canGoNextFromStep1} />,
      ];
    }
    if (step < lastStep) {
      return [
        cancel,
        back,
        <Button
          key='next'
          label={strings.NEXT}
          onClick={() => setStep((s) => (s + 1) as FlowStep)}
          disabled={step === 1 && !quantitiesValid}
        />,
      ];
    }
    return [cancel, back, withdraw];
  }, [canGoNextFromStep1, handleClose, handleWithdrawClick, isCreating, lastStep, quantitiesValid, step, strings]);

  const stepLabels = showPhotosStep
    ? [strings.PURPOSE, strings.QUANTITIES, strings.PHOTOS]
    : [strings.PURPOSE, strings.QUANTITIES];

  const speciesName = useMemo(() => {
    const first = activeAccessions[0];
    if (!first) {
      return '';
    }
    return first.commonName ? `${first.scientificName} (${first.commonName})` : first.scientificName;
  }, [activeAccessions]);

  return (
    <>
      {showDateWarning && (
        <WithdrawDateWarningModal
          onClose={() => setShowDateWarning(false)}
          onContinue={() => {
            setShowDateWarning(false);
            void onSubmit();
          }}
        />
      )}
      <DialogBox
        open={open}
        onClose={handleClose}
        title={strings.WITHDRAW_SEEDS}
        size='large'
        middleButtons={middleButtons}
        scrolled
      >
        <Stepper activeStep={step} sx={{ margin: theme.spacing(1, 0, 3) }}>
          {stepLabels.map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '.MuiStepIcon-root': { fill: theme.palette.TwClrBgTertiary },
                  '.MuiStepIcon-root.Mui-active': { fill: theme.palette.TwClrIcnSecondary },
                  '.MuiStepIcon-root.Mui-completed': { fill: theme.palette.TwClrTxtBrand },
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
          display='grid'
          gridTemplateColumns='110px 1fr'
          gap={theme.spacing(2)}
          textAlign='left'
        >
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {strings.SPECIES}
          </Typography>
          <Typography fontSize='14px'>{speciesName}</Typography>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {strings
              .formatString(
                activeAccessions.length === 1 ? strings.X_ACCESSION : strings.X_ACCESSIONS,
                activeAccessions.length
              )
              .toString()}
          </Typography>
          <Box display='flex' flexWrap='wrap' columnGap={theme.spacing(2)} rowGap={theme.spacing(1)}>
            {activeAccessions.map((accession) => (
              <Typography key={accession.id} component='span' fontSize='14px'>
                {accession.accessionNumber}
              </Typography>
            ))}
          </Box>
        </Box>

        {step === 0 && (
          <PurposeStep
            accessions={activeAccessions}
            isBulk={isBulk}
            draft={draft}
            onChange={updateDraft}
            fieldErrors={fieldErrors}
            setFieldError={(id, error) => setFieldErrors((prev) => ({ ...prev, [id]: error }))}
            onChangeDate={onChangeDate}
            timeZone={timeZone}
            users={users}
            userCanEdit={userCanEdit}
          />
        )}
        {step === 1 && (
          <QuantitiesStep
            accessions={activeAccessions}
            purpose={draft.purpose}
            withdrawByWeight={draft.withdrawByWeight}
            withdrawByAccession={draft.withdrawByAccession}
            onChangeWithdrawBy={onChangeWithdrawBy}
            setRow={setRow}
            setAllRows={setAllRows}
          />
        )}
        {step === 2 && showPhotosStep && (
          <PhotosStep photos={draft.photos} onPhotosChanged={(files) => updateDraft({ photos: files })} />
        )}
      </DialogBox>
    </>
  );
};

export default WithdrawSeedsForm;
