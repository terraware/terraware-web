import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox } from '@terraware/web-components';

import { selectObservations, selectObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ObservationResultsPayload } from 'src/types/Observations';
import { PlantingSiteWithReportedPlants, PlantingZone } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';

interface ObservationSubzoneSelectorProps {
  onChangeSelectedSubzones: (requestedSubzoneIds: number[]) => void;
  plantingSite: PlantingSiteWithReportedPlants;
}

const ObservationSubzoneSelector = ({ onChangeSelectedSubzones, plantingSite }: ObservationSubzoneSelectorProps) => {
  const theme = useTheme();

  const [selectedSubzones, setSelectedSubzones] = useState(new Map<number, boolean>());
  const observationsData = useAppSelector(selectObservations);

  const allObservationsResults = useAppSelector(selectObservationsResults);
  const plantingSiteObservations = allObservationsResults?.filter(
    (observation) => observation.plantingSiteId === plantingSite.id
  );
  const zoneObservations: ObservationResultsPayload[][] = [];
  plantingSiteObservations?.forEach((observation) => {
    observation.plantingZones.forEach((pz) => {
      zoneObservations[pz.plantingZoneId]
        ? zoneObservations[pz.plantingZoneId].push(observation)
        : (zoneObservations[pz.plantingZoneId] = [observation]);
    });
  });

  const lastZoneObservation = (observationsList: ObservationResultsPayload[]) => {
    const observationsToProcess = observationsList;
    if (observationsToProcess && observationsToProcess.length > 0) {
      let lastObs = observationsToProcess[0];
      observationsToProcess.forEach((obs) => {
        if (isAfter(obs.startDate, lastObs.startDate)) {
          lastObs = obs;
        }
      });
      return lastObs;
    }
  };

  const lastSubZoneObservation = useCallback(
    (
      zoneId: number,
      subzoneId: number,
      observationsList?: ObservationResultsPayload[]
    ): ObservationResultsPayload | undefined => {
      const observationsToProcess = observationsList ? observationsList : zoneObservations?.[zoneId];
      const lastZoneObs = lastZoneObservation(observationsToProcess);
      const foundObs = observationsData?.find((ob) => ob.id === lastZoneObs?.observationId);

      if (foundObs) {
        if (!foundObs.requestedSubzoneIds || foundObs.requestedSubzoneIds.includes(subzoneId)) {
          return lastZoneObs;
        } else {
          const newZoneObservations = observationsToProcess.filter(
            (ob) => ob.observationId !== lastZoneObs?.observationId
          );

          return lastSubZoneObservation(zoneId, subzoneId, newZoneObservations);
        }
      }
    },
    [zoneObservations, observationsData]
  );

  useEffect(() => {
    // Initialize all subzone selections with subzoneId -> false unless they have totalPlants > 0
    const initialSelectedSubzones = new Map(
      plantingSite.plantingZones?.flatMap((zone) =>
        zone.plantingSubzones.map((subzone) => [subzone.id, (subzone.totalPlants || 0) > 0])
      )
    );
    handleOnChangeSelectedSubzones(initialSelectedSubzones);
  }, [plantingSite]);

  const handleOnChangeSelectedSubzones = (nextSelectedSubzones: Map<number, boolean>) => {
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
  };

  const onChangeSubzoneCheckbox = (subzoneId: number, value: boolean) => {
    // Consider using es2015 or above so we can spread iterators and interact with Map a bit better
    const nextSelectedSubzones = new Map(selectedSubzones).set(subzoneId, value);
    handleOnChangeSelectedSubzones(nextSelectedSubzones);
  };

  const onChangeZoneCheckbox = (zone: PlantingZone, value: boolean) => {
    const nextSelectedSubzones = new Map(selectedSubzones);
    zone.plantingSubzones.forEach((subzone) => {
      nextSelectedSubzones.set(subzone.id, value);
    });

    handleOnChangeSelectedSubzones(nextSelectedSubzones);
  };

  const isZoneFullySelected = (zone: PlantingZone) =>
    zone.plantingSubzones.every((subzone) => selectedSubzones.get(subzone.id));

  const isZonePartiallySelected = (zone: PlantingZone) =>
    !isZoneFullySelected(zone) && zone.plantingSubzones.some((subzone) => selectedSubzones.get(subzone.id));

  return (
    <Grid container spacing={3}>
      {plantingSite.plantingZones?.map((zone, index) => {
        const lastZoneOb = lastZoneObservation(zoneObservations?.[zone.id]);
        return (
          <Grid item xs={12} key={index}>
            <Checkbox
              id={`observation-zone-${zone.id}`}
              indeterminate={isZonePartiallySelected(zone)}
              label={zone.name}
              name='Limit Observation to Zone'
              onChange={(value) => onChangeZoneCheckbox(zone, value)}
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
              {lastZoneOb
                ? strings.formatString(strings.LAST_OBSERVATION, lastZoneOb.startDate || '')
                : strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED}
            </Typography>

            <Box sx={{ columnGap: theme.spacing(3), paddingLeft: `${theme.spacing(4)}` }}>
              {zone.plantingSubzones.map((subzone, _index) => {
                const lastSubzoneOb = lastSubZoneObservation(zone.id, subzone.id);
                return (
                  <Box sx={{ display: 'inline-block', width: '100%' }} key={_index}>
                    <Checkbox
                      id={`observation-subzone-${zone.id}`}
                      label={subzone.totalPlants ? subzone.name : <Box>⚠️ {subzone.name}</Box>}
                      name='Limit Observation to Subzone'
                      onChange={(value) => onChangeSubzoneCheckbox(subzone.id, value)}
                      value={selectedSubzones.get(subzone.id)}
                    />
                    {lastZoneOb && (
                      <Typography
                        sx={{
                          display: 'inline',
                          fontWeight: 500,
                          color: theme.palette.TwClrTxtSecondary,
                          verticalAlign: 'bottom',
                          paddingLeft: 1,
                        }}
                      >
                        {lastSubzoneOb
                          ? strings.formatString(strings.LAST_OBSERVATION, lastSubzoneOb.startDate || '')
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
      <Grid item xs={12}>
        <Box>⚠️: {strings.NO_PLANTS}</Box>
      </Grid>
    </Grid>
  );
};

export default ObservationSubzoneSelector;
