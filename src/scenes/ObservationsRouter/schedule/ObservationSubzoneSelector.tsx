import React, { useEffect, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Checkbox, Icon } from '@terraware/web-components';

import strings from 'src/strings';
import { PlantingSiteWithReportedPlants, PlantingZone } from 'src/types/Tracking';

interface ObservationSubzoneSelectorProps {
  onChangeSelectedSubzones: (requestedSubzoneIds: number[]) => void;
  plantingSite: PlantingSiteWithReportedPlants;
}

const ObservationSubzoneSelector = ({ onChangeSelectedSubzones, plantingSite }: ObservationSubzoneSelectorProps) => {
  const theme = useTheme();

  const [selectedSubzones, setSelectedSubzones] = useState(new Map<number, boolean>());

  useEffect(() => {
    // Initialize all subzone selections with subzoneId -> false unless they have totalPlants > 0
    setSelectedSubzones(
      new Map(
        plantingSite.plantingZones?.flatMap((zone) =>
          zone.plantingSubzones.map((subzone) => [subzone.id, (subzone.totalPlants || 0) > 0])
        )
      )
    );
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
      {plantingSite.plantingZones?.map((zone, index) => (
        <Grid item xs={12} key={index}>
          <Checkbox
            id={`observation-zone-${zone.id}`}
            indeterminate={isZonePartiallySelected(zone)}
            label={zone.name}
            name='Limit Observation to Zone'
            onChange={(value) => onChangeZoneCheckbox(zone, value)}
            value={isZoneFullySelected(zone)}
          />

          <Box sx={{ columnCount: 2, columnGap: theme.spacing(3), paddingLeft: `${theme.spacing(4)}` }}>
            {zone.plantingSubzones.map((subzone, _index) => (
              <Box sx={{ display: 'inline-block' }} key={_index}>
                <Checkbox
                  id={`observation-subzone-${zone.id}`}
                  label={
                    subzone.totalPlants ? (
                      subzone.name
                    ) : (
                      <Box>
                        <Icon name='warning' style={{ margin: '4px 4px 4px 0', verticalAlign: 'bottom' }} />
                        {subzone.name}
                      </Box>
                    )
                  }
                  name='Limit Observation to Subzone'
                  onChange={(value) => onChangeSubzoneCheckbox(subzone.id, value)}
                  value={selectedSubzones.get(subzone.id)}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      ))}
      <Grid item xs={12}>
        <Box>
          <Icon name='warning' style={{ margin: '4px 0', verticalAlign: 'bottom' }} />: {strings.NO_PLANTS}
        </Box>
      </Grid>
    </Grid>
  );
};

export default ObservationSubzoneSelector;
