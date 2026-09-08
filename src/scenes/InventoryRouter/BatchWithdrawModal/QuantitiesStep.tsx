import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSeasonsQuery } from 'src/queries/generated/plantingSeasons';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import { SpeciesTargetForSubstratum } from 'src/queries/search/speciesTargetsForSubstratum';
import { NurseryWithdrawalRequestPurposes } from 'src/types/Batch';

import SeedlingBatchBox from './SeedlingBatchBox';
import SpeciesTargetsTable from './SpeciesTargetsTable';
import { BatchInfo, BatchWithdrawDraft, BatchWithdrawQuantities } from './types';

type QuantitiesStepProps = {
  batches: BatchInfo[];
  draft: BatchWithdrawDraft;
  speciesTargets?: SpeciesTargetForSubstratum[];
  setWithdrawByBatch: (
    updater: (prev: Record<number, BatchWithdrawQuantities>) => Record<number, BatchWithdrawQuantities>
  ) => void;
};

const QuantitiesStep = ({ batches, draft, speciesTargets, setWithdrawByBatch }: QuantitiesStepProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const isPlanting = draft.purpose === NurseryWithdrawalRequestPurposes.OUTPLANT;
  const isNurseryTransfer = draft.purpose === NurseryWithdrawalRequestPurposes.NURSERY_TRANSFER;
  const shouldShowSpeciesTargets =
    isPlanting &&
    draft.plantingSeasonId !== undefined &&
    draft.stratumId !== undefined &&
    draft.substratumId !== undefined;

  const [listPlantingSites, { data: plantingSitesData }] = useLazyListPlantingSitesQuery();
  const [listPlantingSeasons, { data: plantingSeasonsData }] = useLazyListPlantingSeasonsQuery();

  useEffect(() => {
    if (isPlanting && organizationId) {
      void listPlantingSites({ organizationId, full: true }, true);
      void listPlantingSeasons({ organizationId }, true);
    }
  }, [isPlanting, listPlantingSeasons, listPlantingSites, organizationId]);

  const plantingDestination = useMemo(() => {
    if (!isPlanting) {
      return undefined;
    }
    const site = (plantingSitesData?.sites ?? []).find((s) => s.id === draft.plantingSiteId);
    const stratum = site?.strata?.find((s) => s.id === draft.stratumId);
    const substratum = stratum?.substrata.find((sub) => sub.id === draft.substratumId);
    return {
      siteName: site?.name,
      stratumName: stratum?.name,
      substratumName: substratum?.name,
    };
  }, [draft.plantingSiteId, draft.stratumId, draft.substratumId, isPlanting, plantingSitesData]);

  const plantingSeasonName = useMemo(() => {
    if (!isPlanting || draft.plantingSeasonId === undefined) {
      return undefined;
    }
    return (plantingSeasonsData?.seasons ?? []).find((s) => s.id === draft.plantingSeasonId)?.name;
  }, [draft.plantingSeasonId, isPlanting, plantingSeasonsData]);

  // Group batches by species so we can render one box per species, sorted by
  // scientific name for stable order.
  const batchesBySpecies = useMemo(() => {
    const map = new Map<number, { speciesName: string; batches: BatchInfo[] }>();
    batches.forEach((b) => {
      const existing = map.get(b.speciesId);
      const speciesName = b.scientificName + (b.commonName ? ` (${b.commonName})` : '');
      if (existing) {
        existing.batches.push(b);
      } else {
        map.set(b.speciesId, { speciesName, batches: [b] });
      }
    });
    return [...map.values()].sort((a, b) => a.speciesName.localeCompare(b.speciesName));
  }, [batches]);

  const destinationNurseryName = useMemo(() => {
    if (!isNurseryTransfer) {
      return undefined;
    }
    return (selectedOrganization?.facilities ?? []).find((f) => f.id === draft.destinationFacilityId)?.name;
  }, [draft.destinationFacilityId, isNurseryTransfer, selectedOrganization]);

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(2)}>
      {plantingDestination?.siteName && (
        <Box
          display='flex'
          flexWrap='wrap'
          columnGap={theme.spacing(4)}
          rowGap={theme.spacing(2)}
          textAlign='left'
          paddingLeft={theme.spacing(2)}
        >
          <Box>
            <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
              {strings.PLANTING_SITE}
            </Typography>
            <Typography fontSize='14px'>{plantingDestination.siteName}</Typography>
          </Box>
          {plantingDestination.stratumName && (
            <Box>
              <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
                {strings.STRATUM}
              </Typography>
              <Typography fontSize='14px'>{plantingDestination.stratumName}</Typography>
            </Box>
          )}
          {plantingDestination.substratumName && (
            <Box>
              <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
                {strings.SUBSTRATUM}
              </Typography>
              <Typography fontSize='14px'>{plantingDestination.substratumName}</Typography>
            </Box>
          )}
        </Box>
      )}

      {plantingSeasonName && (
        <Box textAlign='left' paddingLeft={theme.spacing(2)}>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {strings.PLANTING_SEASON}
          </Typography>
          <Typography fontSize='14px'>{plantingSeasonName}</Typography>
        </Box>
      )}

      {destinationNurseryName && (
        <Box display='grid' gridTemplateColumns='110px 1fr' gap={theme.spacing(2)} alignItems='center' textAlign='left'>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {strings.NURSERY}
          </Typography>
          <Typography fontSize='14px'>{destinationNurseryName}</Typography>
        </Box>
      )}

      {shouldShowSpeciesTargets && speciesTargets && speciesTargets.length > 0 && (
        <SpeciesTargetsTable rows={speciesTargets} />
      )}
      {batchesBySpecies.map((group) => (
        <SeedlingBatchBox
          key={group.speciesName}
          speciesName={group.speciesName}
          batches={group.batches}
          isPlanting={isPlanting}
          withdrawByBatch={draft.withdrawByBatch}
          setWithdrawByBatch={setWithdrawByBatch}
        />
      ))}
    </Box>
  );
};

export default QuantitiesStep;
