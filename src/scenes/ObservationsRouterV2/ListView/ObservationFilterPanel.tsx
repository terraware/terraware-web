import React, { type JSX, useCallback, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, MultiSelect, Textfield } from '@terraware/web-components';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';
import { ObservationState, getStatus } from 'src/types/Observations';

import { ObservationTypeFilter, useObservationFilters } from '../ObservationFiltersProvider';

const datePickerStyles = {
  flex: '1 1 140px',
  maxWidth: '180px',
  minWidth: '120px',
};

const plotNumberStyles = {
  maxWidth: '110px',
  minWidth: '90px',
};

const multiSelectStyles = {
  maxWidth: '260px',
  minWidth: '260px',
};

const OBSERVATION_STATES: ObservationState[] = ['Upcoming', 'InProgress', 'Overdue', 'Completed', 'Abandoned'];

export type ObservationFilterPanelProps = {
  plantingSiteId: PlantingSiteId;
};

const ObservationFilterPanel = ({ plantingSiteId }: ObservationFilterPanelProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const {
    activeFilterCount,
    clearFilters,
    dateFilter,
    observationType,
    plotNumberFilter,
    plotType,
    setDateFilter,
    setObservationType,
    setPlotNumberFilter,
    setStatusFilter,
    setStratumFilter,
    statusFilter,
    stratumFilter,
  } = useObservationFilters();
  const { isSuccess: plantingSitesLoaded, plantingSites } = useOrganizationPlantingSites({ full: true });

  const strata = useMemo(() => {
    const sites =
      plantingSiteId === ALL_PLANTING_SITES
        ? plantingSites
        : plantingSites.filter((site) => site.id === plantingSiteId);
    return sites.flatMap((site) => site.strata ?? []);
  }, [plantingSiteId, plantingSites]);

  const stratumOptions = useMemo(() => new Map(strata.map((stratum) => [stratum.id, stratum.name])), [strata]);

  const statusOptions = useMemo(
    () => new Map(OBSERVATION_STATES.map((state) => [state, getStatus(state, strings)])),
    [strings]
  );

  const observationTypeOptions = useMemo(
    () => [
      { label: strings.ALL_MONITORING_TYPES, value: 'All' },
      { label: strings.PLANT_MONITORING, value: 'Monitoring' },
      { label: strings.BIOMASS_MONITORING, value: 'Biomass Measurements' },
    ],
    [strings.ALL_MONITORING_TYPES, strings.BIOMASS_MONITORING, strings.PLANT_MONITORING]
  );

  const onObservationTypeChange = useCallback(
    (value: string) => setObservationType((value || 'All') as ObservationTypeFilter),
    [setObservationType]
  );

  const onPlotNumberChange = useCallback(
    (bound: 'min' | 'max') => (value: unknown) => {
      const parsed = Number(value);
      setPlotNumberFilter((current) => ({
        ...current,
        [bound]: value === '' || isNaN(parsed) ? undefined : parsed,
      }));
    },
    [setPlotNumberFilter]
  );

  // Options are scoped to the selected site, so a site change can leave selections that match nothing.
  useEffect(() => {
    if (!plantingSitesLoaded) {
      return;
    }
    const availableStrata = stratumFilter.filter((id) => stratumOptions.has(id));
    if (availableStrata.length !== stratumFilter.length) {
      setStratumFilter(availableStrata);
    }
  }, [plantingSitesLoaded, setStratumFilter, stratumFilter, stratumOptions]);

  const onFromChange = useCallback(
    (value?: DateTime) => setDateFilter((current) => ({ ...current, from: value?.toFormat('yyyy-MM-dd') })),
    [setDateFilter]
  );

  const onToChange = useCallback(
    (value?: DateTime) => setDateFilter((current) => ({ ...current, to: value?.toFormat('yyyy-MM-dd') })),
    [setDateFilter]
  );

  return (
    <Box
      sx={{
        alignItems: 'flex-end',
        background: theme.palette.TwClrBgInfoTertiary,
        border: `1px solid ${theme.palette.TwClrBrdrInfo}`,
        borderRadius: '8px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
      }}
    >
      {plotType === 'adHoc' && (
        <Dropdown
          id='observation-type-filter'
          label={strings.MONITORING_TYPE}
          onChange={onObservationTypeChange}
          options={observationTypeOptions}
          placeholder={strings.ALL_MONITORING_TYPES}
          selectedValue={observationType === 'All' ? undefined : observationType}
          sx={{ maxWidth: '220px', minWidth: '220px' }}
        />
      )}
      <Box>
        <Typography fontSize='14px' fontWeight={500} marginBottom={theme.spacing(0.5)}>
          {plotType === 'adHoc' ? strings.DATE_OBSERVED : strings.OBSERVATION_DATE}
        </Typography>
        <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: theme.spacing(1) }}>
          <DatePicker
            aria-label={strings.START_DATE}
            id='observation-date-from'
            label=''
            onDateChange={onFromChange}
            sx={datePickerStyles}
            value={dateFilter.from ?? null}
          />
          <Typography sx={{ textTransform: 'lowercase' }}>{strings.TO}</Typography>
          <DatePicker
            aria-label={strings.END_DATE}
            id='observation-date-to'
            label=''
            onDateChange={onToChange}
            sx={datePickerStyles}
            value={dateFilter.to ?? null}
          />
        </Box>
      </Box>
      {plotType === 'adHoc' && (
        <Box>
          <Typography fontSize='14px' fontWeight={500} marginBottom={theme.spacing(0.5)}>
            {strings.PLOT}
          </Typography>
          <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: theme.spacing(1) }}>
            <Textfield
              id='plot-number-min'
              label=''
              min={0}
              onChange={onPlotNumberChange('min')}
              placeholder={strings.MIN}
              sx={plotNumberStyles}
              type='number'
              value={plotNumberFilter.min ?? ''}
            />
            <Typography sx={{ textTransform: 'lowercase' }}>{strings.TO}</Typography>
            <Textfield
              id='plot-number-max'
              label=''
              min={0}
              onChange={onPlotNumberChange('max')}
              placeholder={strings.MAX}
              sx={plotNumberStyles}
              type='number'
              value={plotNumberFilter.max ?? ''}
            />
          </Box>
        </Box>
      )}
      {plotType === 'assigned' && (
        <>
          <MultiSelect<number, string>
            fullWidth
            id='stratum-filter'
            label={strings.STRATA}
            onAdd={(id) => setStratumFilter([...stratumFilter, id])}
            onRemove={(id) => setStratumFilter(stratumFilter.filter((selected) => selected !== id))}
            options={stratumOptions}
            placeHolder={strings.ALL_STRATA}
            selectedOptions={stratumFilter}
            sx={multiSelectStyles}
            valueRenderer={(name) => name}
          />
          <MultiSelect<ObservationState, string>
            fullWidth
            id='status-filter'
            label={strings.STATUS}
            onAdd={(state) => setStatusFilter([...statusFilter, state])}
            onRemove={(state) => setStatusFilter(statusFilter.filter((selected) => selected !== state))}
            options={statusOptions}
            placeHolder={strings.ALL_STATUSES}
            selectedOptions={statusFilter}
            sx={multiSelectStyles}
            valueRenderer={(label) => label}
          />
        </>
      )}
      {activeFilterCount > 0 && (
        <Box sx={{ marginLeft: 'auto' }}>
          <Button
            id='clear-observation-filters'
            label={strings.CLEAR_ALL_FILTERS}
            onClick={clearFilters}
            priority='ghost'
            size='medium'
            type='productive'
          />
        </Box>
      )}
    </Box>
  );
};

export default ObservationFilterPanel;
