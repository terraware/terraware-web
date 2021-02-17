import blue from '@material-ui/core/colors/blue';
import React from 'react';
import { Bar, BarChart, XAxis } from 'recharts';
import { Germination } from '../../api/types/tests';
import {
  descendingComparator,
  getComparator,
  Order,
  stableSort,
} from '../common/table/sort';
import { EnhancedTableDetailsRow } from '../common/table/types';

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
  const [order] = React.useState<Order>('asc');
  const [orderBy] = React.useState(defaultSort);

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
    <BarChart
      width={500}
      height={200}
      data={barData()}
      margin={{
        top: 5,
        right: 20,
        left: 10,
        bottom: 5,
      }}
    >
      <XAxis dataKey='recordingDate' />
      <Bar
        dataKey='seedsGerminated'
        stackId='a'
        fill={blue[700]}
        barSize={20}
      />
    </BarChart>
  );
}
