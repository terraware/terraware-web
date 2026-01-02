import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox, Icon } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { Stratum } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';

interface ObservationSubstratumSelectorProps {
  errorText?: string;
  onChangeSelectedSubstrata: (requestedSubstratumIds: number[]) => void;
}

const ObservationSubstratumSelector = ({
  errorText,
  onChangeSelectedSubstrata,
}: ObservationSubstratumSelectorProps) => {
  const theme = useTheme();
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const [selectedSubstrata, setSelectedSubstrata] = useState(new Map<number, boolean>());
  const { plantingSite } = usePlantingSiteData();

  const handleOnChangeSelectedSubstrata = useCallback(
    (nextSelectedSubstrata: Map<number, boolean>) => {
      setSelectedSubstrata(nextSelectedSubstrata);

      // If we were using es2015 or above, this entire function can go away
      // We could call onChangeSelectedSubstrata with a one liner array creation from the map
      const selectedSubstratumIds: number[] = [];
      nextSelectedSubstrata.forEach((value: boolean, substratumId: number) => {
        if (value) {
          selectedSubstratumIds.push(substratumId);
        }
      });
      onChangeSelectedSubstrata(selectedSubstratumIds);
    },
    [onChangeSelectedSubstrata]
  );

  const onChangeSubstratumCheckbox = useCallback(
    (substratumId: number) => (value: boolean) => {
      // Consider using es2015 or above so we can spread iterators and interact with Map a bit better
      const nextSelectedSubstrata = new Map(selectedSubstrata).set(substratumId, value);
      handleOnChangeSelectedSubstrata(nextSelectedSubstrata);
    },
    [handleOnChangeSelectedSubstrata, selectedSubstrata]
  );

  const onChangeStratumCheckbox = useCallback(
    (stratum: Stratum) => (value: boolean) => {
      const nextSelectedSubstrata = new Map(selectedSubstrata);
      stratum.substrata.forEach((substratum) => {
        nextSelectedSubstrata.set(substratum.id, value);
      });

      handleOnChangeSelectedSubstrata(nextSelectedSubstrata);
    },
    [handleOnChangeSelectedSubstrata, selectedSubstrata]
  );

  const isStratumFullySelected = (stratum: Stratum) =>
    stratum.substrata.every((substratum) => selectedSubstrata.get(substratum.id));

  const isStratumPartiallySelected = (stratum: Stratum) =>
    !isStratumFullySelected(stratum) && stratum.substrata.some((substratum) => selectedSubstrata.get(substratum.id));

  useEffect(() => {
    if (plantingSite) {
      // Initialize all substratum selections
      const initialSelectedSubstrata = new Map(
        plantingSite.strata?.flatMap((stratum) =>
          stratum.substrata.map((substratum) => [substratum.id, selectAll ? true : false])
        )
      );
      handleOnChangeSelectedSubstrata(initialSelectedSubstrata);
    }
  }, [handleOnChangeSelectedSubstrata, plantingSite, selectAll]);

  return (
    plantingSite &&
    plantingSite.strata?.length && (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography> {strings.SCHEDULE_OBSERVATION_MESSAGE}</Typography>
          {errorText && <Typography color={theme.palette.TwClrTxtDanger}>{errorText}</Typography>}
        </Grid>
        <Grid item xs={12}>
          <Checkbox
            id='selectAll'
            name='SelectAll'
            label={strings.SELECT_ALL}
            value={selectAll}
            onChange={setSelectAll}
          />
        </Grid>
        {plantingSite.strata?.map((stratum, index) => {
          return (
            <Grid item xs={12} key={index}>
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
                        value={selectedSubstrata.get(substratum.id)}
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
            </Grid>
          );
        })}
      </Grid>
    )
  );
};

export default ObservationSubstratumSelector;
