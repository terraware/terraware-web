import Chart from 'chart.js/auto';
import React from 'react';
import strings from 'src/strings';
import { PlantSummaries, PlantSummariesByLayerId, PlantSummary } from 'src/types/Plant';
import { SpeciesById } from 'src/types/Species';

type SpeciesSummaryChartProps = {
  plantSummariesByLayerId: PlantSummariesByLayerId;
  speciesById: SpeciesById;
  colorsBySpeciesId: Record<number, string>;
  isFullscreen: boolean;
};

export default function SpeciesSummaryChart(props: SpeciesSummaryChartProps): JSX.Element {
  const {plantSummariesByLayerId, speciesById, colorsBySpeciesId, isFullscreen} = props;
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const currentChartRef = React.useRef();

  React.useEffect(() => {
    // TODO: remove this logic once we have the updated plant summary APIs
    const plantSummaries: PlantSummaries[] = Array.from(plantSummariesByLayerId.values());
    const thisWeekOrNull: (PlantSummary | null)[] = plantSummaries.map((summary) => summary.thisWeek).flat();
    const thisWeek = thisWeekOrNull.filter((s) => s !== null) as PlantSummary[];
    const countBySpeciesId = new Map();

    thisWeek.forEach((summary) => {
      const current = countBySpeciesId.get(speciesById);
      countBySpeciesId.set(summary.speciesId, current ? current + summary.numPlants : summary.numPlants);
    });

    const names: string[] = [];
    const numberOfTrees: number[] = [];
    const colors: string[] = [];

    countBySpeciesId.forEach((numPlants, speciesId) => {
      names.push(speciesById.get(speciesId)?.name ?? strings.OTHER);
      numberOfTrees.push(numPlants);
      colors.push(colorsBySpeciesId[speciesId]);
    });

    const ctx = chartRef?.current?.getContext('2d');
    if (currentChartRef.current) {
      const oldChart = currentChartRef.current as Chart;
      oldChart.destroy();
      currentChartRef.current = undefined;
    }
    if (ctx) {
      ctx.canvas.height = isFullscreen ? 70 : 200;
      // @ts-ignore
      currentChartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: names,
          datasets: [
            {
              label: strings.N_OF_PLANTS,
              data: numberOfTrees,
              backgroundColor: colors,
              barPercentage: 0.5,
            },
          ],
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: isFullscreen ? strings.SPECIES : strings.NUMBER_OF_PLANTS,
              },
              position: isFullscreen ? 'bottom' : 'top',
              ticks: {
                precision: 0,
              },
            },
            y: {
              title: {
                display: true,
                text: isFullscreen ? strings.NUMBER_OF_PLANTS : strings.SPECIES,
              },
            },
          },
          indexAxis: isFullscreen ? 'x' : 'y',
          // Elements options apply to all of the options unless overridden in a dataset
          // In this case, we are setting the border of each horizontal bar to be 2px wide
          elements: {
            bar: {
              borderWidth: 1,
            },
          },
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          layout: {
            padding: {
              right: 100,
            },
          },
        },
      });
    }
  }, [plantSummariesByLayerId, speciesById, colorsBySpeciesId, isFullscreen]);

  return <canvas id='speciesChart' ref={chartRef} width='400' height='400' />;
}
