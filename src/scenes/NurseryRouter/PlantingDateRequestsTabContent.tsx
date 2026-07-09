import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { Badge, BusySpinner, Button, Dropdown, DropdownItem } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useLazyListPlantingSeasonsQuery } from 'src/queries/generated/plantingSeasons';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import { useLazyListBatchesForWithdrawQuery } from 'src/queries/search/batchesForWithdraw';
import { PlantingDateRequestRow, useLazyListPlantingDateRequestsQuery } from 'src/queries/search/plantingDateRequests';
import { getMediumDate } from 'src/utils/dateFormatter';

import WithdrawFromBatchesModal from './WithdrawFromBatchesModal';

const PlantingDateRequestsTabContent = (): JSX.Element => {
  const theme = useTheme();
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { species } = useSpeciesData();
  const organizationId = selectedOrganization?.id;

  const [plantingSiteId, setPlantingSiteId] = useState<number | undefined>(undefined);
  const [plantingSeasonId, setPlantingSeasonId] = useState<number | undefined>(undefined);
  const [speciesId, setSpeciesId] = useState<number | undefined>(undefined);

  const [listPlantingSites, { data: plantingSitesData }] = useLazyListPlantingSitesQuery();
  const [listPlantingSeasons, { data: plantingSeasonsData }] = useLazyListPlantingSeasonsQuery();
  const [listPlantingDateRequests, { data: requests }] = useLazyListPlantingDateRequestsQuery();

  useEffect(() => {
    if (organizationId) {
      void listPlantingSites({ organizationId }, true);
      void listPlantingSeasons({ organizationId }, true);
    }
  }, [listPlantingSites, listPlantingSeasons, organizationId]);

  const plantingSeasonsForSelectedSite = useMemo(() => {
    const allSeasons = plantingSeasonsData?.seasons ?? [];
    return allSeasons.filter(
      (s) => s.status !== 'Closed' && (plantingSiteId === undefined || Number(s.plantingSiteId) === plantingSiteId)
    );
  }, [plantingSeasonsData, plantingSiteId]);

  const selectedPlantingSiteHasNoSeasons = useMemo(
    () =>
      plantingSiteId !== undefined &&
      plantingSeasonsData?.seasons !== undefined &&
      plantingSeasonsForSelectedSite.length === 0,
    [plantingSiteId, plantingSeasonsData?.seasons, plantingSeasonsForSelectedSite]
  );

  const effectivePlantingSeasonId = selectedPlantingSiteHasNoSeasons ? undefined : plantingSeasonId;

  const speciesIdsForSelectedPlantingSeasons = useMemo(() => {
    const selectedSeasons =
      effectivePlantingSeasonId === undefined
        ? plantingSeasonsForSelectedSite
        : plantingSeasonsForSelectedSite.filter((s) => s.id === effectivePlantingSeasonId);

    return new Set(selectedSeasons.flatMap((s) => s.speciesTargets.map((target) => target.speciesId)));
  }, [effectivePlantingSeasonId, plantingSeasonsForSelectedSite]);

  const selectedSpeciesIsUnavailable =
    speciesId !== undefined &&
    plantingSeasonsData?.seasons !== undefined &&
    !speciesIdsForSelectedPlantingSeasons.has(speciesId);
  const effectiveSpeciesId = selectedPlantingSiteHasNoSeasons || selectedSpeciesIsUnavailable ? undefined : speciesId;

  useEffect(() => {
    if (organizationId) {
      void listPlantingDateRequests(
        { organizationId, plantingSiteId, plantingSeasonId: effectivePlantingSeasonId, speciesId: effectiveSpeciesId },
        true
      );
    }
  }, [listPlantingDateRequests, organizationId, plantingSiteId, effectivePlantingSeasonId, effectiveSpeciesId]);

  useEffect(() => {
    if (selectedPlantingSiteHasNoSeasons) {
      setPlantingSeasonId(undefined);
      setSpeciesId(undefined);
    } else if (selectedSpeciesIsUnavailable) {
      setSpeciesId(undefined);
    }
  }, [selectedPlantingSiteHasNoSeasons, selectedSpeciesIsUnavailable]);

  const plantingSiteOptions = useMemo<DropdownItem[]>(
    () => [
      { label: strings.ALL_PLANTING_SITES, value: 'all' },
      ...(plantingSitesData?.sites ?? [])
        .toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
        .map((s) => ({ label: s.name, value: s.id })),
    ],
    [activeLocale, plantingSitesData, strings]
  );

  const plantingSeasonOptions = useMemo<DropdownItem[]>(() => {
    return [
      { label: strings.ALL_PLANTING_SEASONS, value: 'all' },
      ...plantingSeasonsForSelectedSite
        .toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
        .map((s) => ({ label: s.name, value: s.id })),
    ];
  }, [activeLocale, plantingSeasonsForSelectedSite, strings]);

  const speciesOptions = useMemo<DropdownItem[]>(
    () => [
      { label: strings.ALL_SPECIES, value: 'all' },
      ...(selectedPlantingSiteHasNoSeasons
        ? []
        : species
            .filter((s) => speciesIdsForSelectedPlantingSeasons.has(s.id))
            .toSorted((a, b) => a.scientificName.localeCompare(b.scientificName, activeLocale || undefined))
            .map((s) => ({ label: s.scientificName, value: s.id }))),
    ],
    [activeLocale, selectedPlantingSiteHasNoSeasons, species, speciesIdsForSelectedPlantingSeasons, strings]
  );

  const rows = requests ?? [];
  const hasNoRequests = requests !== undefined && rows.length === 0;
  const emptyStateMessage = selectedPlantingSiteHasNoSeasons
    ? strings.NO_PENDING_REQUESTS_FOR_SELECTED_PLANTING_SITE
    : hasNoRequests
      ? strings.NO_PENDING_REQUESTS
      : undefined;
  const [withdrawRequest, setWithdrawRequest] = useState<PlantingDateRequestRow | undefined>(undefined);
  const [isPreparingWithdraw, setIsPreparingWithdraw] = useState(false);
  const [prefetchBatchesForWithdraw] = useLazyListBatchesForWithdrawQuery();

  const handleWithdrawClick = useCallback(
    async (row: PlantingDateRequestRow) => {
      if (!organizationId) {
        return;
      }
      const requestSpeciesIds = row.species.map((s) => s.speciesId);
      setIsPreparingWithdraw(true);
      try {
        await prefetchBatchesForWithdraw({ organizationId, speciesIds: requestSpeciesIds }, true).unwrap();
      } catch {
        // Open the modal anyway if it fails; it will re-attempt the query itself.
      }
      setWithdrawRequest(row);
      setIsPreparingWithdraw(false);
    },
    [organizationId, prefetchBatchesForWithdraw]
  );

  return (
    <Card flushMobile radius='8px'>
      <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginBottom={theme.spacing(2)}>
        {strings.REVIEW_PENDING_REQUESTS_DESCRIPTION}
      </Typography>

      <Box display='flex' gap={theme.spacing(2)} flexWrap='wrap' marginBottom={theme.spacing(2)}>
        <Box minWidth='220px'>
          <Dropdown
            id='filter-planting-site'
            label=''
            options={plantingSiteOptions}
            selectedValue={plantingSiteId ?? 'all'}
            onChange={(value) => {
              setPlantingSiteId(value === 'all' ? undefined : Number(value));
              setPlantingSeasonId(undefined);
              setSpeciesId(undefined);
            }}
            fullWidth
          />
        </Box>
        <Box minWidth='220px'>
          <Dropdown
            id='filter-planting-season'
            label=''
            options={plantingSeasonOptions}
            selectedValue={effectivePlantingSeasonId ?? 'all'}
            onChange={(value) => setPlantingSeasonId(value === 'all' ? undefined : Number(value))}
            fullWidth
          />
        </Box>
        <Box minWidth='220px'>
          <Dropdown
            id='filter-species'
            label=''
            options={speciesOptions}
            selectedValue={effectiveSpeciesId ?? 'all'}
            onChange={(value) => setSpeciesId(value === 'all' ? undefined : Number(value))}
            fullWidth
          />
        </Box>
      </Box>

      <Divider />
      {emptyStateMessage ? (
        <Box padding={theme.spacing(4, 2)} textAlign='center'>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {emptyStateMessage}
          </Typography>
        </Box>
      ) : (
        rows.map((row) => (
          <PlantingDateRequestListItem
            key={`${row.plantingSeasonId}-${row.date}`}
            row={row}
            activeLocale={activeLocale}
            onWithdrawClick={() => void handleWithdrawClick(row)}
          />
        ))
      )}
      {isPreparingWithdraw && <BusySpinner withSkrim />}
      {withdrawRequest && (
        <WithdrawFromBatchesModal
          open={true}
          onClose={() => setWithdrawRequest(undefined)}
          request={withdrawRequest}
          plantingSiteId={withdrawRequest.plantingSiteId}
          plantingSeasonId={withdrawRequest.plantingSeasonId}
        />
      )}
    </Card>
  );
};

