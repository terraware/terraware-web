import React, { useEffect, useState } from 'react';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Typography, useTheme } from '@mui/material';
import { ObservationResults } from 'src/types/Observations';
import { Dropdown } from '@terraware/web-components';
import PieChart from 'src/components/common/Chart/PieChart';

type LiveDeadPlantsPerSpeciesCardProps = {
  observation?: ObservationResults;
};

export default function LiveDeadPlantsPerSpeciesCard({ observation }: LiveDeadPlantsPerSpeciesCardProps): JSX.Element {
  const theme = useTheme();
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
    }
  }, [observation]);

  useEffect(() => {
    if (selectedSpecies) {
      setLabels([strings.LIVE, strings.DEAD]);
      const selectedObservationSpecies = observation?.species.find(
        (sp) => sp.speciesId?.toString() === selectedSpecies
      );
      if (selectedObservationSpecies && selectedObservationSpecies.mortalityRate) {
        setShowChart(true);
        const totalPlants = selectedObservationSpecies.totalPlants;
        const dead = (selectedObservationSpecies.mortalityRate * totalPlants) / 100;
        const live = totalPlants - dead;
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
          />
          {showChart && (
            <Box marginTop={theme.spacing(3)}>
              <PieChart chartId='liveDeadplantsBySpecies' chartLabels={labels} chartValues={values} maxWidth='100%' />
            </Box>
          )}
        </Box>
      }
    />
  );
}
