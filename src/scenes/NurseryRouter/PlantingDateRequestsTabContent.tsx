import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { Badge, Button, Dropdown, DropdownItem } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useLazyListPlantingSeasonsQuery } from 'src/queries/generated/plantingSeasons';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import { PlantingDateRequestRow, useLazyListPlantingDateRequestsQuery } from 'src/queries/search/plantingDateRequests';
import { getMediumDate } from 'src/utils/dateFormatter';

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

  useEffect(() => {
    if (organizationId) {
      void listPlantingDateRequests({ organizationId, plantingSiteId, plantingSeasonId, speciesId }, true);
    }
  }, [listPlantingDateRequests, organizationId, plantingSiteId, plantingSeasonId, speciesId]);

  const plantingSiteOptions = useMemo<DropdownItem[]>(
    () => [
      { label: strings.ALL_PLANTING_SITES, value: 'all' },
      ...(plantingSitesData?.sites ?? []).map((s) => ({ label: s.name, value: s.id })),
    ],
    [plantingSitesData]
  );

  const plantingSeasonOptions = useMemo<DropdownItem[]>(() => {
    const allSeasons = plantingSeasonsData?.seasons ?? [];
    const filteredSeasons = plantingSiteId ? allSeasons.filter((s) => s.plantingSiteId === plantingSiteId) : allSeasons;
    return [
      { label: strings.ALL_PLANTING_SEASONS, value: 'all' },
      ...filteredSeasons.map((s) => ({ label: s.name, value: s.id })),
    ];
  }, [plantingSeasonsData, plantingSiteId]);

  const speciesOptions = useMemo<DropdownItem[]>(
    () => [
      { label: strings.ALL_SPECIES, value: 'all' },
      ...species.map((s) => ({ label: s.scientificName, value: s.id })),
    ],
    [species]
  );

  const rows = requests ?? [];

  return (
    <Card flushMobile>
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
            onChange={(value) => setPlantingSiteId(value === 'all' ? undefined : Number(value))}
            fullWidth
          />
        </Box>
        <Box minWidth='220px'>
          <Dropdown
            id='filter-planting-season'
            label=''
            options={plantingSeasonOptions}
            selectedValue={plantingSeasonId ?? 'all'}
            onChange={(value) => setPlantingSeasonId(value === 'all' ? undefined : Number(value))}
            fullWidth
          />
        </Box>
        <Box minWidth='220px'>
          <Dropdown
            id='filter-species'
            label=''
            options={speciesOptions}
            selectedValue={speciesId ?? 'all'}
            onChange={(value) => setSpeciesId(value === 'all' ? undefined : Number(value))}
            fullWidth
          />
        </Box>
      </Box>

      <Divider />
      {rows.map((row) => (
        <PlantingDateRequestListItem key={row.scheduledPlantingDateId} row={row} activeLocale={activeLocale} />
      ))}
    </Card>
  );
};

type PlantingDateRequestListItemProps = {
  row: PlantingDateRequestRow;
  activeLocale: string | null;
};

const PlantingDateRequestListItem = ({ row, activeLocale }: PlantingDateRequestListItemProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const [showAllSpecies, setShowAllSpecies] = useState(false);

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
          <Typography fontSize='16px' fontWeight={500}>
            {getMediumDate(row.date, activeLocale)}
          </Typography>
          <Link
            fontSize='16px'
            to={APP_PATHS.PLANTING_SEASONS_VIEW.replace(':plantingSeasonId', String(row.plantingSeasonId))}
          >
            {`${row.plantingSeasonName},`}
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
          <Button label={strings.WITHDRAW} onClick={() => undefined} priority='secondary' type='productive' />
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
