import React, { useCallback, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import EventLog from 'src/scenes/ObservationsRouterV2/SingleView/EventLog';
import { isMonitoringPlotObserved } from 'src/utils/observation';

import EditNotesModal from './EditNotesModal';
import QuadratComponent from './QuadratComponent';
import QuadratSpeciesEditableTable from './QuadratSpeciesEditableTable';
import useBiomassPlot from './useBiomassPlot';

const InvasiveAndThreatenedSpeciesTab = () => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const { biomassMeasurement, monitoringPlot, observationId } = useBiomassPlot();
  const additionalSpecies = biomassMeasurement?.additionalSpecies;
  const isObserved = isMonitoringPlotObserved(monitoringPlot);

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
        {isObserved && (
          <Button
            id='edit'
            label={strings.EDIT_NOTES}
            onClick={onEditNotes}
            icon='iconEdit'
            priority='secondary'
            size='small'
          />
        )}
      </Box>
      <QuadratComponent position='SouthwestCorner' />
      <QuadratComponent position='NorthwestCorner' />
      <QuadratComponent position='NortheastCorner' />
      <QuadratComponent position='SoutheastCorner' />
      <Box>
        <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt} paddingBottom={2}>
          {strings.ADDITIONAL_INVASIVE_THREATENED_SPECIES}
        </Typography>
        <QuadratSpeciesEditableTable editable={isObserved} species={additionalSpecies} />
      </Box>
      {monitoringPlot?.monitoringPlotId && (
        <EventLog observationId={Number(observationId)} plotId={monitoringPlot.monitoringPlotId} isBiomass />
      )}
    </Card>
  );
};

export default InvasiveAndThreatenedSpeciesTab;
