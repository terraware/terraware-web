import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, Icon, Message } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import TextField from 'src/components/common/Textfield/Textfield';
import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import {
  useLazyListPlantingSeasonsQuery,
  useUpsertAllocatedSpeciesMutation,
} from 'src/queries/generated/plantingSeasons';
import { useListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import {
  InventoryPlanningSeasonRow,
  InventoryPlanningSpeciesRow,
  aggregateInventoryPlanningRows,
  useListInventoryPlanningSeasonsQuery,
  useListInventoryPlanningSpeciesAvailableQuery,
} from 'src/queries/search/inventoryPlanning';
import strings from 'src/strings';
import { getMediumDate } from 'src/utils/dateFormatter';
import useSnackbar from 'src/utils/useSnackbar';

const InventoryPlanningView = (): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { species } = useSpeciesData();
  const organizationId = selectedOrganization?.id;

  const [plantingSiteId, setPlantingSiteId] = useState<number | undefined>(undefined);
  const [plantingSeasonId, setPlantingSeasonId] = useState<number | undefined>(undefined);
  const [speciesId, setSpeciesId] = useState<number | undefined>(undefined);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const { data: plantingSitesData } = useListPlantingSitesQuery(
    { organizationId: organizationId ?? 0 },
    { skip: !organizationId }
  );
  const [listPlantingSeasons, { data: plantingSeasonsData }] = useLazyListPlantingSeasonsQuery();

  useEffect(() => {
    if (organizationId) {
      void listPlantingSeasons({ organizationId }, true);
    }
  }, [listPlantingSeasons, organizationId]);

  const { data: seasonsSearchData } = useListInventoryPlanningSeasonsQuery(
    { organizationId: organizationId ?? 0, plantingSiteId, plantingSeasonId, speciesId },
    { skip: !organizationId }
  );
  const { data: availableBySpecies } = useListInventoryPlanningSpeciesAvailableQuery(organizationId ?? 0, {
    skip: !organizationId,
  });

  const rows = useMemo<InventoryPlanningSpeciesRow[]>(() => {
    if (!seasonsSearchData) {
      return [];
    }
    const aggregated = aggregateInventoryPlanningRows(seasonsSearchData, availableBySpecies ?? new Map());
    return speciesId === undefined ? aggregated : aggregated.filter((row) => row.speciesId === speciesId);
  }, [seasonsSearchData, availableBySpecies, speciesId]);

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

  const bannerSeason = useMemo(() => {
    if (bannerDismissed || !plantingSeasonsData?.seasons?.length) {
      return undefined;
    }
    return plantingSeasonsData.seasons.find((s) => s.status === 'Active') ?? plantingSeasonsData.seasons[0];
  }, [plantingSeasonsData, bannerDismissed]);

  return (
    <Page title={strings.INVENTORY_PLANNING} description={strings.INVENTORY_PLANNING_DESCRIPTION}>
      <Box sx={{ width: '100%' }}>
        {bannerSeason && (
          <Box marginTop={theme.spacing(2)}>
            <Message
              type='page'
              priority='info'
              body={
                <span>
                  {strings.formatString(
                    strings.NEW_SPECIES_TARGETS_ADDED,
                    <span key='season-name' style={{ fontWeight: 600 }}>
                      {bannerSeason.name}
                    </span>
                  )}
                </span>
              }
              showCloseButton
              onClose={() => setBannerDismissed(true)}
            />
          </Box>
        )}

        <Card style={{ marginTop: theme.spacing(3) }} radius={theme.spacing(1)}>
          <Box display='flex' gap={theme.spacing(2)} flexWrap='wrap' marginBottom={theme.spacing(2)}>
            <Box minWidth='240px'>
              <Dropdown
                id='filter-planting-site'
                label=''
                options={plantingSiteOptions}
                selectedValue={plantingSiteId ?? 'all'}
                onChange={(value) => setPlantingSiteId(value === 'all' ? undefined : Number(value))}
                fullWidth
              />
            </Box>
            <Box minWidth='240px'>
              <Dropdown
                id='filter-planting-season'
                label=''
                options={plantingSeasonOptions}
                selectedValue={plantingSeasonId ?? 'all'}
                onChange={(value) => setPlantingSeasonId(value === 'all' ? undefined : Number(value))}
                fullWidth
              />
            </Box>
            <Box minWidth='240px'>
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

          <SpeciesTable rows={rows} activeLocale={activeLocale} />
        </Card>
      </Box>
    </Page>
  );
};

type SpeciesTableProps = {
  rows: InventoryPlanningSpeciesRow[];
  activeLocale: string | null;
};

