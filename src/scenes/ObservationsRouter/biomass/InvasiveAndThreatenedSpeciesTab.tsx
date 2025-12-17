import React, { useCallback, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import QuadratComponent from 'src/scenes/ObservationsRouter/biomass/QuadratComponent';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

import EditNotesModal from './EditNotesModal';

type InvasiveAndThreatenedSpeciesTabProps = {
  monitoringPlot: ObservationMonitoringPlotResultsPayload | undefined;
  observationId: number;
  reload: () => void;
};

const InvasiveAndThreatenedSpeciesTab = ({
  monitoringPlot,
  observationId,
  reload,
}: InvasiveAndThreatenedSpeciesTabProps) => {
  const theme = useTheme();
  const [editNotesModalOpen, setEditNotesModalOpen] = useState(false);

  const onEditNotes = useCallback(() => {
    setEditNotesModalOpen(true);
  }, []);

  const onCloseEditNotesModal = useCallback(() => {
    setEditNotesModalOpen(false);
  }, []);

  return (
    <Card radius='24px'>
      {editNotesModalOpen && (
        <EditNotesModal
          onClose={onCloseEditNotesModal}
          observationId={observationId}
          monitoringPlotId={monitoringPlot?.monitoringPlotId}
          reload={reload}
        />
      )}
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
      <QuadratComponent quadrat='Northwest' monitoringPlot={monitoringPlot} reload={reload} />
      <QuadratComponent quadrat='Northeast' monitoringPlot={monitoringPlot} reload={reload} />
      <QuadratComponent quadrat='Southwest' monitoringPlot={monitoringPlot} reload={reload} />
      <QuadratComponent quadrat='Southeast' monitoringPlot={monitoringPlot} reload={reload} />
    </Card>
  );
};

export default InvasiveAndThreatenedSpeciesTab;
