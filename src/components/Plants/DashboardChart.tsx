import React from 'react';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material';
import { generateTerrawareRandomColors } from 'src/utils/generateRandomColor';
import { BarElement, Chart } from 'chart.js';

const useStyles = makeStyles(() => ({
  chart: {
    height: '180px',
  },
}));

export interface DashboardChartProps {
  chartId: string;
  chartLabels?: string[];
  chartValues?: number[];
}

BarElement.prototype.inRange = function (chartX: number, chartY: number) {
  const width = this.getProps(['width']).width;
  const base = this.getProps(['base']).base;

  return chartX >= this.x - width / 2 && chartX <= this.x + width / 2 && chartY >= this.y && chartY <= base + 5;
};

export default function DashboardChart(props: DashboardChartProps): JSX.Element {
  const { chartId, chartLabels, chartValues } = props;
  const classes = useStyles();
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  React.useEffect(() => {
    const ctx = chartRef?.current?.getContext('2d');
    if (ctx) {
      const colors = generateTerrawareRandomColors(theme, chartLabels?.length || 0);
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [
            {
              data: chartValues,
              barThickness: 50, // number (pixels) or 'flex'
              backgroundColor: colors,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 10,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              displayColors: false,
            },
          },
          scales: {
            y: {
              ticks: {
                precision: 0,
              },
            },
          },
        },
      });
      // when component unmounts
      return () => {
        myChart.destroy();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartLabels, chartValues]);

  return <canvas id={chartId} ref={chartRef} className={classes.chart} />;
}
