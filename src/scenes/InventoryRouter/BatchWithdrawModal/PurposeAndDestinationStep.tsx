import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, FormControlLabel, Radio, RadioGroup, Tooltip, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Icon, IconTooltip } from '@terraware/web-components';
import { DateTime } from 'luxon';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import DatePicker from 'src/components/common/DatePicker';
import TextField from 'src/components/common/Textfield/Textfield';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSeasonsQuery } from 'src/queries/generated/plantingSeasons';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import { SpeciesTargetForSubstratum } from 'src/queries/search/speciesTargetsForSubstratum';
import { NurseryWithdrawalPurpose, NurseryWithdrawalRequestPurposes } from 'src/types/Batch';
import { Project } from 'src/types/Project';

import SpeciesTargetsTable from './SpeciesTargetsTable';
import { BatchInfo, BatchWithdrawDraft } from './types';

const NO_PLANTING_SEASON_VALUE = 'no-planting-season';

type PurposeAndDestinationStepProps = {
  batches: BatchInfo[];
  contributor: boolean;
  draft: BatchWithdrawDraft;
  speciesTargets?: SpeciesTargetForSubstratum[];
  onChange: (next: Partial<BatchWithdrawDraft>) => void;
};

const PurposeAndDestinationStep = ({
  batches,
  contributor,
  draft,
  speciesTargets,
  onChange,
}: PurposeAndDestinationStepProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const { availableProjects: projects } = useProjects();

  const [
    listPlantingSites,
    { data: plantingSitesData, isFetching: isPlantingSitesLoading, isUninitialized: isPlantingSitesUninitialized },
  ] = useLazyListPlantingSitesQuery();
  const [listPlantingSeasons, { data: plantingSeasonsData }] = useLazyListPlantingSeasonsQuery();

  useEffect(() => {
    if (organizationId) {
      // `full: true` returns each site's strata/substrata, which we need to
      // populate the Stratum/Substratum dropdowns without a second request.
      void listPlantingSites({ organizationId, full: true }, true);
      void listPlantingSeasons({ organizationId }, true);
    }
  }, [organizationId, listPlantingSites, listPlantingSeasons]);

  const plantingSites = useMemo(() => plantingSitesData?.sites ?? [], [plantingSitesData]);

  const selectedPlantingSite = useMemo(
    () => plantingSites.find((s) => s.id === draft.plantingSiteId),
    [plantingSites, draft.plantingSiteId]
  );

  const purpose = draft.purpose;
  const isPlanting = purpose === NurseryWithdrawalRequestPurposes.OUTPLANT;
  const isNurseryTransfer = purpose === NurseryWithdrawalRequestPurposes.NURSERY_TRANSFER;
  const shouldShowSpeciesTargets =
    isPlanting &&
    draft.plantingSeasonId !== undefined &&
    draft.stratumId !== undefined &&
    draft.substratumId !== undefined;

  const eligibleBatchesForFromNursery = useMemo(
    () => (isPlanting ? batches.filter((batch) => batch.readyQuantity > 0) : batches),
    [batches, isPlanting]
  );

  // From: Nursery options are restricted to nurseries that hold at least one
  // of the selected batches — a withdrawal can only span a single facility.
  const fromNurseryOptions = useMemo<DropdownItem[]>(() => {
    const facilityIdsInSelection = new Set(eligibleBatchesForFromNursery.map((b) => b.facilityId));
    const nurseries = (selectedOrganization?.facilities ?? []).filter(
      (f) => f.type === 'Nursery' && facilityIdsInSelection.has(f.id)
    );
    return nurseries.map((f) => ({ label: f.name, value: f.id }));
  }, [eligibleBatchesForFromNursery, selectedOrganization]);

  // To: Nursery (for transfers) excludes the From: Nursery; uses every nursery
  // in the org since destinations aren't constrained by the selected batches.
  const toNurseryOptions = useMemo<DropdownItem[]>(() => {
    const nurseries = (selectedOrganization?.facilities ?? []).filter((f) => f.type === 'Nursery');
    return nurseries.filter((f) => f.id !== draft.fromFacilityId).map((f) => ({ label: f.name, value: f.id }));
  }, [selectedOrganization, draft.fromFacilityId]);

  const availableProjectsForBatches = useMemo<Project[] | undefined>(
    () =>
      projects?.filter((project: Project) =>
        batches.some(
          (batch) =>
            batch.projectId === project.id &&
            (draft.fromFacilityId === undefined || batch.facilityId === draft.fromFacilityId) &&
            (!isPlanting || batch.readyQuantity > 0)
        )
      ),
    [batches, draft.fromFacilityId, isPlanting, projects]
  );

  const nurseryTransferDisabled = toNurseryOptions.length === 0;

  const plantingSiteOptions = useMemo<DropdownItem[]>(
    () =>
      plantingSites
        .toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
        .map((s) => ({ label: s.name, value: s.id })),
    [activeLocale, plantingSites]
  );

  // Non-closed seasons with species targets for the selected planting site.
  const selectableSeasonsForSite = useMemo(() => {
    const seasons = plantingSeasonsData?.seasons ?? [];
    if (!draft.plantingSiteId) {
      return [];
    }
    return seasons.filter(
      (s) => s.plantingSiteId === draft.plantingSiteId && s.status !== 'Closed' && s.speciesTargets.length > 0
    );
  }, [plantingSeasonsData, draft.plantingSiteId]);

  // The "Planting Season (optional)" selector is shown only when the org has
  // any non-closed planting season with species targets.
  const showPlantingSeasonSelector = useMemo(
    () => (plantingSeasonsData?.seasons ?? []).some((s) => s.status !== 'Closed' && s.speciesTargets.length > 0),
    [plantingSeasonsData]
  );

  const plantingSeasonOptions = useMemo<DropdownItem[]>(
    () => [
      { label: strings.NO_SEASON, value: NO_PLANTING_SEASON_VALUE },
      ...selectableSeasonsForSite
        .toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
        .map((s) => ({ label: s.name, value: s.id })),
    ],
    [activeLocale, selectableSeasonsForSite, strings.NO_SEASON]
  );

  // Stratum/Substratum options come from either the selected season's targets
  // or the planting site itself.
  const selectedSeason = useMemo(
    () => selectableSeasonsForSite.find((s) => s.id === draft.plantingSeasonId),
    [selectableSeasonsForSite, draft.plantingSeasonId]
  );

  const { stratumOptions, substratumOptions } = useMemo(() => {
    const allStrata = selectedPlantingSite?.strata ?? [];
    if (selectedSeason) {
      const allowedSubstratumIds = new Set(selectedSeason.speciesTargets.map((t) => t.substratumId));
      const filteredStrata = allStrata
        .map((str) => ({
          ...str,
          substrata: str.substrata.filter((sub) => allowedSubstratumIds.has(sub.id)),
        }))
        .filter((str) => str.substrata.length > 0);
      return {
        stratumOptions: filteredStrata.map((s) => ({ label: s.name, value: s.id })),
        substratumOptions:
          filteredStrata
            .find((s) => s.id === draft.stratumId)
            ?.substrata.map((sub) => ({ label: sub.name, value: sub.id })) ?? [],
      };
    }
    return {
      stratumOptions: allStrata.map((s) => ({ label: s.name, value: s.id })),
      substratumOptions:
        allStrata.find((s) => s.id === draft.stratumId)?.substrata.map((sub) => ({ label: sub.name, value: sub.id })) ??
        [],
    };
  }, [selectedPlantingSite, selectedSeason, draft.stratumId]);

  // Default From: Nursery to the batches' nursery if they all share one.
  useEffect(() => {
    if (draft.fromFacilityId === undefined && eligibleBatchesForFromNursery.length > 0) {
      const uniqueIds = Array.from(new Set(eligibleBatchesForFromNursery.map((b) => b.facilityId)));
      if (uniqueIds.length === 1) {
        onChange({ fromFacilityId: uniqueIds[0] });
      }
    }
  }, [draft.fromFacilityId, eligibleBatchesForFromNursery, onChange]);

  useEffect(() => {
    if (
      draft.fromFacilityId !== undefined &&
      !fromNurseryOptions.some((option) => Number(option.value) === draft.fromFacilityId)
    ) {
      onChange({ fromFacilityId: undefined });
    }
  }, [draft.fromFacilityId, fromNurseryOptions, onChange]);

  useEffect(() => {
    if (
      draft.projectId !== undefined &&
      availableProjectsForBatches &&
      !availableProjectsForBatches.some((project) => project.id === draft.projectId)
    ) {
      onChange({ projectId: undefined });
    }
  }, [availableProjectsForBatches, draft.projectId, onChange]);

  const hasReadyQuantities = useMemo(
    () =>
      batches.some(
        (batch) =>
          (draft.fromFacilityId === undefined || batch.facilityId === draft.fromFacilityId) && batch.readyQuantity > 0
      ),
    [batches, draft.fromFacilityId]
  );

  const noReadySeedlings = !hasReadyQuantities;
  const plantingSitesLoaded = !isPlantingSitesUninitialized && !isPlantingSitesLoading;
  const plantingSitesDisabled = plantingSitesLoaded && plantingSites.length === 0;
  const outplantDisabled = noReadySeedlings || plantingSitesDisabled;

  useEffect(() => {
    if (draft.purpose === NurseryWithdrawalRequestPurposes.OUTPLANT && outplantDisabled) {
      onChange({ purpose: NurseryWithdrawalRequestPurposes.NURSERY_TRANSFER });
    }
  }, [draft.purpose, onChange, outplantDisabled]);

  useEffect(() => {
    if (draft.purpose === NurseryWithdrawalRequestPurposes.NURSERY_TRANSFER && nurseryTransferDisabled) {
      onChange({ destinationFacilityId: undefined, purpose: NurseryWithdrawalRequestPurposes.DEAD });
    }
  }, [draft.purpose, nurseryTransferDisabled, onChange]);

  const outplantLabel = (
    <>
      {strings.PLANTING}
      {noReadySeedlings && <IconTooltip placement='top' title={strings.PLANTINGS_REQUIRE_READY_TO_PLANT_SEEDLINGS} />}
      {!noReadySeedlings && plantingSitesDisabled && (
        <IconTooltip placement='top' title={strings.PLANTINGS_REQUIRE_PLANTING_SITES} />
      )}
    </>
  );

  const nurseryTransferLabel = (
    <>
      {strings.NURSERY_TRANSFER}
      {nurseryTransferDisabled && (
        <IconTooltip placement='top' title={strings.NURSERY_TRANSFERS_REQUIRE_DESTINATIONS} />
      )}
    </>
  );

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(2)}>
      <Box display='flex' alignItems='center' gap={theme.spacing(2)} flexWrap='wrap'>
        <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrTxtSecondary}>
          {strings.PURPOSE_REQUIRED}
        </Typography>
        <RadioGroup
          row
          value={purpose}
          onChange={(_event, value) => onChange({ purpose: value as NurseryWithdrawalPurpose })}
        >
          <FormControlLabel value={NurseryWithdrawalRequestPurposes.DEAD} control={<Radio />} label={strings.DEAD} />
          {!contributor && (
            <FormControlLabel
              value={NurseryWithdrawalRequestPurposes.OUTPLANT}
              control={<Radio />}
              label={outplantLabel}
              disabled={outplantDisabled}
            />
          )}
          <FormControlLabel
            value={NurseryWithdrawalRequestPurposes.NURSERY_TRANSFER}
            control={<Radio />}
            label={nurseryTransferLabel}
            disabled={nurseryTransferDisabled}
          />
          <FormControlLabel value={NurseryWithdrawalRequestPurposes.OTHER} control={<Radio />} label={strings.OTHER} />
        </RadioGroup>
      </Box>

      <Box maxWidth='320px'>
        <Dropdown
          id='from-nursery'
          label={strings.FROM_NURSERY_REQUIRED}
          options={fromNurseryOptions}
          selectedValue={draft.fromFacilityId}
          onChange={(value) => onChange({ fromFacilityId: value !== undefined ? Number(value) : undefined })}
          fullWidth
          sx={{ textAlign: 'left' }}
        />
      </Box>

      {batches.length > 1 && (availableProjectsForBatches?.length ?? 0) > 0 && (
        <Box maxWidth='320px' textAlign='left'>
          <ProjectsDropdown<{ projectId?: number }>
            availableProjects={availableProjectsForBatches}
            label={strings.PROJECT}
            record={{ projectId: draft.projectId }}
            setRecord={(setFn) => {
              const nextRecord = setFn({ projectId: draft.projectId });
              onChange({ projectId: nextRecord.projectId });
            }}
          />
        </Box>
      )}

      {isPlanting && (
        <Box maxWidth='320px'>
          <Dropdown
            id='to-planting-site'
            label={strings.TO_PLANTING_SITE_REQUIRED}
            options={plantingSiteOptions}
            selectedValue={draft.plantingSiteId}
            onChange={(value) =>
              onChange({
                plantingSiteId: value !== undefined ? Number(value) : undefined,
                plantingSeasonId: undefined,
                stratumId: undefined,
                substratumId: undefined,
              })
            }
            fullWidth
            sx={{ textAlign: 'left' }}
          />
        </Box>
      )}

      {isPlanting && showPlantingSeasonSelector && (
        <Box
          maxWidth={draft.plantingSiteId !== undefined && selectableSeasonsForSite.length === 0 ? undefined : '320px'}
        >
          <Box display='flex' alignItems='center' gap={theme.spacing(0.5)} marginBottom={theme.spacing(0.5)}>
            <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
              {strings.PLANTING_SEASON_OPTIONAL}
            </Typography>
            <Tooltip title={strings.PLANTING_SEASON_OPTIONAL_TOOLTIP}>
              <Box display='flex' alignItems='center'>
                <Icon name='info' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
              </Box>
            </Tooltip>
          </Box>
          {draft.plantingSiteId !== undefined && selectableSeasonsForSite.length === 0 ? (
            <Typography fontSize='16px' fontWeight={500} textAlign={'left'}>
              {strings.NO_ACTIVE_SEASONS_FOR_SITE}
            </Typography>
          ) : (
            <Dropdown
              id='planting-season'
              label=''
              options={plantingSeasonOptions}
              selectedValue={draft.plantingSeasonId ?? NO_PLANTING_SEASON_VALUE}
              onChange={(value) =>
                onChange({
                  plantingSeasonId:
                    value !== undefined && value !== '' && value !== NO_PLANTING_SEASON_VALUE
                      ? Number(value)
                      : undefined,
                  stratumId: undefined,
                  substratumId: undefined,
                })
              }
              fullWidth
              sx={{ textAlign: 'left' }}
            />
          )}
        </Box>
      )}

      {isPlanting && draft.plantingSiteId !== undefined && (
        <Box display='flex' gap={theme.spacing(2)} flexWrap='wrap'>
          <Box flex={1} minWidth='240px'>
            <Dropdown
              id='stratum'
              label={strings.STRATUM_REQUIRED}
              options={stratumOptions}
              selectedValue={draft.stratumId}
              onChange={(value) =>
                onChange({
                  stratumId: value !== undefined ? Number(value) : undefined,
                  substratumId: undefined,
                })
              }
              fullWidth
              sx={{ textAlign: 'left' }}
            />
          </Box>
          <Box flex={1} minWidth='240px'>
            <Dropdown
              id='substratum'
              label={strings.SUBSTRATUM_REQUIRED}
              options={substratumOptions}
              selectedValue={draft.substratumId}
              onChange={(value) => onChange({ substratumId: value !== undefined ? Number(value) : undefined })}
              fullWidth
              disabled={draft.stratumId === undefined}
              sx={{ textAlign: 'left' }}
            />
          </Box>
        </Box>
      )}

      {shouldShowSpeciesTargets && speciesTargets && speciesTargets.length > 0 && (
        <SpeciesTargetsTable rows={speciesTargets} />
      )}

      {isNurseryTransfer && (
        <Box maxWidth='320px'>
          <Dropdown
            id='to-nursery'
            label={strings.TO_NURSERY_REQUIRED}
            options={toNurseryOptions}
            selectedValue={draft.destinationFacilityId}
            onChange={(value) => onChange({ destinationFacilityId: value !== undefined ? Number(value) : undefined })}
            fullWidth
            sx={{ textAlign: 'left' }}
          />
        </Box>
      )}

      <Box maxWidth='320px'>
        <DatePicker
          id='withdraw-date'
          label={strings.WITHDRAW_DATE_REQUIRED}
          value={draft.withdrawnDate}
          onDateChange={(value?: DateTime) => onChange({ withdrawnDate: value?.toISODate() ?? '' })}
          aria-label='withdraw-date'
          sx={{ textAlign: 'left' }}
        />
      </Box>

      <Box>
        <TextField
          id='notes'
          type='textarea'
          label={strings.NOTES_OPTIONAL}
          value={draft.notes}
          onChange={(value) => onChange({ notes: String(value ?? '') })}
          sx={{ textAlign: 'left' }}
        />
      </Box>
    </Box>
  );
};

export default PurposeAndDestinationStep;
