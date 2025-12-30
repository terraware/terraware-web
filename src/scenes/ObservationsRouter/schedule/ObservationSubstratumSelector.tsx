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
  onChangeSelectedSubzones: (requestedSubzoneIds: number[]) => void;
}

const ObservationSubstratumSelector = ({ errorText, onChangeSelectedSubzones }: ObservationSubstratumSelectorProps) => {
  const theme = useTheme();
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const [selectedSubzones, setSelectedSubzones] = useState(new Map<number, boolean>());
  const { plantingSite } = usePlantingSiteData();

  const handleOnChangeSelectedSubzones = useCallback(
    (nextSelectedSubzones: Map<number, boolean>) => {
      setSelectedSubzones(nextSelectedSubzones);

      // If we were using es2015 or above, this entire function can go away
      // We could call onChangeSelectedSubzones with a one liner array creation from the map
      const selectedSubzoneIds: number[] = [];
      nextSelectedSubzones.forEach((value: boolean, subzoneId: number) => {
        if (value) {
          selectedSubzoneIds.push(subzoneId);
        }
      });
      onChangeSelectedSubzones(selectedSubzoneIds);
    },
    [onChangeSelectedSubzones]
  );

  const onChangeSubzoneCheckbox = useCallback(
    (subzoneId: number) => (value: boolean) => {
      // Consider using es2015 or above so we can spread iterators and interact with Map a bit better
      const nextSelectedSubzones = new Map(selectedSubzones).set(subzoneId, value);
      handleOnChangeSelectedSubzones(nextSelectedSubzones);
    },
    [handleOnChangeSelectedSubzones, selectedSubzones]
  );

  const onChangeZoneCheckbox = useCallback(
    (zone: Stratum) => (value: boolean) => {
      const nextSelectedSubzones = new Map(selectedSubzones);
      zone.substrata.forEach((subzone) => {
        nextSelectedSubzones.set(subzone.id, value);
      });

      handleOnChangeSelectedSubzones(nextSelectedSubzones);
    },
    [handleOnChangeSelectedSubzones, selectedSubzones]
  );

  const isZoneFullySelected = (zone: Stratum) => zone.substrata.every((subzone) => selectedSubzones.get(subzone.id));

  const isZonePartiallySelected = (zone: Stratum) =>
    !isZoneFullySelected(zone) && zone.substrata.some((subzone) => selectedSubzones.get(subzone.id));

  useEffect(() => {
    if (plantingSite) {
      // Initialize all subzone selections
      const initialSelectedSubzones = new Map(
        plantingSite.strata?.flatMap((zone) => zone.substrata.map((subzone) => [subzone.id, selectAll ? true : false]))
      );
      handleOnChangeSelectedSubzones(initialSelectedSubzones);
    }
  }, [handleOnChangeSelectedSubzones, plantingSite, selectAll]);

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
        {plantingSite.strata?.map((zone, index) => {
          return (
            <Grid item xs={12} key={index}>
              <Checkbox
                id={`observation-zone-${zone.id}`}
                indeterminate={isZonePartiallySelected(zone)}
                label={zone.name}
                name='Limit Observation to Zone'
                onChange={onChangeZoneCheckbox(zone)}
                value={isZoneFullySelected(zone)}
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
                {zone.latestObservationCompletedTime
                  ? strings.formatString(
                      strings.LAST_OBSERVATION,
                      getDateDisplayValue(zone.latestObservationCompletedTime)
                    )
                  : strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED}
              </Typography>
              {zone.latestObservationCompletedTime &&
                isAfter(zone.boundaryModifiedTime, zone.latestObservationCompletedTime) && (
                  <Box display='flex' alignItems='center' marginTop={2} marginBottom={1}>
                    <Icon name='warning' fillColor={theme.palette.TwClrTxtSecondary} size='medium' />
                    <Typography color={theme.palette.TwClrTxtSecondary} paddingLeft={1} paddingRight={1}>
                      {strings.formatString(
                        strings.ZONE_GEOMETRY_CHANGED,
                        zone.name,
                        DateTime.fromISO(zone.boundaryModifiedTime).toFormat('yyyy-MM-dd')
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
                {zone.substrata.map((subzone, _index) => {
                  return (
                    <Box sx={{ display: 'inline-block', width: '100%' }} key={_index}>
                      <Checkbox
                        id={`observation-subzone-${zone.id}`}
                        label={subzone.name}
                        name='Limit Observation to Subzone'
                        onChange={onChangeSubzoneCheckbox(subzone.id)}
                        value={selectedSubzones.get(subzone.id)}
                      />
                      {subzone.latestObservationCompletedTime && (
                        <Typography
                          sx={{
                            display: 'inline',
                            fontWeight: 500,
                            color: theme.palette.TwClrTxtSecondary,
                            verticalAlign: 'bottom',
                            paddingLeft: 1,
                          }}
                        >
                          {subzone.latestObservationCompletedTime
                            ? strings.formatString(
                                strings.LAST_OBSERVATION,
                                getDateDisplayValue(subzone.latestObservationCompletedTime)
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
