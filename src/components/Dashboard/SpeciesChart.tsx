import Chart from 'chart.js/auto';
import React from 'react';
import * as speciesData from '../../data/species.json';

interface Props {
  isFullscreen: boolean;
}

export default function SpeciesChart({ isFullscreen }: Props): JSX.Element {
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = React.useState();

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
            labels: speciesData.features.map((entry) => entry.properties.NAME),
            datasets: [
              {
                label: '# of Trees',
                data: speciesData.features.map(
                  (entry) => entry.properties.NUMBER_OF_TREES
                ),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
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
          },
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  return <canvas id='myChart' ref={chartRef} width='400' height='400' />;
}
