import React, { useEffect, useState } from 'react';

import { Box, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dropdown } from '@terraware/web-components';

import PieChart from 'src/components/common/Chart/PieChart';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type LiveDeadPlantsPerSpeciesCardProps = {
  plantingSiteId: number;
};

const useStyles = makeStyles((theme: Theme) => ({
  maxDropdownWidth: {
    maxWidth: '228px',
  },
}));

export default function LiveDeadPlantsPerSpeciesCard({
  plantingSiteId,
}: LiveDeadPlantsPerSpeciesCardProps): JSX.Element {
  const theme = useTheme();
  const classes = useStyles();
  const defaultTimeZone = useDefaultTimeZone();
  const observation = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );

  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [selectedSpecies, setSelectedSpecies] = useState<string>();
  const [allSpecies, setAllSpecies] = useState<
    {
      label: string;
      value: string;
    }[]
  >();
  const [showChart, setShowChart] = useState(false);
  useEffect(() => {
    if (observation) {
      const speciesNames = observation.species.map((sp) => ({
        label: sp.speciesScientificName || '',
        value: sp.speciesId?.toString() || '',
      }));
      setAllSpecies(speciesNames);
      if (speciesNames.length > 0) {
        setSelectedSpecies(speciesNames[0].value);
      }
    }
  }, [observation]);

  useEffect(() => {
    if (selectedSpecies) {
      setLabels([strings.LIVE, strings.DEAD]);
      const selectedObservationSpecies = observation?.species.find(
        (sp) => sp.speciesId?.toString() === selectedSpecies
      );
      if (
        selectedObservationSpecies &&
        (selectedObservationSpecies.cumulativeDead !== 0 || selectedObservationSpecies.permanentLive !== 0)
      ) {
        setShowChart(true);
        const dead = selectedObservationSpecies.cumulativeDead;
        const live = selectedObservationSpecies.permanentLive;
        setValues([live, dead]);
      }
    } else {
      setLabels([]);
      setValues([]);
    }
  }, [selectedSpecies, observation]);

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {strings.LIVE_DEAD_PLANTS_PER_SPECIES_CARD_TITLE}
          </Typography>
          <Dropdown
            onChange={(newValue) => setSelectedSpecies(newValue)}
            label=''
            options={allSpecies}
            selectedValue={selectedSpecies}
            className={classes.maxDropdownWidth}
            fullWidth={true}
          />
          {showChart && (
            <Box marginTop={theme.spacing(3)}>
              <PieChart
                chartId='liveDeadplantsBySpecies'
                chartData={{
                  labels: labels ?? [],
                  datasets: [
                    {
                      values: values ?? [],
                    },
                  ],
                }}
                maxWidth='100%'
              />
            </Box>
          )}
        </Box>
      }
    />
  );
}
