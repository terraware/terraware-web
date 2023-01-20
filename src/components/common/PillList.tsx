import React from 'react';
import Pill from './Pill';
import { Box } from '@mui/material';

export type PillListItem<IdType> = {
  id: IdType;
  label: string;
  value: string;
  onRemove?: (id: IdType) => void;
};

type PillListProps<IdType> = {
  data: PillListItem<IdType>[];
  onRemove?: (id: IdType) => void;
};

export default function PillList<IdType>(props: PillListProps<IdType>): JSX.Element {
  const { data, onRemove } = props;

  return (
    <Box display='flex' flexWrap='wrap'>
      {data.map((item, index) => (
        <Pill key={index} id={item.id} label={item.label} value={item.value} onRemove={item.onRemove || onRemove} />
      ))}
    </Box>
  );
}
