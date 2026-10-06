import React, { type JSX, useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import usePlantingSite from 'src/hooks/usePlantingSite';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import strings from 'src/strings';

import DeletePlantingSiteModal from '../edit/DeletePlantingSiteModal';
import PlantingSiteDetailsCard from './PlantingSiteDetailsCard';
import PlantingSiteDetailsHeader from './PlantingSiteDetailsHeader';
import PlantingSiteMapV2 from './PlantingSiteMapV2';

export default function PlantingSiteView(): JSX.Element {
  const theme = useTheme();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const { plantingSite, isLoading } = usePlantingSite(plantingSiteId);

  const openModal = useCallback(() => setDeleteModalOpen(true), []);
  const closeModal = useCallback(() => setDeleteModalOpen(false), []);

  if (isLoading || !plantingSite) {
    return <BusySpinner withSkrim={true} />;
  }

  return (
    <>
      {deleteModalOpen && plantingSite && (
        <DeletePlantingSiteModal plantingSiteId={plantingSite.id} onClose={closeModal} />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <PlantingSiteDetailsHeader onDelete={openModal} plantingSite={plantingSite} />
        <Grid item xs={12}>
          <PageSnackbar />
        </Grid>
        <Box marginTop={theme.spacing(3)}>
          <PlantingSiteDetailsCard plantingSite={plantingSite} />
        </Box>
        {plantingSite.boundary && (
          <Card
            flushMobile
            radius={theme.spacing(2)}
            style={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              marginTop: theme.spacing(2.5),
            }}
            title={strings.SITE_BOUNDARY}
          >
            {plantingSite.strata ? (
              <PlantingSiteMapV2 plantingSiteId={plantingSite.id} />
            ) : (
              <Box display='flex' flexGrow={1}>
                <SimplePlantingSiteMap plantingSiteId={plantingSite.id} />
              </Box>
            )}
          </Card>
        )}
      </Box>
    </>
  );
}
