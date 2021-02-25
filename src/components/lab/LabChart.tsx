import { createStyles, makeStyles } from '@material-ui/core';
import blue from '@material-ui/core/colors/blue';
import Chart from 'chart.js';
import React from 'react';
import { Germination } from '../../api/types/tests';
import {
  descendingComparator,
  getComparator,
  Order,
  stableSort,
} from '../common/table/sort';
import { EnhancedTableDetailsRow } from '../common/table/types';

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

export default function LabChart<T>({
  row,
  rowName,
  defaultSort,
}: Props): JSX.Element {
  const classes = useStyles();
  const [order] = React.useState<Order>('asc');
  const [orderBy] = React.useState(defaultSort);
  const chartRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const ctx = chartRef?.current?.getContext('2d');
    if (ctx) {
      const data = barData;
      new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',
        data: {
          labels: data().map((entry) => entry.recordingDate),
          datasets: [
            {
              backgroundColor: blue[700],
              data: data().map((entry) => entry.seedsGerminated),
              barThickness: 30,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 50,
              right: 50,
            },
          },
          legend: {
            display: false,
          },
          scales: {
            xAxes: [
              {
                gridLines: {
                  display: false,
                },
              },
            ],
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

  return (
    <canvas id='myChart' ref={chartRef} className={classes.chart}></canvas>
  );
}
