import Chart from 'chart.js/auto';
import React from 'react';
import { useRecoilValue } from 'recoil';
import speciesForChartSelector from '../../state/selectors/speciesForChart';

interface Props {
  isFullscreen: boolean;
}

export default function SpeciesChart({ isFullscreen }: Props): JSX.Element {
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = React.useState();
  const speciesForChart = useRecoilValue(speciesForChartSelector);

  const speciesForChartArray = Object.values(speciesForChart);

  const names: string[] = [];
  const numberOfTrees: number[] = [];
  const colors: string[] = [];

  speciesForChartArray.forEach((species) => {
    names.push(species.speciesName.name);
    numberOfTrees.push(species.numberOfTrees);
    colors.push(species.color);
  });

  React.useEffect(() => {
    const ctx = chartRef?.current?.getContext('2d');
    if (chart) {
      const newChart = chart as Chart;
      newChart.destroy();
    }
    if (ctx) {
      ctx.canvas.height = isFullscreen ? 70 : 200;
      setChart(
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: names,
            datasets: [
              {
                label: '# of Trees',
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
                  text: isFullscreen ? 'Species' : 'Number of Trees',
                },
                position: isFullscreen ? 'bottom' : 'top',
              },
              y: {
                title: {
                  display: true,
                  text: isFullscreen ? 'Number of Trees' : 'Species',
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
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  return <canvas id='speciesChart' ref={chartRef} width='400' height='400' />;
}