const SpeciesTable = ({ rows, activeLocale }: SpeciesTableProps): JSX.Element => {
  const theme = useTheme();
  const [expandedSpeciesIds, setExpandedSpeciesIds] = useState<Set<number>>(new Set());

  const toggle = (speciesId: number) => {
    setExpandedSpeciesIds((prev) => {
      const next = new Set(prev);
      if (next.has(speciesId)) {
        next.delete(speciesId);
      } else {
        next.add(speciesId);
      }
      return next;
    });
  };

  return (
    <Box>
      <Box
        display='grid'
        gridTemplateColumns='40px 2fr 1fr 1fr 1fr 1.5fr'
        gap={theme.spacing(1)}
        sx={{
          padding: theme.spacing(1, 2),
          borderBottom: `2px solid ${theme.palette.TwClrBrdrSecondary}`,
        }}
      >
        <Box />
        <HeaderCell label={strings.SPECIES} />
        <HeaderCell label={strings.AVAILABLE_TITLE} tooltip={strings.INVENTORY_PLANNING_AVAILABLE_TOOLTIP} alignEnd />
        <HeaderCell label={strings.TARGET} tooltip={strings.INVENTORY_PLANNING_TARGET_TOOLTIP} alignEnd />
        <HeaderCell label={strings.ALLOCATED} tooltip={strings.INVENTORY_PLANNING_ALLOCATED_TOOLTIP} alignEnd />
        <HeaderCell label={strings.ALLOCATED_FOR_TARGET} tooltip={strings.ALLOCATED_FOR_TARGET_TOOLTIP} />
      </Box>
      {rows.length === 0 && (
        <Box padding={theme.spacing(4, 2)} textAlign='center'>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {strings.NO_ACTIVE_PLANTING_SEASONS_FOR_FILTERS}
          </Typography>
        </Box>
      )}
      {rows.map((row, index) => (
        <SpeciesRow
          key={row.speciesId}
          row={row}
          index={index}
          expanded={expandedSpeciesIds.has(row.speciesId)}
          onToggle={() => toggle(row.speciesId)}
          activeLocale={activeLocale}
        />
      ))}
    </Box>
  );
};

