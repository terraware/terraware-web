import React, { useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useKnowledgeBaseLinks } from 'src/knowledgeBaseLinks';
import { useLocalization } from 'src/providers';
import { useLazyGetAllT0SiteDataSetQuery } from 'src/queries/generated/t0';

type SurvivalRateMessageProps = {
  selectedPlantingSiteId: number | undefined;
};

const SurvivalRateMessageV2 = ({ selectedPlantingSiteId }: SurvivalRateMessageProps) => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const knowledgeBaseLinks = useKnowledgeBaseLinks();

  const [getT0SiteDataSet, getT0SiteDataSetResponse] = useLazyGetAllT0SiteDataSetQuery();
  const survivalRateSet = useMemo(() => getT0SiteDataSetResponse.data?.allSet, [getT0SiteDataSetResponse.data?.allSet]);
  useEffect(() => {
    if (selectedPlantingSiteId) {
      void getT0SiteDataSet(selectedPlantingSiteId, true);
    }
  }, [getT0SiteDataSet, selectedPlantingSiteId]);

  if (!selectedPlantingSiteId || survivalRateSet) {
    return undefined;
  }

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
                to={APP_PATHS.SURVIVAL_RATE_SETTINGS_V2.replace(':plantingSiteId', selectedPlantingSiteId.toString())}
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

export default SurvivalRateMessageV2;
