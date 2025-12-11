import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useKnowledgeBaseLinks } from 'src/knowledgeBaseLinks';
import strings from 'src/strings';

import Link from '../common/Link';

type SurvivalRateMessageProps = {
  selectedPlantingSiteId: number;
};

const SurvivalRateMessage = ({ selectedPlantingSiteId }: SurvivalRateMessageProps) => {
  const theme = useTheme();
  const knowledgeBaseLinks = useKnowledgeBaseLinks();
  return (
    <Box marginBottom={theme.spacing(4)} width={'100%'}>
      <Message
        title={strings.SURVIVAL_RATES_UNAVAILABLE_TITLE}
        body={
          <Typography>
            {strings.formatString(
              strings.SURVIVAL_RATES_UNAVAILABLE_BODY,
              <Link
                fontSize={'16px'}
                to={APP_PATHS.SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', selectedPlantingSiteId.toString())}
              >
                {strings.SURVIVAL_RATE_SETTINGS}
              </Link>,
              <Link to={knowledgeBaseLinks['/observations.*/survival-rate-settings']} fontSize={'16px'} target='_blank'>
                {strings.KNOWLEDGE_BASE}
              </Link>
            )}
          </Typography>
        }
        priority='info'
        type='page'
      />
    </Box>
  );
};

export default SurvivalRateMessage;
