import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { useGetOneObservationResults } from 'src/hooks/observations';
import { useLocalization } from 'src/providers';
import EventLog from 'src/scenes/ObservationsRouterV2/SingleView/EventLog';

import TreesAndShrubsEditableTable from './TreesAndShrubsEditableTable';

const WoodySpeciesTab = () => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const monitoringPlot = useMemo(() => results?.adHocPlot, [results?.adHocPlot]);

  return (
    <Card radius='24px'>
      <Typography fontSize={'20px'} fontWeight={600}>
        {strings.WOODY_SPECIES}
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
