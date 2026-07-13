import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Step, StepLabel, Stepper, Tooltip, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Icon, IconTooltip } from '@terraware/web-components';
import { DateTime } from 'luxon';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import DatePicker from 'src/components/common/DatePicker';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import SelectPhotos from 'src/components/common/Photos/SelectPhotos';
import Button from 'src/components/common/button/Button';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization } from 'src/providers';
import {
  useCreateBatchWithdrawalMutation,
  useUploadWithdrawalPhotoMutation,
} from 'src/queries/generated/nurseryWithdrawals';
import { ScheduledDatePayload, useGetScheduledPlantingDatesQuery } from 'src/queries/generated/plantingSeasons';
import {
  BatchForWithdraw,
  useLazyListBatchesForWithdrawQuery,
  useListBatchesForWithdrawQuery,
} from 'src/queries/search/batchesForWithdraw';
import { PlantingDateRequestRow } from 'src/queries/search/plantingDateRequests';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import { getMediumDate } from 'src/utils/dateFormatter';
import useSnackbar from 'src/utils/useSnackbar';

import NurserySummaryRow from './NurserySummaryRow';
import RequestSpeciesBox from './RequestSpeciesBox';

const scheduledDateSpeciesKey = ({ quantity, speciesId, substratumId }: ScheduledDatePayload['species'][0]) =>
  `${substratumId}-${speciesId}-${quantity}`;

const requestSpeciesKey = (substratumId: number, species: PlantingDateRequestRow['substrata'][0]['species'][0]) =>
  `${substratumId}-${species.speciesId}-${species.quantity}`;

const scheduledDateMatchesRequest = (scheduledDate: ScheduledDatePayload, request: PlantingDateRequestRow): boolean => {
  const scheduledSpeciesKeys = scheduledDate.species.map(scheduledDateSpeciesKey).sort();
  const requestSpeciesKeys = request.substrata
    .flatMap((substratum) => substratum.species.map((species) => requestSpeciesKey(substratum.substratumId, species)))
    .sort();

  return (
    scheduledSpeciesKeys.length === requestSpeciesKeys.length &&
    scheduledSpeciesKeys.every((key, index) => key === requestSpeciesKeys[index])
  );
};

type WithdrawFromBatchesModalProps = {
  open: boolean;
  onClose: () => void;
  request: PlantingDateRequestRow;
  plantingSiteId: number;
  plantingSeasonId: number;
};

type FlowStep = 0 | 1 | 2;

