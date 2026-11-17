import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, Dropdown, DropdownItem } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSeasonsQuery } from 'src/queries/generated/plantingSeasons';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import { useLazyListBatchesForWithdrawQuery } from 'src/queries/search/batchesForWithdraw';
import {
  PlantingDateRequestRow,
  PlantingDateRequestStatus,
  useLazyListPlantingDateRequestsQuery,
} from 'src/queries/search/plantingDateRequests';
import { getMediumDate } from 'src/utils/dateFormatter';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import PlantingDateRequestFulfillmentBadge from './PlantingDateRequestFulfillmentBadge';
import RequestedSpeciesBottomSheet from './RequestedSpeciesBottomSheet';
import RequestedSpeciesDrawer from './RequestedSpeciesDrawer';
import RequestedSpeciesModal from './RequestedSpeciesModal';
import WithdrawFromBatchesModal from './WithdrawFromBatchesModal';

const ALL_OPEN_FILTER = 'allOpen';

type StatusFilterValue = typeof ALL_OPEN_FILTER | PlantingDateRequestStatus;

const PlantingDateRequestsTabContent = (): JSX.Element => {
  const theme = useTheme();
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { species } = useOrganizationSpecies();
  const { isMobile, isTablet } = useDeviceInfo();
  const organizationId = selectedOrganization?.id;

  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(ALL_OPEN_FILTER);
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
        {
          organizationId,
          plantingSiteId,
          plantingSeasonId: effectivePlantingSeasonId,
          speciesId: effectiveSpeciesId,
          statuses: statusFilter === ALL_OPEN_FILTER ? undefined : [statusFilter],
        },
        true
      );
    }
  }, [
    listPlantingDateRequests,
    organizationId,
    plantingSiteId,
    effectivePlantingSeasonId,
    effectiveSpeciesId,
    statusFilter,
  ]);

  useEffect(() => {
    if (selectedPlantingSiteHasNoSeasons) {
      setPlantingSeasonId(undefined);
      setSpeciesId(undefined);
    } else if (selectedSpeciesIsUnavailable) {
      setSpeciesId(undefined);
    }
  }, [selectedPlantingSiteHasNoSeasons, selectedSpeciesIsUnavailable]);

  const statusOptions = useMemo<DropdownItem[]>(
    () => [
      { label: strings.ALL_OPEN, value: ALL_OPEN_FILTER },
      { label: strings.NEW, value: 'Pending' },
      { label: strings.PARTIALLY_FULFILLED, value: 'Partial' },
      { label: strings.FULFILLED, value: 'Fulfilled' },
    ],
    [strings]
  );

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
      ? statusFilter === ALL_OPEN_FILTER
        ? strings.NO_PENDING_REQUESTS
        : strings.NO_REQUESTS_FOR_SELECTED_FILTERS
      : undefined;
  const [withdrawRequest, setWithdrawRequest] = useState<PlantingDateRequestRow | undefined>(undefined);
  const [quantitiesRequest, setQuantitiesRequest] = useState<PlantingDateRequestRow | undefined>(undefined);
  const [isPreparingWithdraw, setIsPreparingWithdraw] = useState(false);
  const [prefetchBatchesForWithdraw] = useLazyListBatchesForWithdrawQuery();

  const handleWithdrawClick = useCallback(
    async (row: PlantingDateRequestRow) => {
      if (!organizationId) {
        return;
      }
      const requestSpeciesIds = row.species.map((s) => s.speciesId);
      setQuantitiesRequest(undefined);
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
            id='filter-status'
            label=''
            options={statusOptions}
            selectedValue={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilterValue)}
            fullWidth
          />
        </Box>
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
            onViewQuantitiesClick={() => setQuantitiesRequest(row)}
          />
        ))
      )}
      {isPreparingWithdraw && <BusySpinner withSkrim />}
      {quantitiesRequest &&
        (() => {
          const quantitiesProps = {
            open: true,
            onClose: () => setQuantitiesRequest(undefined),
            onWithdrawClick: () => void handleWithdrawClick(quantitiesRequest),
            request: quantitiesRequest,
          };
          if (isMobile) {
            return <RequestedSpeciesBottomSheet {...quantitiesProps} />;
          }
          return isTablet ? (
            <RequestedSpeciesDrawer {...quantitiesProps} />
          ) : (
            <RequestedSpeciesModal {...quantitiesProps} />
          );
        })()}
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
  onViewQuantitiesClick: () => void;
};

