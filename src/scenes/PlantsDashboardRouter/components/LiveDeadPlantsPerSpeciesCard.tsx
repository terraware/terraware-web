import React, { useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import PieChart from 'src/components/common/Chart/PieChart';
import useObservationSummaries from 'src/hooks/useObservationSummaries';
import { useSpecies } from 'src/scenes/InventoryRouter/form/useSpecies';
import strings from 'src/strings';

type LiveDeadPlantsPerSpeciesCardProps = {
  plantingSiteId: number;
};

export default function LiveDeadPlantsPerSpeciesCard({
  plantingSiteId,
}: LiveDeadPlantsPerSpeciesCardProps): JSX.Element {
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [selectedSpecies, setSelectedSpecies] = useState<string>();

  const { availableSpecies } = useSpecies();
  const [allSpecies, setAllSpecies] = useState<
    {
      label: string;
      value: string;
    }[]
  >();
  const [showChart, setShowChart] = useState(false);
  const summaries = useObservationSummaries(plantingSiteId);
  useEffect(() => {
    if (availableSpecies && summaries?.[0]) {
      const speciesNames = summaries[0].species
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
  }, [summaries, availableSpecies]);

  useEffect(() => {
    if (selectedSpecies) {
      setLabels([strings.LIVE, strings.DEAD]);
      const selectedObservationSpecies = summaries?.[0]?.species.find(
        (sp) => sp.speciesId?.toString() === selectedSpecies
      );

      if (selectedObservationSpecies) {
        setShowChart(true);
        const dead = selectedObservationSpecies.cumulativeDead;
        const live = selectedObservationSpecies.permanentLive;
        setValues([live, dead]);
      }
    } else {
      setLabels([]);
      setValues([]);
    }
  }, [selectedSpecies, summaries]);

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
