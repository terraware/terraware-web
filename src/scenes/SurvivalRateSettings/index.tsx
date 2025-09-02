import React, { useEffect, useState } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectPlantingSiteT0 } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSiteT0 } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlotT0Data } from 'src/types/Tracking';

const SurvivalRateSettings = () => {
  const { plantingSite } = usePlantingSiteData();
  const theme = useTheme();
  const [requestId, setRequestId] = useState('');
  const plantingSiteT0Response = useAppSelector(selectPlantingSiteT0(requestId));
  const dispatch = useAppDispatch();
  const [t0Plots, setT0Plots] = useState<PlotT0Data[]>();

  useEffect(() => {
    if (plantingSite) {
      const request = dispatch(requestPlantingSiteT0(plantingSite.id));
      setRequestId(request.requestId);
    }
  }, [dispatch, plantingSite]);

  useEffect(() => {
    if (plantingSiteT0Response?.status === 'success') {
      setT0Plots(plantingSiteT0Response.data);
    }
  }, [plantingSiteT0Response]);

  return (
    <Page
      title={strings.formatString(strings.SURVIVAL_RATE_SETTINGS_FOR, plantingSite?.name || '')}
      rightComponent={
        <Button icon='iconEdit' label={strings.EDIT_SETTINGS} onClick={() => true} size='medium' id='editSettings' />
      }
    >
      <Card radius='8px'>
        <Box display='flex'>
          <Box paddingRight={theme.spacing(2)}>
            <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} />
          </Box>
          <Typography fontSize={'14px'}>
            {strings.formatString(strings.SURVIVAL_RATE_SETTINGS_INFO, <b>{strings.INSTRUCTIONS}</b>)}
          </Typography>
        </Box>
        <Box paddingY={3}>
          <Typography fontWeight={600}>{strings.formatString(strings.PLOTS_QUANTITY, t0Plots?.length || 0)}</Typography>
        </Box>
        <Divider />
      </Card>
    </Page>
  );
};

export default SurvivalRateSettings;
