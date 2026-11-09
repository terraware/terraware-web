import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import EventLog from 'src/scenes/ObservationsRouterV2/SingleView/EventLog';

import TreesAndShrubsEditableTable from './TreesAndShrubsEditableTable';
import useBiomassPlot from './useBiomassPlot';

const WoodySpeciesTab = () => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { monitoringPlot, observationId } = useBiomassPlot();

  return (
    <Card radius='24px'>
      <Typography fontSize={'20px'} fontWeight={600}>
        {strings.TREES_AND_SHRUBS}
      </Typography>
      <Box display='flex' alignItems={'center'} paddingTop={3}>
        <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} size='medium' />
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingLeft={1}>
          {strings.TREES_AND_SHRUBS_TABLE_INSTRUCTIONS}
        </Typography>
      </Box>
      <TreesAndShrubsEditableTable />
      {monitoringPlot?.monitoringPlotId && (
        <EventLog observationId={observationId} plotId={monitoringPlot.monitoringPlotId} isBiomass />
      )}
    </Card>
  );
};

export default WoodySpeciesTab;
