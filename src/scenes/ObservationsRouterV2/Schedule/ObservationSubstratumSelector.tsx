import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox, Icon } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import { Stratum } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';

const PLOT_COUNT_COLUMN_WIDTH = '88px';

interface ObservationSubstratumSelectorProps {
  errorText?: string;
  onChangeSelectedSubstrata: (requestedSubstratumIds: number[]) => void;
  plantingSiteId: number;
}

const ObservationSubstratumSelector = ({
  errorText,
  onChangeSelectedSubstrata,
  plantingSiteId,
}: ObservationSubstratumSelectorProps) => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { plantingSite } = usePlantingSite(plantingSiteId);

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedSubstrata, setSelectedSubstrata] = useState<number[]>([]);

  const onChangeSubstratumCheckbox = useCallback(
    (substratumId: number) => (value: boolean) => {
      setSelectedSubstrata((existingSelectedSubstrata) => {
        if (!existingSelectedSubstrata.includes(substratumId) && value) {
          return [...existingSelectedSubstrata, substratumId];
        } else if (existingSelectedSubstrata.includes(substratumId) && !value) {
          return existingSelectedSubstrata.filter((existingId) => existingId !== substratumId);
        }
        return existingSelectedSubstrata;
      });
    },
    []
  );

  const onChangeStratumCheckbox = useCallback(
    (stratum: Stratum) => (value: boolean) => {
      setSelectedSubstrata((existingSelectedSubstrata) => {
        if (value) {
          const nextSelectedSubstrata = [...existingSelectedSubstrata];
          stratum.substrata.forEach((substratum) => {
            if (!existingSelectedSubstrata.includes(substratum.id)) {
              nextSelectedSubstrata.push(substratum.id);
            }
          });
          return nextSelectedSubstrata;
        } else {
          return existingSelectedSubstrata.filter(
            (substratumId) => stratum.substrata.find((substratum) => substratum.id === substratumId) === undefined
          );
        }
      });
    },
    []
  );

  const isStratumFullySelected = useCallback(
    (stratum: Stratum) =>
      stratum.substrata.length > 0 &&
      stratum.substrata.every(
        (substratum) => !!selectedSubstrata.find((substratumId) => substratumId === substratum.id)
      ),
    [selectedSubstrata]
  );

  const isStratumPartiallySelected = useCallback(
    (stratum: Stratum) =>
      !isStratumFullySelected(stratum) &&
      stratum.substrata.some((substratum) => selectedSubstrata.find((substratumId) => substratumId === substratum.id)),
    [isStratumFullySelected, selectedSubstrata]
  );

  useEffect(() => {
    if (plantingSite) {
      // Initialize all substratum selections
      const initialSelectedSubstrata =
        plantingSite.strata?.flatMap((stratum) => stratum.substrata.map((substratum) => substratum.id)) ?? [];
      setSelectedSubstrata(selectAll ? initialSelectedSubstrata : []);
    }
  }, [plantingSite, selectAll]);

  useEffect(() => {
    onChangeSelectedSubstrata(selectedSubstrata);
  }, [onChangeSelectedSubstrata, selectedSubstrata]);

  const fullySelectedStrata = useMemo(
    () => plantingSite?.strata?.filter(isStratumFullySelected) ?? [],
    [isStratumFullySelected, plantingSite]
  );

  const partiallySelectedStrata = useMemo(
    () => plantingSite?.strata?.filter(isStratumPartiallySelected) ?? [],
    [isStratumPartiallySelected, plantingSite]
  );

  const assignedPlots = useMemo(
    () =>
      fullySelectedStrata.reduce(
        (totals, stratum) => ({
          permanent: totals.permanent + stratum.numPermanentPlots,
          temporary: totals.temporary + stratum.numTemporaryPlots,
        }),
        { permanent: 0, temporary: 0 }
      ),
    [fullySelectedStrata]
  );

  const totalAssignedPlotsText = useMemo(() => {
    const total = assignedPlots.permanent + assignedPlots.temporary;
    return strings.formatString(total === 1 ? strings.X_PLOT : strings.X_PLOTS, total) as string;
  }, [assignedPlots, strings]);

  return (
    plantingSite &&
    plantingSite.strata?.length && (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography fontSize='14px'>{strings.SCHEDULE_OBSERVATION_MESSAGE}</Typography>
          <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
            {strings.SCHEDULE_OBSERVATION_PLOT_COUNTS_MESSAGE}
          </Typography>
          {errorText && (
            <Typography fontSize='14px' color={theme.palette.TwClrBaseOrange700}>
              {errorText}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          <Box display='flex' alignItems='center'>
            <Box flex={1}>
              <Checkbox
                id='selectAll'
                name='SelectAll'
                label={strings.SELECT_ALL}
                value={selectAll}
                onChange={setSelectAll}
              />
            </Box>
            <Typography
              fontSize='12px'
              color={theme.palette.TwClrTxtSecondary}
              textAlign='right'
              width={PLOT_COUNT_COLUMN_WIDTH}
              flexShrink={0}
            >
              {strings.PERMANENT}
            </Typography>
            <Typography
              fontSize='12px'
              color={theme.palette.TwClrTxtSecondary}
              textAlign='right'
              width={PLOT_COUNT_COLUMN_WIDTH}
              flexShrink={0}
            >
              {strings.TEMPORARY}
            </Typography>
          </Box>
        </Grid>
        {plantingSite.strata?.map((stratum, index) => {
          return (
            <Grid item xs={12} key={index}>
              <Box display='flex' alignItems='center'>
                <Box flex={1}>
                  <Checkbox
                    id={`observation-stratum-${stratum.id}`}
                    indeterminate={isStratumPartiallySelected(stratum)}
                    label={stratum.name}
                    name='Limit Observation to Stratum'
                    onChange={onChangeStratumCheckbox(stratum)}
                    value={isStratumFullySelected(stratum)}
                  />
                  <Typography
                    sx={{
                      display: 'inline',
                      fontWeight: 500,
                      color: theme.palette.TwClrTxtSecondary,
                      verticalAlign: 'bottom',
                      paddingLeft: 1,
                    }}
                  >
                    {stratum.latestObservationCompletedTime
                      ? strings.formatString(
                          strings.LAST_OBSERVATION,
                          getDateDisplayValue(stratum.latestObservationCompletedTime)
                        )
                      : strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED}
                  </Typography>
                </Box>
                <Typography textAlign='right' fontWeight={500} width={PLOT_COUNT_COLUMN_WIDTH} flexShrink={0}>
                  {stratum.numPermanentPlots}
                </Typography>
                <Typography textAlign='right' fontWeight={500} width={PLOT_COUNT_COLUMN_WIDTH} flexShrink={0}>
                  {stratum.numTemporaryPlots}
                </Typography>
              </Box>
              {stratum.latestObservationCompletedTime &&
                isAfter(stratum.boundaryModifiedTime, stratum.latestObservationCompletedTime) && (
                  <Box display='flex' alignItems='center' marginTop={2} marginBottom={1}>
                    <Icon name='warning' fillColor={theme.palette.TwClrTxtSecondary} size='medium' />
                    <Typography color={theme.palette.TwClrTxtSecondary} paddingLeft={1} paddingRight={1}>
                      {strings.formatString(
                        strings.STRATUM_GEOMETRY_CHANGED,
                        stratum.name,
                        DateTime.fromISO(stratum.boundaryModifiedTime).toFormat('yyyy-MM-dd')
                      )}
                    </Typography>
                    <Link
                      target='_blank'
                      fontSize={'16px'}
                      to={APP_PATHS.PLANTING_SITES_VIEW.replace(':plantingSiteId', plantingSite.id.toString())}
                    >
                      {strings.VIEW_MAP}
                    </Link>
                  </Box>
                )}
              <Box sx={{ columnGap: theme.spacing(3), paddingLeft: `${theme.spacing(4)}` }}>
                {stratum.substrata.map((substratum, _index) => {
                  return (
                    <Box sx={{ display: 'inline-block', width: '100%' }} key={_index}>
                      <Checkbox
                        id={`observation-substratum-${stratum.id}`}
                        label={substratum.name}
                        name='Limit Observation to Substratum'
                        onChange={onChangeSubstratumCheckbox(substratum.id)}
                        value={selectedSubstrata.includes(substratum.id)}
                      />
                      {substratum.latestObservationCompletedTime && (
                        <Typography
                          sx={{
                            display: 'inline',
                            fontWeight: 500,
                            color: theme.palette.TwClrTxtSecondary,
                            verticalAlign: 'bottom',
                            paddingLeft: 1,
                          }}
                        >
                          {substratum.latestObservationCompletedTime
                            ? strings.formatString(
                                strings.LAST_OBSERVATION,
                                getDateDisplayValue(substratum.latestObservationCompletedTime)
                              )
                            : strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
              {isStratumPartiallySelected(stratum) && (
                <Typography color={theme.palette.TwClrBaseOrange700} paddingTop={1} fontSize='14px'>
                  {strings.formatString(strings.SCHEDULE_OBSERVATION_SELECT_ALL_SUBSTRATA, stratum.name)}
                </Typography>
              )}
            </Grid>
          );
        })}
        {(fullySelectedStrata.length > 0 || partiallySelectedStrata.length > 0) && (
          <Grid item xs={12}>
            <Divider sx={{ marginBottom: theme.spacing(3) }} />
            {fullySelectedStrata.length > 0 && (
              <Typography fontSize='14px'>
                {strings.formatString(
                  fullySelectedStrata.length === 1
                    ? strings.SCHEDULE_OBSERVATION_PLOTS_ASSIGNED_STRATUM
                    : strings.SCHEDULE_OBSERVATION_PLOTS_ASSIGNED_STRATA,
                  <b>{totalAssignedPlotsText}</b>,
                  <>{assignedPlots.temporary}</>,
                  <>{assignedPlots.permanent}</>
                )}
              </Typography>
            )}
            {partiallySelectedStrata.map((stratum) => (
              <Typography color={theme.palette.TwClrBaseOrange700} fontSize='14px' key={stratum.id}>
                {strings.formatString(strings.SCHEDULE_OBSERVATION_STRATUM_EXCLUDED, stratum.name)}
              </Typography>
            ))}
          </Grid>
        )}
      </Grid>
    )
  );
};

export default ObservationSubstratumSelector;
