import React from 'react';
import Pill from './Pill';
import { Box } from '@mui/material';

export type PillListItem<IdType> = {
  pillId: IdType;
  label: string;
  value: string;
  onRemovePill?: (pillId: IdType) => void;
};

type PillListProps<IdType> = {
  pillData: PillListItem<IdType>[];
  onRemovePillFromList?: (pillId: IdType) => void;
};

export default function PillList<IdType>(props: PillListProps<IdType>): JSX.Element {
  const { pillData, onRemovePillFromList } = props;

  return (
    <Box display='flex' flexWrap='wrap'>
      {pillData.map((data) => (
        <Pill
          key={String(data.pillId)}
          id={data.pillId}
          label={data.label}
          value={data.value}
          onRemovePill={data.onRemovePill || onRemovePillFromList}
        />
      ))}
    </Box>
  );
}
