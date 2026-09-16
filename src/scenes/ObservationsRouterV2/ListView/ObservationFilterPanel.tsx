import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { MultiSelect } from '@terraware/web-components';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';
import { ObservationState, getStatus } from 'src/types/Observations';

import { useObservationFilters } from '../ObservationFiltersProvider';

const datePickerStyles = {
  maxWidth: '180px',
  minWidth: '180px',
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
    dateFilter,
    plotType,
    setDateFilter,
    setStatusFilter,
    setStratumFilter,
    setSubstratumFilter,
    statusFilter,
    stratumFilter,
    substratumFilter,
  } = useObservationFilters();
  const { plantingSites } = useOrganizationPlantingSites({ full: true });

  const strata = useMemo(() => {
    const sites =
      plantingSiteId === ALL_PLANTING_SITES
        ? plantingSites
        : plantingSites.filter((site) => site.id === plantingSiteId);
    return sites.flatMap((site) => site.strata ?? []);
  }, [plantingSiteId, plantingSites]);

  const stratumOptions = useMemo(() => new Map(strata.map((stratum) => [stratum.id, stratum.name])), [strata]);

  const substratumOptions = useMemo(
    () =>
      new Map(
        strata
          .filter((stratum) => stratumFilter.includes(stratum.id))
          .flatMap((stratum) => stratum.substrata)
          .map((substratum) => [substratum.id, substratum.name])
      ),
    [strata, stratumFilter]
  );

  const statusOptions = useMemo(
    () => new Map(OBSERVATION_STATES.map((state) => [state, getStatus(state, strings)])),
    [strings]
  );

  const onStrataChange = useCallback(
    (stratumIds: number[]) => {
      setStratumFilter(stratumIds);

      const remaining = strata
        .filter((stratum) => stratumIds.includes(stratum.id))
        .flatMap((stratum) => stratum.substrata)
        .map((substratum) => substratum.id);
      setSubstratumFilter(substratumFilter.filter((id) => remaining.includes(id)));
    },
    [setStratumFilter, setSubstratumFilter, strata, substratumFilter]
  );

  const onFromChange = useCallback(
    (value?: DateTime) => setDateFilter({ ...dateFilter, from: value?.toFormat('yyyy-MM-dd') }),
    [dateFilter, setDateFilter]
  );

  const onToChange = useCallback(
    (value?: DateTime) => setDateFilter({ ...dateFilter, to: value?.toFormat('yyyy-MM-dd') }),
    [dateFilter, setDateFilter]
  );

  return (
    <Box sx={{ alignItems: 'flex-end', display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2) }}>
      <Box>
        <Typography fontSize='14px' fontWeight={500} marginBottom={theme.spacing(0.5)}>
          {plotType === 'adHoc' ? strings.DATE_OBSERVED : strings.OBSERVATION_DATE}
        </Typography>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: theme.spacing(1) }}>
          <DatePicker
            aria-label={strings.START_DATE}
            id='observation-date-from'
            label=''
            onDateChange={onFromChange}
            sx={datePickerStyles}
            value={dateFilter.from ?? null}
          />
          <Typography>{'–'}</Typography>
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
      {plotType === 'assigned' && (
        <>
          <MultiSelect<number, string>
            fullWidth
            id='stratum-filter'
            label={strings.STRATA}
            onAdd={(id) => onStrataChange([...stratumFilter, id])}
            onRemove={(id) => onStrataChange(stratumFilter.filter((selected) => selected !== id))}
            options={stratumOptions}
            selectedOptions={stratumFilter}
            sx={multiSelectStyles}
            valueRenderer={(name) => name}
          />
          {stratumFilter.length > 0 && (
            <MultiSelect<number, string>
              fullWidth
              id='substratum-filter'
              label={strings.SUBSTRATA}
              onAdd={(id) => setSubstratumFilter([...substratumFilter, id])}
              onRemove={(id) => setSubstratumFilter(substratumFilter.filter((selected) => selected !== id))}
              options={substratumOptions}
              selectedOptions={substratumFilter}
              sx={multiSelectStyles}
              valueRenderer={(name) => name}
            />
          )}
          <MultiSelect<ObservationState, string>
            fullWidth
            id='status-filter'
            label={strings.STATUS}
            onAdd={(state) => setStatusFilter([...statusFilter, state])}
            onRemove={(state) => setStatusFilter(statusFilter.filter((selected) => selected !== state))}
            options={statusOptions}
            selectedOptions={statusFilter}
            sx={multiSelectStyles}
            valueRenderer={(label) => label}
          />
        </>
      )}
    </Box>
  );
};

export default ObservationFilterPanel;
