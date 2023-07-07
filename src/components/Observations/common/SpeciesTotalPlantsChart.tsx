import { useMemo } from 'react';
import { ObservationSpeciesResults } from 'src/types/Observations';
import BarChart from 'src/components/common/Chart/BarChart';

export type SpeciesTotalPlantsChartProps = {
  minHeight?: string;
  species?: ObservationSpeciesResults[];
};

export default function SpeciesTotalPlantsChart({ minHeight, species }: SpeciesTotalPlantsChartProps): JSX.Element {
  type Data = {
    labels: string[];
    values: number[];
  };

  const totals = useMemo((): Data => {
    const data: Data = { labels: [], values: [] };

    species?.forEach((speciesData) => {
      const { speciesCommonName, speciesName, speciesScientificName, totalPlants } = speciesData;

      const label: string = speciesName ?? speciesCommonName ?? speciesScientificName;

      data.labels.push(label);
      data.values.push(totalPlants);
    });

    return data;
  }, [species]);

  return (
    <BarChart
      chartId='observationsTotalPlantsBySpecies'
      chartData={{
        labels: totals.labels,
        datasets: [
          {
            values: totals.values,
          },
        ],
      }}
      barWidth={0}
      minHeight={minHeight}
    />
  );
}
