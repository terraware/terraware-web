import { createStyles, makeStyles, useTheme } from '@material-ui/core';
import Chart from 'chart.js/auto';
import React from 'react';
import { Germination } from 'src/api/types/tests';
import { descendingComparator, getComparator, Order, stableSort } from '../../common/table/sort';
import { EnhancedTableDetailsRow } from '../../common/table/types';

const useStyles = makeStyles(() =>
  createStyles({
    chart: {
      height: '180px',
    },
  })
);

export interface Props {
  row: EnhancedTableDetailsRow;
  rowName: string;
  defaultSort: string;
}

export default function LabChart<T>({ row, rowName, defaultSort }: Props): JSX.Element {
  const classes = useStyles();
  const [order] = React.useState<Order>('asc');
  const [orderBy] = React.useState(defaultSort);
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  React.useEffect(() => {
    const ctx = chartRef?.current?.getContext('2d');
    if (ctx) {
      const data = barData;
      // tslint:disable-next-line:no-unused-expression
      new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
        data: {
          labels: data().map((entry) => entry.recordingDate),
          datasets: [
            {
              backgroundColor: theme.palette.accent[4],
              data: data().map((entry) => entry.seedsGerminated),
              fill: false,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 50,
              right: 50,
              top: 10,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            // @ts-ignore
            xAxes: [
              {
                gridLines: {
                  display: false,
                },
              },
            ],
            // @ts-ignore
            yAxes: [
              {
                display: true,
                gridLines: {
                  lineWidth: 0,
                  zeroLineWidth: 2,
                  zeroLineColor: '#ccc',
                },
                ticks: {
                  beginAtZero: true,
                  display: false,
                },
              },
            ],
          },
          tooltips: {
            enabled: false,
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barData = () => {
    const orderedGerminations: Germination[] = stableSort(
      row[rowName] as T[],
      getComparator(order, orderBy, descendingComparator)
    ) as Germination[];

    let total = 0;

    return orderedGerminations.map((germination) => {
      total += germination.seedsGerminated;

      return {
        seedsGerminated: total,
        recordingDate: germination.recordingDate,
      };
    });
  };

  return <canvas id='myChart' ref={chartRef} className={classes.chart} />;
}
