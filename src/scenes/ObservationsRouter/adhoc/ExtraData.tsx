import React from 'react';

import { Box } from '@mui/material';
import { Textfield } from '@terraware/web-components';

type ExtraDataProps = {
  items: { label: string; value?: string | number }[];
};
const ExtraData = ({ items }: ExtraDataProps) => {
  return (
    <Box display='grid' gap={2} gridTemplateColumns='repeat(3, 1fr)' justifyItems='start'>
      {items.map((item, index) => (
        <Box key={index}>
          <Textfield
            id={`extra-data-${index}`}
            label={item.label}
            value={item.value}
            preserveNewlines={true}
            type='text'
            display={true}
          />
        </Box>
      ))}
    </Box>
  );
};

export default ExtraData;
