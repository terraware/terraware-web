import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';

import PieChart from 'src/components/common/Chart/PieChart';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';

export default function LiveDeadPlantsPerSpeciesCard(): JSX.Element {
  const [values, setValues] = useState<number[]>();
  const [selectedSpecies, setSelectedSpecies] = useState<string>();
  const { species: availableSpecies } = useSpeciesData();
  const [allSpecies, setAllSpecies] = useState<
    {
      label: string;
      value: string;
    }[]
  >();
  const { observationSummaries } = usePlantingSiteData();
  const theme = useTheme();
  const { strings, activeLocale } = useLocalization();

  const LIVE_DEAD_LABELS = useMemo(() => {
    return [strings.LIVE, strings.DEAD];
  }, [strings]);

  useEffect(() => {
    if (observationSummaries?.[0]) {
      const filterFn = (sp: any) => sp.survivalRate !== undefined && sp.survivalRate !== null;

      const speciesNames = observationSummaries[0].species
        .filter(filterFn)
        .map((sp) => ({
          label:
            availableSpecies.find((availableS) => availableS.id === sp.speciesId)?.scientificName ||
            sp.speciesName ||
            '',
          value: sp.speciesId?.toString() || '',
        }))
        .sort((a, b) => a.label.localeCompare(b.label, activeLocale || undefined));

      setAllSpecies(speciesNames);
      if (speciesNames.length > 0) {
        setSelectedSpecies(speciesNames[0].value);
      }
    }
  }, [observationSummaries, availableSpecies, activeLocale]);

  useEffect(() => {
    if (selectedSpecies) {
      const selectedObservationSpecies = observationSummaries?.[0]?.species.find(
        (sp) => sp.speciesId?.toString() === selectedSpecies
      );

      if (selectedObservationSpecies) {
        let live = 0;
        let dead = 0;
        if (selectedObservationSpecies.survivalRate !== undefined && selectedObservationSpecies.survivalRate !== null) {
          live = selectedObservationSpecies.survivalRate;
          if (live < 100) {
            dead = 100 - live;
          } else {
            dead = 0;
          }
          setValues([live, dead]);
        }
      }
    } else {
      setValues([]);
    }
  }, [selectedSpecies, observationSummaries, LIVE_DEAD_LABELS]);

  const tooltipRenderer = useCallback((tooltipItem: TooltipItem<keyof ChartTypeRegistry>) => {
    const v = tooltipItem.dataset.data[tooltipItem.dataIndex]?.toString();
    return `${v}%`;
  }, []);

  const allSpeciesNoValues = useMemo(() => {
    return observationSummaries?.[0].species.every((sp) => {
      return !sp.survivalRate;
    });
  }, [observationSummaries]);

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
        disabled={!allSpecies || allSpecies.length === 0 || allSpeciesNoValues}
        placeholder={strings.SELECT}
      />
      <Box>
        <PieChart
          chartId='liveDeadplantsBySpecies'
          chartData={{
            labels: LIVE_DEAD_LABELS ?? [],
            datasets: [
              {
                values: values ?? [],
              },
            ],
          }}
          maxWidth='100%'
          elementColor={['#99B85F', '#CE9E97']}
          customTooltipLabel={tooltipRenderer}
          pluginsOptions={{
            emptyDoughnut: {
              color: theme.palette.TwClrBaseGray050,
            },
            legend: {
              labels: {
                generateLabels: (chart: any) => {
                  const colors = ['#99B85F', '#CE9E97'];
                  const chartLabels = chart.data.labels || [];
                  return chartLabels.map((label: string, i: number) => ({
                    text: label,
                    fillStyle: colors[i],
                    strokeStyle: colors[i],
                    hidden: false,
                    datasetIndex: 0,
                    index: i,
                  }));
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