const HeaderCell = ({
  label,
  tooltip,
  alignEnd,
}: {
  label: string;
  tooltip?: string;
  alignEnd?: boolean;
}): JSX.Element => {
  const theme = useTheme();
  return (
    <Box
      display='flex'
      alignItems='center'
      gap={theme.spacing(0.5)}
      justifyContent={alignEnd ? 'flex-end' : 'flex-start'}
    >
      <Typography fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxt}>
        {label}
      </Typography>
      {tooltip && (
        <Tooltip title={tooltip}>
          <Box display='flex' alignItems='center'>
            <Icon name='info' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

type SpeciesRowProps = {
  row: InventoryPlanningSpeciesRow;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  activeLocale: string | null;
};

const getAllocationColor = (target: number, allocated: number, theme: Theme): string | undefined => {
  const palette = theme.palette;
  if (target <= 0 || allocated <= 0) {
    return palette.TwClrTxt;
  }
  const percent = (allocated / target) * 100;
  if (percent >= 76) {
    return palette.TwClrTxtSuccess;
  }
  if (percent >= 25) {
    return palette.TwClrTxtWarning;
  }
  return palette.TwClrTxtDanger;
};

const SpeciesRow = ({ row, index, expanded, onToggle, activeLocale }: SpeciesRowProps): JSX.Element => {
  const theme = useTheme();

  const availableColor =
    row.target > 0 && row.available < row.target ? theme.palette.TwClrTxtDanger : theme.palette.TwClrTxtSuccess;
  const percent = row.target > 0 ? Math.round((row.allocated / row.target) * 100) : 0;
  const barColor =
    row.target <= 0 || row.allocated <= 0
      ? theme.palette.TwClrBgTertiary
      : percent >= 76
        ? theme.palette.TwClrIcnSuccess
        : percent >= 25
          ? theme.palette.TwClrIcnWarning
          : theme.palette.TwClrIcnDanger;

  return (
    <>
      <Box
        display='grid'
        gridTemplateColumns='40px 2fr 1fr 1fr 1fr 1.5fr'
        gap={theme.spacing(1)}
        alignItems='center'
        onClick={onToggle}
        sx={{
          padding: theme.spacing(1.5, 2),
          backgroundColor: index % 2 === 0 ? theme.palette.TwClrBgSecondary : 'transparent',
          cursor: 'pointer',
          '&:hover': { backgroundColor: theme.palette.TwClrBgHover },
        }}
      >
        <Box display='flex' alignItems='center'>
          <Icon name={expanded ? 'caretDown' : 'caretRight'} size='small' fillColor={theme.palette.TwClrIcn} />
        </Box>
        <Box>
          <Typography fontSize='16px' fontWeight={400}>
            {row.scientificName}
          </Typography>
          {row.commonName && (
            <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
              {row.commonName}
            </Typography>
          )}
        </Box>
        <Typography fontSize='16px' textAlign='right' color={availableColor} fontWeight={600}>
          {row.available.toLocaleString(activeLocale || undefined)}
        </Typography>
        <Typography fontSize='16px' textAlign='right'>
          {row.target.toLocaleString(activeLocale || undefined)}
        </Typography>
        <Typography fontSize='16px' textAlign='right'>
          {row.allocated > 0 ? row.allocated.toLocaleString(activeLocale || undefined) : '-'}
        </Typography>
        <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
          <Box
            flex={1}
            sx={{
              height: '8px',
              borderRadius: '4px',
              backgroundColor: theme.palette.TwClrBgTertiary,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${Math.min(100, percent)}%`,
                height: '100%',
                backgroundColor: barColor,
              }}
            />
          </Box>
          <Typography fontSize='14px' minWidth='40px' textAlign='right'>
            {`${percent}%`}
          </Typography>
        </Box>
      </Box>
      {expanded &&
        row.seasons.map((season) => (
          <SeasonDetailRow
            key={season.plantingSeasonId}
            speciesId={row.speciesId}
            season={season}
            available={row.available}
            backgroundColor={index % 2 === 0 ? theme.palette.TwClrBgSecondary ?? 'transparent' : 'transparent'}
            activeLocale={activeLocale}
          />
        ))}
    </>
  );
};

type SeasonDetailRowProps = {
  speciesId: number;
  season: InventoryPlanningSeasonRow;
  available: number;
  backgroundColor: string;
  activeLocale: string | null;
};

const SeasonDetailRow = ({
  speciesId,
  season,
  available,
  backgroundColor,
  activeLocale,
}: SeasonDetailRowProps): JSX.Element => {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [editing, setEditing] = useState(false);
  const [draftValue, setDraftValue] = useState<string>(season.allocated.toString());
  const [upsertAllocatedSpecies, { isLoading: isSaving }] = useUpsertAllocatedSpeciesMutation();

  const allocatedColor = getAllocationColor(season.target, season.allocated, theme);
  const parsedDraft = Number(draftValue);
  const draftIsValid = !Number.isNaN(parsedDraft) && parsedDraft >= 0;
  const exceedsAvailable = draftIsValid && parsedDraft > available;

  const onSave = async () => {
    if (!draftIsValid) {
      setDraftValue(season.allocated.toString());
      setEditing(false);
      return;
    }
    if (parsedDraft !== season.allocated) {
      try {
        await upsertAllocatedSpecies({
          plantingSeasonId: season.plantingSeasonId,
          upsertPlantingSeasonAllocatedSpeciesRequestPayload: { speciesId, quantity: parsedDraft },
        }).unwrap();
      } catch (e) {
        snackbar.toastError();
        setDraftValue(season.allocated.toString());
        setEditing(false);
        return;
      }
    }
    if (!exceedsAvailable) {
      setEditing(false);
    }
  };

  return (
    <Box
      display='grid'
      gridTemplateColumns='40px 2fr 1fr 1fr 1fr 1.5fr'
      gap={theme.spacing(1)}
      alignItems='center'
      sx={{ padding: theme.spacing(1.5, 2), backgroundColor }}
      onClick={(e) => e.stopPropagation()}
    >
      <Box />
      <Box>
        <Typography fontSize='16px' fontWeight={400}>
          {season.plantingSeasonName}
        </Typography>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {`${season.plantingSiteName}  -  ${getMediumDate(season.startDate, activeLocale)} - ${getMediumDate(
            season.endDate,
            activeLocale
          )}`}
        </Typography>
      </Box>
      <Box />
      <Typography fontSize='16px' textAlign='right'>
        {season.target.toLocaleString(activeLocale || undefined)}
      </Typography>
      <Box display='flex' justifyContent='flex-end' alignItems='center' gap={theme.spacing(1)}>
        {editing ? (
          <Box minWidth='120px'>
            <TextField
              id={`alloc-${season.plantingSeasonId}-${speciesId}`}
              type='number'
              label=''
              value={draftValue}
              onChange={(value) => setDraftValue(String(value ?? ''))}
              onKeyDown={(key) => {
                if (key === 'Enter') {
                  void onSave();
                }
              }}
              onBlur={() => void onSave()}
              min={0}
              autoFocus
              disabled={isSaving}
              errorText={
                exceedsAvailable ? strings.formatString(strings.EXCEEDS_AVAILABLE_X, available).toString() : ''
              }
            />
          </Box>
        ) : (
          <>
            <Typography fontSize='16px' color={allocatedColor} fontWeight={600}>
              {season.allocated.toLocaleString(activeLocale || undefined)}
            </Typography>
            {season.status !== 'Closed' && (
              <Button
                icon='iconEdit'
                onClick={() => {
                  setDraftValue(season.allocated.toString());
                  setEditing(true);
                }}
                priority='ghost'
                size='small'
                type='passive'
              />
            )}
          </>
        )}
      </Box>
      <Box />
    </Box>
  );
};

export default InventoryPlanningView;
