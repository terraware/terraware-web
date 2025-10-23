import React, { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import PieChart from 'src/components/common/Chart/PieChart';
import isEnabled from 'src/features';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

export default function LiveDeadPlantsPerSpeciesCard(): JSX.Element {
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [selectedSpecies, setSelectedSpecies] = useState<string>();
  const { species: availableSpecies } = useSpeciesData();
  const [allSpecies, setAllSpecies] = useState<
    {
      label: string;
      value: string;
    }[]
  >();
  const [showChart, setShowChart] = useState(false);
  const { observationSummaries } = usePlantingSiteData();
  const isSurvivalRateCalculationEnabled = isEnabled('Survival Rate Calculation');

  useEffect(() => {
    if (observationSummaries?.[0]) {
      const speciesNames = observationSummaries[0].species
        .filter((sp) => sp.cumulativeDead !== 0 || sp.permanentLive !== 0)
        .map((sp) => ({
          label:
            availableSpecies.find((availableS) => availableS.id === sp.speciesId)?.scientificName ||
            sp.speciesName ||
            '',
          value: sp.speciesId?.toString() || '',
        }));
      setAllSpecies(speciesNames);
      if (speciesNames.length > 0) {
        setSelectedSpecies(speciesNames[0].value);
      }
    }
  }, [observationSummaries, availableSpecies]);

  useEffect(() => {
    if (selectedSpecies) {
      setLabels([strings.LIVE, strings.DEAD]);
      const selectedObservationSpecies = observationSummaries?.[0]?.species.find(
        (sp) => sp.speciesId?.toString() === selectedSpecies
      );

      if (selectedObservationSpecies) {
        setShowChart(true);
        let live = 0;
        let dead = 0;
        if (isSurvivalRateCalculationEnabled) {
          if (selectedObservationSpecies.survivalRate) {
            live = selectedObservationSpecies.survivalRate;
            dead = 100 - live;
          }
        } else {
          dead = selectedObservationSpecies.cumulativeDead;
          live = selectedObservationSpecies.permanentLive;
        }
        setValues([live, dead]);
      }
    } else {
      setLabels([]);
      setValues([]);
    }
  }, [selectedSpecies, observationSummaries, isSurvivalRateCalculationEnabled]);

  return (
    <Box display='flex' flexDirection='column'>
      <Dropdown
        onChange={(newValue) => setSelectedSpecies(newValue)}
        label=''
        options={allSpecies}
        selectedValue={selectedSpecies}
        fullWidth={true}
        selectStyles={{
          inputContainer: {
            maxWidth: '228px',
          },
        }}
      />
      {showChart && (
        <Box>
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
            elementColor={['#99B85F', '#CE9E97']}
          />
        </Box>
      )}
    </Box>
  );
}