const WithdrawFromBatchesModal = ({
  open,
  onClose,
  request,
  plantingSiteId,
  plantingSeasonId,
}: WithdrawFromBatchesModalProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();
  const { availableProjects: projects } = useProjects();

  const [step, setStep] = useState<FlowStep>(0);
  const [facilityId, setFacilityId] = useState<number | undefined>(undefined);
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [withdrawDate, setWithdrawDate] = useState<string>(DateTime.local().toISODate() ?? '');
  // Keyed by `${batchId}-${substratumId}` so the same batch can be split across substrata.
  const [withdrawByBatchSubstratum, setWithdrawByBatchSubstratum] = useState<Record<string, number>>({});
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const cellKey = (batchId: number, substratumId: number) => `${batchId}-${substratumId}`;

  const [listBatches, { currentData: batches }] = useLazyListBatchesForWithdrawQuery();
  const [createBatchWithdrawal, { isLoading: isSaving }] = useCreateBatchWithdrawalMutation();
  const [uploadWithdrawalPhotos] = useUploadWithdrawalPhotoMutation();
  const { data: scheduledDatesData } = useGetScheduledPlantingDatesQuery(plantingSeasonId, { skip: !open });

  const speciesIds = useMemo(() => request.species.map((s) => s.speciesId), [request.species]);
  const organizationId = selectedOrganization?.id;

  const { currentData: batchesForNurseryOptions, isFetching: isFetchingNurseryOptions } =
    useListBatchesForWithdrawQuery(
      { organizationId: organizationId ?? 0, speciesIds },
      { skip: !open || !organizationId || speciesIds.length === 0 }
    );

  const nurseryOptions = useMemo<DropdownItem[]>(() => {
    const nurseryIdsWithReadyPlants = new Set(
      (batchesForNurseryOptions ?? []).filter((batch) => batch.readyQuantity > 0).map((batch) => batch.facilityId)
    );
    const nurseries = (selectedOrganization?.facilities ?? []).filter(
      (f) => f.type === 'Nursery' && nurseryIdsWithReadyPlants.has(f.id)
    );
    return nurseries.map((f) => ({ label: f.name, value: f.id }));
  }, [batchesForNurseryOptions, selectedOrganization]);

  const handleFacilityChange = useCallback((id: number | undefined) => {
    setFacilityId(id);
    setProjectId(undefined);
    setWithdrawByBatchSubstratum({});
  }, []);

  const handleProjectChange = useCallback((id: number | undefined) => {
    setProjectId(id);
    setWithdrawByBatchSubstratum({});
  }, []);

  useEffect(() => {
    if (facilityId && organizationId && speciesIds.length > 0) {
      void listBatches({ organizationId, facilityId, speciesIds }, true);
    }
  }, [facilityId, organizationId, speciesIds, listBatches]);

  useEffect(() => {
    if (facilityId === undefined || isFetchingNurseryOptions) {
      return;
    }

    if (!nurseryOptions.some((option) => Number(option.value) === facilityId)) {
      handleFacilityChange(undefined);
    }
  }, [facilityId, handleFacilityChange, isFetchingNurseryOptions, nurseryOptions]);

  const availableProjectsForBatches = useMemo<Project[] | undefined>(
    () =>
      projects?.filter((project: Project) =>
        (batchesForNurseryOptions ?? []).some(
          (batch) =>
            batch.readyQuantity > 0 &&
            batch.projectId === project.id &&
            (facilityId === undefined || batch.facilityId === facilityId)
        )
      ),
    [batchesForNurseryOptions, facilityId, projects]
  );

  useEffect(() => {
    if (
      projectId !== undefined &&
      availableProjectsForBatches &&
      !availableProjectsForBatches.some((project) => project.id === projectId)
    ) {
      handleProjectChange(undefined);
    }
  }, [availableProjectsForBatches, handleProjectChange, projectId]);

  const readyBatches = useMemo(
    () =>
      (batches ?? []).filter(
        (batch) =>
          batch.readyQuantity > 0 &&
          (facilityId === undefined || batch.facilityId === facilityId) &&
          (projectId === undefined || batch.projectId === projectId)
      ),
    [batches, facilityId, projectId]
  );

  const readyBySpecies = useMemo(() => {
    const map = new Map<number, number>();
    readyBatches.forEach((b) => {
      map.set(b.speciesId, (map.get(b.speciesId) ?? 0) + b.readyQuantity);
    });
    return map;
  }, [readyBatches]);

  const batchesBySpecies = useMemo(() => {
    const map = new Map<number, BatchForWithdraw[]>();
    readyBatches.forEach((b) => {
      const existing = map.get(b.speciesId) ?? [];
      existing.push(b);
      map.set(b.speciesId, existing);
    });
    return map;
  }, [readyBatches]);

  const totalWithdrawing = useMemo(
    () => Object.values(withdrawByBatchSubstratum).reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0),
    [withdrawByBatchSubstratum]
  );

  // Sum per batch across all substrata so we can compare against the batch's readyQuantity.
  const totalByBatch = useMemo(() => {
    const map = new Map<number, number>();
    Object.entries(withdrawByBatchSubstratum).forEach(([key, qty]) => {
      const batchId = Number(key.split('-')[0]);
      map.set(batchId, (map.get(batchId) ?? 0) + (Number.isFinite(qty) ? qty : 0));
    });
    return map;
  }, [withdrawByBatchSubstratum]);

  const anyOverReady = useMemo(
    () => readyBatches.some((b) => (totalByBatch.get(b.batchId) ?? 0) > b.readyQuantity),
    [readyBatches, totalByBatch]
  );

  const canGoNextFromStep1 = facilityId !== undefined && !!withdrawDate;
  const canGoNextFromStep2 = totalWithdrawing > 0 && !anyOverReady;

  const scheduledPlantingDateId = useMemo(() => {
    const dateMatches = (scheduledDatesData?.scheduledDates ?? []).filter(
      (scheduledDate) => scheduledDate.date === request.date
    );
    if (dateMatches.length === 1) {
      return dateMatches[0].scheduledPlantingDateId;
    }
    return dateMatches.find((scheduledDate) => scheduledDateMatchesRequest(scheduledDate, request))
      ?.scheduledPlantingDateId;
  }, [request, scheduledDatesData]);

  const handleClose = useCallback(() => {
    setStep(0);
    setFacilityId(undefined);
    setProjectId(undefined);
    setWithdrawDate(DateTime.local().toISODate() ?? '');
    setWithdrawByBatchSubstratum({});
    setPhotoFiles([]);
    onClose();
  }, [onClose]);

  const onSubmit = useCallback(async () => {
    if (!facilityId || scheduledPlantingDateId === undefined) {
      snackbar.toastError();
      return;
    }
    try {
      // Group draft quantities by substratum: one withdrawal per substratum.
      const bySubstratum = new Map<number, { batchId: number; quantity: number }[]>();
      Object.entries(withdrawByBatchSubstratum).forEach(([key, quantity]) => {
        if (quantity <= 0) {
          return;
        }
        const [batchIdStr, substratumIdStr] = key.split('-');
        const batchId = Number(batchIdStr);
        const substratumId = Number(substratumIdStr);
        const existing = bySubstratum.get(substratumId) ?? [];
        existing.push({ batchId, quantity });
        bySubstratum.set(substratumId, existing);
      });

      const withdrawalIds: number[] = [];
      for (const [substratumId, entries] of bySubstratum.entries()) {
        const response = await createBatchWithdrawal({
          batchWithdrawals: entries.map((e) => ({
            batchId: e.batchId,
            readyQuantityWithdrawn: e.quantity,
            notReadyQuantityWithdrawn: 0,
            germinatingQuantityWithdrawn: 0,
            activeGrowthQuantityWithdrawn: 0,
          })),
          facilityId,
          purpose: 'Out Plant',
          plantingSiteId,
          plantingSeasonId,
          substratumId,
          scheduledPlantingDateRequestId: scheduledPlantingDateId,
          withdrawnDate: withdrawDate,
        }).unwrap();
        if (response?.withdrawal?.id) {
          withdrawalIds.push(response.withdrawal.id);
        }
      }

      // Attach photos to the first withdrawal we created.
      if (photoFiles.length > 0 && withdrawalIds[0] !== undefined) {
        await Promise.all(
          photoFiles.map((file) =>
            uploadWithdrawalPhotos({
              withdrawalId: withdrawalIds[0],
              body: { file },
            }).unwrap()
          )
        );
      }

      handleClose();
    } catch (e) {
      snackbar.toastError();
    }
  }, [
    createBatchWithdrawal,
    facilityId,
    handleClose,
    photoFiles,
    plantingSeasonId,
    plantingSiteId,
    scheduledPlantingDateId,
    snackbar,
    uploadWithdrawalPhotos,
    withdrawByBatchSubstratum,
    withdrawDate,
  ]);

  const middleButtons: JSX.Element[] = useMemo(() => {
    const cancelButton = (
      <Button
        key='cancel'
        label={strings.CANCEL}
        onClick={handleClose}
        priority='secondary'
        type='passive'
        disabled={isSaving}
      />
    );
    if (step === 0) {
      return [
        cancelButton,
        <Button key='next' label={strings.NEXT} onClick={() => setStep(1)} disabled={!canGoNextFromStep1} />,
      ];
    }
    const backButton = (
      <Button
        key='back'
        label={strings.BACK}
        onClick={() => setStep((s) => (s === 2 ? 1 : 0) as FlowStep)}
        priority='secondary'
        disabled={isSaving}
      />
    );
    if (step === 1) {
      return [
        cancelButton,
        backButton,
        <Button key='next' label={strings.NEXT} onClick={() => setStep(2)} disabled={!canGoNextFromStep2} />,
      ];
    }
    return [
      cancelButton,
      backButton,
      <Button
        key='withdraw'
        label={strings.WITHDRAW}
        onClick={() => void onSubmit()}
        disabled={isSaving || !canGoNextFromStep2 || scheduledPlantingDateId === undefined}
      />,
    ];
  }, [handleClose, isSaving, step, canGoNextFromStep2, canGoNextFromStep1, onSubmit, scheduledPlantingDateId]);

  const stepLabels = [strings.PURPOSE, strings.QUANTITIES, strings.PHOTOS];

  return (
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
                '.MuiStepIcon-root.Mui-active, .MuiStepIcon-root.Mui-completed': {
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
        display='grid'
        gridTemplateColumns='repeat(3, minmax(0, 1fr))'
        alignItems='center'
        columnGap={theme.spacing(3)}
        marginBottom={theme.spacing(3)}
        color={theme.palette.TwClrTxtSecondary}
      >
        <Typography textAlign='center'>{request.plantingSiteName}</Typography>
        <Typography textAlign='center'>{request.plantingSeasonName}</Typography>
        <Typography textAlign='center' sx={{ whiteSpace: 'nowrap' }}>
          {getMediumDate(request.date, activeLocale)}
        </Typography>
      </Box>

      {step === 0 && (
        <Step1Content
          facilityId={facilityId}
          setFacilityId={handleFacilityChange}
          projectId={projectId}
          setProjectId={handleProjectChange}
          withdrawDate={withdrawDate}
          setWithdrawDate={setWithdrawDate}
          nurseryOptions={nurseryOptions}
          isFetchingNurseryOptions={isFetchingNurseryOptions}
          projectOptions={availableProjectsForBatches}
          requestSpecies={request.species}
          readyBySpecies={readyBySpecies}
        />
      )}
      {step === 1 && (
        <Step2Content
          substrata={request.substrata}
          batchesBySpecies={batchesBySpecies}
          withdrawByBatchSubstratum={withdrawByBatchSubstratum}
          totalByBatch={totalByBatch}
          setWithdrawByBatchSubstratum={setWithdrawByBatchSubstratum}
          cellKey={cellKey}
        />
      )}
      {step === 2 && (
        <Box>
          <SelectPhotos onPhotosChanged={setPhotoFiles} multipleSelection />
        </Box>
      )}
    </DialogBox>
  );
};

