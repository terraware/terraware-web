import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import EventLog from 'src/scenes/ObservationsRouter/common/EventLog';

import EditNotesModal from './EditNotesModal';
import QuadratComponent from './QuadratComponent';

const InvasiveAndThreatenedSpeciesTab = () => {
  const theme = useTheme();
  const params = useParams<{ observationId: string }>();
  const { strings } = useLocalization();

  const observationId = Number(params.observationId);
  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const monitoringPlot = useMemo(() => results?.adHocPlot, [results?.adHocPlot]);

  const [editNotesModalOpen, setEditNotesModalOpen] = useState(false);

  const onEditNotes = useCallback(() => {
    setEditNotesModalOpen(true);
  }, []);

  const onCloseEditNotesModal = useCallback(() => {
    setEditNotesModalOpen(false);
  }, []);

  return (
    <Card radius='24px'>
      {editNotesModalOpen && <EditNotesModal onClose={onCloseEditNotesModal} />}
      <Box display='flex' alignItems={'center'} justifyContent={'space-between'} marginBottom={3}>
        <Box display='flex' alignItems={'center'}>
          <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} size='medium' />
          <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingLeft={1}>
            {strings.INVASIVE_AND_THREATENED_SPECIES_INSTRUCTIONS}
          </Typography>
        </Box>
        <Button
          id='edit'
          label={strings.EDIT_NOTES}
          onClick={onEditNotes}
          icon='iconEdit'
          priority='secondary'
          size='small'
        />
      </Box>
      <QuadratComponent position='SouthwestCorner' />
      <QuadratComponent position='NorthwestCorner' />
      <QuadratComponent position='NortheastCorner' />
      <QuadratComponent position='SoutheastCorner' />
      {monitoringPlot?.monitoringPlotId && (
        <EventLog observationId={Number(observationId)} plotId={monitoringPlot.monitoringPlotId} isBiomass />
      )}
    </Card>
  );
};

export default InvasiveAndThreatenedSpeciesTab;
