import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Badge, Checkbox, Icon } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization, useOrganization } from 'src/providers';
import { useListPlantingSiteReportedPlantsQuery } from 'src/queries/generated/plantingSites';
import { Stratum } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';

import getSubstratumPlotEstimates, { PlotCounts } from './getSubstratumPlotEstimates';
import { MonitoringType } from './monitoringTypes';

const PLOT_COUNT_COLUMN_WIDTH = '88px';

interface ObservationSubstratumSelectorProps {
  errorText?: string;
  monitoringType: MonitoringType;
  onChangeSelectedSubstrata: (requestedSubstratumIds: number[]) => void;
  plantingSiteId: number;
}

const ObservationSubstratumSelector = ({
  errorText,
  monitoringType,
  onChangeSelectedSubstrata,
  plantingSiteId,
}: ObservationSubstratumSelectorProps) => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { plantingSite } = usePlantingSite(plantingSiteId);
  const { selectedOrganization } = useOrganization();
  const isBaseline = monitoringType === 'Baseline Survey';
  const reportedPlants = useListPlantingSiteReportedPlantsQuery(
    { organizationId: selectedOrganization?.id ?? -1 },
    { skip: !isBaseline || !selectedOrganization }
  );

  const plantedSubstrata = useMemo(
    () =>
      new Set(
        reportedPlants.currentData?.sites
          .find((site) => site.id === plantingSiteId)
          ?.strata.flatMap((stratum) => stratum.substrata)
          .filter((substratum) => substratum.totalPlants > 0)
          .map((substratum) => substratum.id)
      ),
    [plantingSiteId, reportedPlants.currentData]
  );

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedSubstrata, setSelectedSubstrata] = useState<number[]>([]);

  const plotCountsFor = useCallback(
    (stratum: Stratum) =>
      stratum.plotCounts.find((counts) => counts.observationType === monitoringType) ??
      (monitoringType === 'Monitoring'
        ? { numPermanentPlots: stratum.numPermanentPlots, numTemporaryPlots: stratum.numTemporaryPlots }
        : { numPermanentPlots: 0, numTemporaryPlots: 0 }),
    [monitoringType]
  );

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

  const substratumEstimates = useMemo(() => {
    const estimates = new Map<number, PlotCounts>();
    plantingSite?.strata?.forEach((stratum) => {
      getSubstratumPlotEstimates(stratum, plotCountsFor(stratum)).forEach((counts, substratumId) =>
        estimates.set(substratumId, counts)
      );
    });
    return estimates;
  }, [plantingSite, plotCountsFor]);

  const assignedPlots = useMemo(
    () =>
      selectedSubstrata.reduce(
        (totals, substratumId) => {
          const estimate = substratumEstimates.get(substratumId);
          return {
            permanent: totals.permanent + (estimate?.numPermanentPlots ?? 0),
            temporary: totals.temporary + (estimate?.numTemporaryPlots ?? 0),
          };
        },
        { permanent: 0, temporary: 0 }
      ),
    [selectedSubstrata, substratumEstimates]
  );

  const approximate = useCallback((count: number) => `${strings.APPROX_SYMBOL}${count}`, [strings.APPROX_SYMBOL]);

  const totalAssignedPlotsText = useMemo(() => {
    const total = assignedPlots.permanent + assignedPlots.temporary;
    return strings.formatString(total === 1 ? strings.X_PLOT : strings.X_PLOTS, approximate(total)) as string;
  }, [approximate, assignedPlots, strings]);

  return (
    plantingSite &&
    plantingSite.strata?.length && (
      <Grid container spacing={3}>
        <Grid size={12}>
          <Typography fontSize='14px'>{strings.SCHEDULE_OBSERVATION_MESSAGE}</Typography>
          <Typography
            component='ul'
            fontSize='14px'
            color={theme.palette.TwClrTxtSecondary}
            sx={{ margin: 0, paddingLeft: theme.spacing(3) }}
          >
            <li>{strings.SCHEDULE_OBSERVATION_STRATUM_COUNTS_MESSAGE}</li>
            <li>{strings.SCHEDULE_OBSERVATION_SUBSTRATUM_COUNTS_MESSAGE}</li>
          </Typography>
          {errorText && (
            <Typography fontSize='14px' color={theme.palette.TwClrBaseOrange700}>
              {errorText}
            </Typography>
          )}
        </Grid>
        <Grid size={12}>
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
              {strings.PERMANENT_PLOTS}
            </Typography>
            <Typography
              fontSize='12px'
              color={theme.palette.TwClrTxtSecondary}
              textAlign='right'
              width={PLOT_COUNT_COLUMN_WIDTH}
              flexShrink={0}
            >
              {strings.TEMPORARY_PLOTS}
            </Typography>
          </Box>
        </Grid>
        {plantingSite.strata?.map((stratum, index) => {
          const { numPermanentPlots, numTemporaryPlots } = plotCountsFor(stratum);

          return (
            <Grid key={index} size={12}>
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
                      display: isBaseline ? 'block' : 'inline',
                      fontWeight: 500,
                      color: theme.palette.TwClrTxtSecondary,
                      verticalAlign: 'bottom',
                      paddingLeft: isBaseline ? 4 : 1,
                    }}
                  >
                    {isBaseline
                      ? `${strings.formatString(
                          strings.BASELINE_X_OF_Y,
                          stratum.substrata.filter((substratum) => Boolean(substratum.latestBaselineSurveyStatus))
                            .length,
                          stratum.substrata.length
                        ) as string} · ${strings.formatString(
                          strings.HAS_PLANTINGS_X_OF_Y,
                          stratum.substrata.filter((substratum) => plantedSubstrata.has(substratum.id)).length,
                          stratum.substrata.length
                        ) as string}`
                      : stratum.latestObservationCompletedTime
                        ? strings.formatString(
                            strings.LAST_OBSERVATION,
                            getDateDisplayValue(stratum.latestObservationCompletedTime)
                          )
                        : strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED}
                  </Typography>
                </Box>
                <Typography textAlign='right' fontWeight={500} width={PLOT_COUNT_COLUMN_WIDTH} flexShrink={0}>
                  {numPermanentPlots}
                </Typography>
                <Typography textAlign='right' fontWeight={500} width={PLOT_COUNT_COLUMN_WIDTH} flexShrink={0}>
                  {numTemporaryPlots}
                </Typography>
              </Box>
              {!isBaseline &&
                stratum.latestObservationCompletedTime &&
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
              <Box sx={{ paddingLeft: `${theme.spacing(4)}` }}>
                {stratum.substrata.map((substratum, _index) => {
                  const estimate = substratumEstimates.get(substratum.id);

                  return (
                    <Box display='flex' alignItems='center' key={_index}>
                      <Box flex={1}>
                        <Checkbox
                          id={`observation-substratum-${stratum.id}`}
                          label={substratum.name}
                          name='Limit Observation to Substratum'
                          onChange={onChangeSubstratumCheckbox(substratum.id)}
                          value={selectedSubstrata.includes(substratum.id)}
                        />
                        {isBaseline && (
                          <Box
                            component='span'
                            display='inline-flex'
                            gap={1}
                            flexWrap='wrap'
                            alignItems='center'
                            paddingLeft={1}
                          >
                            {substratum.latestBaselineSurveyDate && substratum.latestBaselineSurveyStatus && (
                              <Badge
                                label={
                                  strings.formatString(
                                    substratum.latestBaselineSurveyStatus === 'Overdue'
                                      ? strings.BASELINE_OVERDUE_X
                                      : ['Completed', 'Abandoned'].includes(substratum.latestBaselineSurveyStatus)
                                        ? strings.BASELINE_COMPLETED_X
                                        : strings.BASELINE_SCHEDULED_X,
                                    substratum.latestBaselineSurveyDate
                                  ) as string
                                }
                                backgroundColor={
                                  substratum.latestBaselineSurveyStatus === 'Overdue'
                                    ? theme.palette.TwClrBgWarningTertiary
                                    : undefined
                                }
                                borderColor={
                                  substratum.latestBaselineSurveyStatus === 'Overdue'
                                    ? theme.palette.TwClrBrdrWarning
                                    : undefined
                                }
                                labelColor={
                                  substratum.latestBaselineSurveyStatus === 'Overdue'
                                    ? theme.palette.TwClrTxtWarning
                                    : theme.palette.TwClrTxt
                                }
                              />
                            )}
                            {plantedSubstrata.has(substratum.id) && (
                              <Badge
                                label={strings.HAS_PLANTINGS}
                                backgroundColor={theme.palette.TwClrBgSuccessTertiary}
                                borderColor={theme.palette.TwClrBrdrSuccess}
                                labelColor={theme.palette.TwClrTxtSuccess}
                              />
                            )}
                          </Box>
                        )}
                        {!isBaseline && substratum.latestObservationCompletedTime && (
                          <Typography
                            sx={{
                              display: 'inline',
                              fontWeight: 500,
                              color: theme.palette.TwClrTxtSecondary,
                              verticalAlign: 'bottom',
                              paddingLeft: 1,
                            }}
                          >
                            {strings.formatString(
                              strings.LAST_OBSERVATION,
                              getDateDisplayValue(substratum.latestObservationCompletedTime)
                            )}
                          </Typography>
                        )}
                      </Box>
                      <Typography textAlign='right' width={PLOT_COUNT_COLUMN_WIDTH} flexShrink={0}>
                        {approximate(estimate?.numPermanentPlots ?? 0)}
                      </Typography>
                      <Typography textAlign='right' width={PLOT_COUNT_COLUMN_WIDTH} flexShrink={0}>
                        {approximate(estimate?.numTemporaryPlots ?? 0)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          );
        })}
        {selectedSubstrata.length > 0 && (
          <Grid size={12}>
            <Divider sx={{ marginBottom: theme.spacing(3) }} />
            <Typography fontSize='14px'>
              {strings.formatString(
                strings.SCHEDULE_OBSERVATION_PLOTS_ASSIGNED,
                <b>{totalAssignedPlotsText}</b>,
                <>{approximate(assignedPlots.temporary)}</>,
                <>{approximate(assignedPlots.permanent)}</>
              )}
            </Typography>
          </Grid>
        )}
      </Grid>
    )
  );
};

export default ObservationSubstratumSelector;