type PlantingDateRequestListItemProps = {
  row: PlantingDateRequestRow;
  activeLocale: string | null;
  onWithdrawClick: () => void;
};

const PlantingDateRequestListItem = ({
  row,
  activeLocale,
  onWithdrawClick,
}: PlantingDateRequestListItemProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [showAllSpecies, setShowAllSpecies] = useState(false);
  const { strings } = useLocalization();

  const speciesPreviewLimit = 4;
  const displayedSpecies = showAllSpecies ? row.speciesNames : row.speciesNames.slice(0, speciesPreviewLimit);
  const hasMore = row.speciesNames.length > speciesPreviewLimit;

  return (
    <Box
      display='flex'
      flexDirection={isMobile ? 'column' : 'row'}
      gap={theme.spacing(3)}
      padding={theme.spacing(2)}
      sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
    >
      <Box flex={1}>
        <Box display='flex' alignItems='center' gap={theme.spacing(1)} flexWrap='wrap'>
          <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {getMediumDate(row.date, activeLocale)}
          </Typography>
          <Link
            fontSize='16px'
            to={APP_PATHS.PLANTING_SEASONS_VIEW.replace(':plantingSeasonId', String(row.plantingSeasonId))}
          >
            {row.plantingSeasonName}
          </Link>
          <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary}>
            {row.plantingSiteName}
          </Typography>
        </Box>
        {row.notes && (
          <Box marginTop={theme.spacing(1)} display='flex' gap={theme.spacing(1)}>
            <Typography fontSize='14px' fontWeight={600}>
              {strings.NOTE_COLON}
            </Typography>
            <Typography fontSize='14px' fontWeight={400}>
              {row.notes}
            </Typography>
          </Box>
        )}
        <Box marginTop={theme.spacing(1)}>
          <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary} component='span'>
            {displayedSpecies.join(', ')}
          </Typography>
          {hasMore && !showAllSpecies && (
            <Typography
              fontSize='14px'
              color={theme.palette.TwClrTxtBrand}
              component='span'
              sx={{ marginLeft: theme.spacing(1), cursor: 'pointer' }}
              onClick={() => setShowAllSpecies(true)}
            >
              {strings.SEE_MORE}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        display='flex'
        flexDirection='column'
        alignItems={isMobile ? 'flex-start' : 'flex-end'}
        gap={theme.spacing(2)}
      >
        <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
          <RequestStatusBadge status={row.status} />
          <Button label={strings.WITHDRAW} onClick={onWithdrawClick} priority='secondary' type='productive' />
        </Box>
        <Box display='flex' gap={theme.spacing(3)} alignItems='flex-start'>
          <NumberColumn label={strings.SPECIES} value={row.speciesCount} activeLocale={activeLocale} />
          <NumberColumn label={strings.REQUESTED_PLANTS} value={row.requestedPlants} activeLocale={activeLocale} />
          <NumberColumn label={strings.WITHDRAWN_PLANTS} value={row.withdrawnPlants} activeLocale={activeLocale} />
        </Box>
      </Box>
    </Box>
  );
};

const NumberColumn = ({
  label,
  value,
  activeLocale,
}: {
  label: string;
  value: number;
  activeLocale: string | null;
}): JSX.Element => {
  const theme = useTheme();
  return (
    <Box textAlign='right' minWidth='110px'>
      <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
        {label}
      </Typography>
      <Typography fontSize='20px' fontWeight={600}>
        {value.toLocaleString(activeLocale || undefined)}
      </Typography>
    </Box>
  );
};

const RequestStatusBadge = ({ status }: { status: string }): JSX.Element | null => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const badgeProps = useMemo((): BadgeProps | undefined => {
    switch (status) {
      case 'Pending':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.REQUEST_PENDING,
        };
      case 'Partial':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.PARTIAL,
        };
      case 'Fulfilled':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.COMPLETED,
        };
      default:
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: status,
        };
    }
  }, [status, theme, strings]);

  if (!badgeProps) {
    return null;
  }
  return <Badge {...badgeProps} />;
};

export default PlantingDateRequestsTabContent;
