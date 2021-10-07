import Chart from 'chart.js/auto';
import React from 'react';
import { useRecoilValue } from 'recoil';
import speciesForChartSelector from 'src/state/selectors/plants/speciesForChart';
import strings from 'src/strings';

interface Props {
  isFullscreen: boolean;
}

export default function SpeciesChart({ isFullscreen }: Props): JSX.Element {
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const speciesForChart = useRecoilValue(speciesForChartSelector);
  const currentChartRef = React.useRef();

  React.useEffect(() => {
    const speciesForChartArray = Object.values(speciesForChart);
    const names: string[] = [];
    const numberOfTrees: number[] = [];
    const colors: string[] = [];

    speciesForChartArray.forEach((species) => {
      names.push(species.speciesName.name);
      numberOfTrees.push(species.numberOfTrees);
      colors.push(species.color);
    });

    const ctx = chartRef?.current?.getContext('2d');
    if (currentChartRef.current) {
      const oldChart = currentChartRef.current as Chart;
      oldChart.destroy();
      currentChartRef.current = undefined;
    }
    if (ctx) {
      ctx.canvas.height = isFullscreen ? 70 : 200;
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
  }, [isFullscreen, speciesForChart]);

  return <canvas id='speciesChart' ref={chartRef} width='400' height='400' />;
}
