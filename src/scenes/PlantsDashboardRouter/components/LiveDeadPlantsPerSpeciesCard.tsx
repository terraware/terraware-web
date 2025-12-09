import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';

import PieChart from 'src/components/common/Chart/PieChart';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';

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
  const theme = useTheme();
  const { strings, activeLocale } = useLocalization();

  const LIVE_DEAD_LABELS = useMemo(() => {
    return [strings.LIVE, strings.DEAD];
  }, [strings]);

  useEffect(() => {
    if (observationSummaries?.[0]) {
      const filterFn = isSurvivalRateCalculationEnabled
        ? (sp: any) => sp.survivalRate !== undefined && sp.survivalRate !== null
        : (sp: any) => sp.cumulativeDead !== 0 || sp.permanentLive !== 0;

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
  }, [observationSummaries, availableSpecies, isSurvivalRateCalculationEnabled, activeLocale]);

  useEffect(() => {
    if (selectedSpecies) {
      setLabels(LIVE_DEAD_LABELS);
      const selectedObservationSpecies = observationSummaries?.[0]?.species.find(
        (sp) => sp.speciesId?.toString() === selectedSpecies
      );

      if (selectedObservationSpecies) {
        setShowChart(true);
        let live = 0;
        let dead = 0;
        if (isSurvivalRateCalculationEnabled) {
          if (
            selectedObservationSpecies.survivalRate !== undefined &&
            selectedObservationSpecies.survivalRate !== null
          ) {
            live = selectedObservationSpecies.survivalRate;
            if (live < 100) {
              dead = 100 - live;
            } else {
              dead = 0;
            }
            setValues([live, dead]);
          }
        } else {
          dead = selectedObservationSpecies.cumulativeDead;
          live = selectedObservationSpecies.permanentLive;
          setValues([live, dead]);
        }
      }
    } else {
      setLabels([]);
      setValues([]);
    }
  }, [selectedSpecies, observationSummaries, isSurvivalRateCalculationEnabled, LIVE_DEAD_LABELS]);

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
        disabled={!allSpecies || allSpecies.length === 0 || (isSurvivalRateCalculationEnabled && allSpeciesNoValues)}
        placeholder={strings.SELECT}
      />
      {(showChart || isSurvivalRateCalculationEnabled) && (
        <Box>
          <PieChart
            chartId='liveDeadplantsBySpecies'
            chartData={{
              labels: isSurvivalRateCalculationEnabled ? LIVE_DEAD_LABELS : labels ?? [],
              datasets: [
                {
                  values: values ?? [],
                },
              ],
            }}
            maxWidth='100%'
            elementColor={['#99B85F', '#CE9E97']}
            customTooltipLabel={isSurvivalRateCalculationEnabled ? tooltipRenderer : undefined}
            pluginsOptions={{
              emptyDoughnut: {
                color: theme.palette.TwClrBaseGray050,
              },
              legend: isSurvivalRateCalculationEnabled
                ? {
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
                  }
                : undefined,
            }}
          />
        </Box>
      )}
    </Box>
  );
}