const PlantingDateRequestListItem = ({
  row,
  activeLocale,
  onWithdrawClick,
  onViewQuantitiesClick,
}: PlantingDateRequestListItemProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile, isTablet } = useDeviceInfo();
  const { strings } = useLocalization();

  // How many names fit before "and N more", by breakpoint.
  const namePreviewLimit = isMobile ? 3 : isTablet ? 4 : 6;
  const speciesText = useMemo(() => {
    const names = row.speciesNames.toSorted((a, b) => a.localeCompare(b, activeLocale || undefined));
    const shown = names.slice(0, namePreviewLimit).join(', ');
    const remaining = names.length - namePreviewLimit;
    return remaining > 0 ? strings.formatString(strings.X_AND_N_MORE, shown, `${remaining}`).toString() : shown;
  }, [activeLocale, namePreviewLimit, row.speciesNames, strings]);

  const statsRow = (
    <Box
      display='flex'
      gap={theme.spacing(isMobile ? 1 : 3)}
      alignItems='flex-start'
      width={isMobile ? '100%' : undefined}
      justifyContent={isMobile ? 'space-between' : undefined}
    >
      <NumberColumn label={strings.SPECIES} value={row.speciesCount} activeLocale={activeLocale} />
      <NumberColumn label={strings.REQUESTED_PLANTS} value={row.requestedPlants} activeLocale={activeLocale} />
      <NumberColumn
        label={strings.WITHDRAWN_PLANTS}
        value={row.withdrawnPlants}
        activeLocale={activeLocale}
        to={
          row.withdrawnPlants > 0
            ? `${APP_PATHS.NURSERY_WITHDRAWALS}?tab=withdrawals&plantingSeasonId=${row.plantingSeasonId}&plantingDate=${row.date}`
            : undefined
        }
      />
    </Box>
  );

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
          <Typography fontSize='16px' fontStyle='italic' color={theme.palette.TwClrTxtSecondary} component='span'>
            {speciesText}
          </Typography>
          <Box
            component={isMobile ? 'div' : 'span'}
            marginLeft={isMobile ? 0 : theme.spacing(1)}
            display={isMobile ? 'flex' : 'inline'}
          >
            <Link
              fontSize='14px'
              onClick={onViewQuantitiesClick}
              style={
                isMobile
                  ? { textDecoration: 'underline', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }
                  : { textDecoration: 'underline' }
              }
            >
              {strings.VIEW_QUANTITIES}
            </Link>
          </Box>
        </Box>
        {isTablet && <Box marginTop={theme.spacing(2)}>{statsRow}</Box>}
      </Box>

      <Box
        display='flex'
        flexDirection={isMobile ? 'column-reverse' : 'column'}
        alignItems={isMobile ? 'flex-start' : 'flex-end'}
        gap={theme.spacing(2)}
        width={isMobile ? '100%' : undefined}
      >
        <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
          <PlantingDateRequestFulfillmentBadge status={row.status} />
          <Button label={strings.WITHDRAW} onClick={onWithdrawClick} priority='secondary' type='productive' />
        </Box>
        {!isTablet && statsRow}
      </Box>
    </Box>
  );
};

const NumberColumn = ({
  label,
  value,
  activeLocale,
  to,
}: {
  label: string;
  value: number;
  activeLocale: string | null;
  to?: string;
}): JSX.Element => {
  const theme = useTheme();
  const formattedValue = value.toLocaleString(activeLocale || undefined);
  return (
    <Box textAlign='right' minWidth='110px'>
      <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
        {label}
      </Typography>
      {to ? (
        <Link fontSize='20px' fontWeight={600} to={to} style={{ textDecoration: 'underline' }}>
          {formattedValue}
        </Link>
      ) : (
        <Typography fontSize='20px' fontWeight={600}>
          {formattedValue}
        </Typography>
      )}
    </Box>
  );
};

export default PlantingDateRequestsTabContent;
