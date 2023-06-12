import { useMemo } from 'react';
import { ObservationSpeciesResults } from 'src/types/Observations';
import BarChart from 'src/components/common/Chart/BarChart';

export type SpeciesTotalPlantsChartProps = {
  species?: ObservationSpeciesResults[];
};

export default function SpeciesTotalPlantsChart({ species }: SpeciesTotalPlantsChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };

  const mortalityRates = useMemo((): Data => {
    const data: Data = { labels: [], values: [] };

    species?.forEach((specie) => {
      const { speciesCommonName, speciesName, speciesScientificName, mortalityRate } = specie;

      if (mortalityRate !== undefined) {
        const label: string = speciesName ?? speciesCommonName ?? speciesScientificName;
        const value: number = mortalityRate;
        data.labels.push(label);
        data.values.push(value);
      }
    });

    return data;
  }, [species]);

  return (
    <BarChart
      chartId='observationsTotalPlantsBySpecies'
      chartLabels={mortalityRates.labels}
      chartValues={mortalityRates.values}
      barWidth={0}
      minHeight='170px'
    />
  );
}
