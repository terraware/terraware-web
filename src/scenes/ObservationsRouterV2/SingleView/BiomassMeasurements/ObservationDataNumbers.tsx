import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

import PendingSurvivalRate from 'src/components/SurvivalRate/PendingSurvivalRate';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { useLocalization } from 'src/providers';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type ObservationDataNumbersProps = {
  items: { label: string; pending?: boolean; tooltip: string; value?: string | number }[];
  isCompleted: boolean;
};

const ObservationDataNumbers = ({ items, isCompleted }: ObservationDataNumbersProps) => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const columns = isMobile ? Math.min(items.length, 2) : items.length;
  return (
    <Box display='grid' paddingBottom={3} gridTemplateColumns={`repeat(${columns}, minmax(0, 1fr))`} gap={2}>
      {items.map((item, index) => {
        const isTemporaryOrAdHocSurvivalRateItem =
          item.label === strings.SURVIVAL_RATE &&
          (item.value === strings.NOT_CALCULATED_FOR_TEMPORARY_PLOTS ||
            item.value === strings.NOT_APPLICABLE_FOR_AD_HOC_PLOTS);
        return (
          <Box
            key={index}
            borderLeft={index % columns !== 0 ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : 'none'}
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
              <Typography
                fontWeight={isTemporaryOrAdHocSurvivalRateItem ? 400 : 600}
                fontSize={isTemporaryOrAdHocSurvivalRateItem ? '16px' : '24px'}
              >
                {isCompleted || isTemporaryOrAdHocSurvivalRateItem ? (
                  <PendingSurvivalRate pending={item.pending}>
                    {typeof item.value === 'number' ? <FormattedNumber value={item.value} /> : item.value}
                  </PendingSurvivalRate>
                ) : (
                  '-'
                )}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ObservationDataNumbers;