type Step1ContentProps = {
  facilityId: number | undefined;
  setFacilityId: (id: number | undefined) => void;
  projectId: number | undefined;
  setProjectId: (id: number | undefined) => void;
  withdrawDate: string;
  setWithdrawDate: (date: string) => void;
  nurseryOptions: DropdownItem[];
  isFetchingNurseryOptions: boolean;
  projectOptions?: Project[];
  requestSpecies: PlantingDateRequestRow['species'];
  readyBySpecies: Map<number, number>;
};

const Step1Content = ({
  facilityId,
  setFacilityId,
  projectId,
  setProjectId,
  withdrawDate,
  setWithdrawDate,
  nurseryOptions,
  isFetchingNurseryOptions,
  projectOptions,
  requestSpecies,
  readyBySpecies,
}: Step1ContentProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const sortedRequestSpecies = useMemo(
    () =>
      requestSpecies
        .filter((species) => species.requestedQuantity > 0)
        .sort(
          (first, second) =>
            first.scientificName.localeCompare(second.scientificName, activeLocale || undefined) ||
            first.speciesId - second.speciesId
        ),
    [activeLocale, requestSpecies]
  );

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(2)}>
      <Box display='grid' gridTemplateColumns='66px 1fr' gap={theme.spacing(3)} maxWidth='320px' alignItems={'center'}>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} textAlign='left'>
          {strings.PURPOSE_REQUIRED}
        </Typography>
        <Box display={'flex'}>
          <Typography fontSize='16px' fontWeight={500} color={theme.palette.TwClrTxt} textAlign='left'>
            {strings.PLANTING}
          </Typography>
          <IconTooltip placement='top' title={strings.PLANTINGS_REQUIRE_READY_TO_PLANT_SEEDLINGS} />
        </Box>
      </Box>

      <Box maxWidth='320px'>
        <DatePicker
          id='withdraw-date'
          label={strings.WITHDRAW_DATE_REQUIRED}
          value={withdrawDate}
          onDateChange={(value?: DateTime) => setWithdrawDate(value?.toISODate() ?? '')}
          aria-label='withdraw-date'
          sx={{ textAlign: 'left' }}
        />
      </Box>
      <Box display='flex' gap={theme.spacing(2)} flexWrap='wrap'>
        <Box flex={1} minWidth='240px' maxWidth='320px'>
          {!isFetchingNurseryOptions && nurseryOptions.length === 0 ? (
            <>
              <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} textAlign='left'>
                {strings.FROM_NURSERY_REQUIRED}
              </Typography>
              <Typography fontSize='16px' fontWeight={500} color={theme.palette.TwClrTxt} textAlign='left'>
                {strings.NO_NURSERIES_WITH_REQUESTED_SPECIES}
              </Typography>
            </>
          ) : (
            <Dropdown
              id='nursery'
              label={strings.FROM_NURSERY_REQUIRED}
              placeholder={strings.SELECT_NURSERY}
              options={nurseryOptions}
              selectedValue={facilityId}
              onChange={(value) => setFacilityId(value !== undefined && value !== '' ? Number(value) : undefined)}
              fullWidth
              sx={{ textAlign: 'left' }}
              fixedMenu
            />
          )}
        </Box>

        {facilityId !== undefined && (projectOptions?.length ?? 0) > 0 && (
          <Box flex={1} minWidth='240px' maxWidth='320px' textAlign='left'>
            <ProjectsDropdown<{ projectId?: number }>
              availableProjects={projectOptions}
              label={strings.PROJECT}
              record={{ projectId }}
              setRecord={(setFn) => {
                const nextRecord = setFn({ projectId });
                setProjectId(nextRecord.projectId);
              }}
            />
          </Box>
        )}
      </Box>

      {facilityId !== undefined && (
        <Box marginTop={theme.spacing(2)} sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}>
          <Box
            padding={theme.spacing(1.5, 2)}
            sx={{
              borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              backgroundColor: theme.palette.TwClrBgSecondary,
            }}
          >
            <Box display='flex' alignItems='center' gap={theme.spacing(0.5)}>
              <Typography fontSize='16px' fontWeight={400} textAlign={'left'} color={theme.palette.TwClrTxt}>
                {strings.NURSERY_SUMMARY}
              </Typography>
              <Tooltip title={strings.NURSERY_SUMMARY_TOOLTIP}>
                <Box display='flex' alignItems='center'>
                  <Icon name='info' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
                </Box>
              </Tooltip>
            </Box>
          </Box>
          <Box
            display='grid'
            gridTemplateColumns='2fr 1fr 1fr 1fr'
            gap={theme.spacing(1)}
            padding={theme.spacing(1, 2)}
            sx={{
              backgroundColor: theme.palette.TwClrBgSecondary,
            }}
          >
            <Typography fontSize='14px' fontWeight={600} textAlign='left' color={theme.palette.TwClrTxt}>
              {strings.SPECIES}
            </Typography>
            <Typography fontSize='14px' fontWeight={600} textAlign='right' color={theme.palette.TwClrTxt}>
              {strings.READY_TO_PLANT}
            </Typography>
            <Typography fontSize='14px' fontWeight={600} textAlign='right' color={theme.palette.TwClrTxt}>
              {strings.REQUESTED}
            </Typography>
            <Typography fontSize='14px' fontWeight={600} textAlign='right' color={theme.palette.TwClrTxt}>
              {strings.COVERAGE}
            </Typography>
          </Box>
          {sortedRequestSpecies.map((s, index) => (
            <NurserySummaryRow
              key={s.speciesId}
              species={s}
              ready={readyBySpecies.get(s.speciesId) ?? 0}
              index={index}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

type Step2ContentProps = {
  substrata: PlantingDateRequestRow['substrata'];
  batchesBySpecies: Map<number, BatchForWithdraw[]>;
  withdrawByBatchSubstratum: Record<string, number>;
  totalByBatch: Map<number, number>;
  setWithdrawByBatchSubstratum: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
  cellKey: (batchId: number, substratumId: number) => string;
};

const Step2Content = ({
  substrata,
  batchesBySpecies,
  withdrawByBatchSubstratum,
  totalByBatch,
  setWithdrawByBatchSubstratum,
  cellKey,
}: Step2ContentProps): JSX.Element => {
  const theme = useTheme();

  const withdrawableSubstrata = useMemo(
    () =>
      substrata
        .map((substratum) => ({
          ...substratum,
          species: substratum.species.filter((species) => (batchesBySpecies.get(species.speciesId)?.length ?? 0) > 0),
        }))
        .filter((substratum) => substratum.species.length > 0),
    [batchesBySpecies, substrata]
  );

  if (withdrawableSubstrata.length === 0) {
    return (
      <Box padding={theme.spacing(2)}>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {'-'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(3)}>
      {withdrawableSubstrata.map((substratum) => (
        <Box key={substratum.substratumId} display='flex' flexDirection='column' gap={theme.spacing(2)}>
          <Box display='flex' gap={theme.spacing(6)}>
            <Box flexGrow={1}>
              <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} textAlign='left'>
                {`${strings.STRATUM} *`}
              </Typography>
              <Typography fontSize='16px' fontWeight={500} textAlign='left'>
                {substratum.stratumName}
              </Typography>
            </Box>
            <Box flexGrow={1}>
              <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} textAlign='left'>
                {`${strings.SUBSTRATUM} *`}
              </Typography>
              <Typography fontSize='16px' fontWeight={500} textAlign='left'>
                {substratum.substratumName}
              </Typography>
            </Box>
          </Box>
          {substratum.species.map((s) => (
            <RequestSpeciesBox
              key={s.speciesId}
              species={s}
              substratumId={substratum.substratumId}
              batches={batchesBySpecies.get(s.speciesId) ?? []}
              withdrawByBatchSubstratum={withdrawByBatchSubstratum}
              totalByBatch={totalByBatch}
              setWithdrawByBatchSubstratum={setWithdrawByBatchSubstratum}
              cellKey={cellKey}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default WithdrawFromBatchesModal;
