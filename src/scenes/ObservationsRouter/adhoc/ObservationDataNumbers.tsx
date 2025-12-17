import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

type ObservationDataNumbersProps = {
  items: { label: string; tooltip: string; value?: string | number }[];
  isCompleted: boolean;
};

const ObservationDataNumbers = ({ items, isCompleted }: ObservationDataNumbersProps) => {
  const theme = useTheme();
  return (
    <Box display='grid' paddingBottom={3} gridTemplateColumns={`repeat(${items.length}, 1fr)`} gap={2}>
      {items.map((item, index) => {
        return (
          <Box
            key={index}
            borderLeft={index !== 0 ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : 'none'}
            paddingLeft={2}
            paddingBottom={2}
          >
            <Box display='flex'>
              <Typography fontWeight={600} paddingRight={0.5}>
                {item.label}
              </Typography>
              <Tooltip title={item.tooltip}>
                <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} />
              </Tooltip>
            </Box>
            <Box>
              <Typography fontWeight={600} fontSize={'24px'}>
                {isCompleted ? item.value : ''}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ObservationDataNumbers;
