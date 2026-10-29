import React, { type JSX, useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { Box, GridLegacy as Grid, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import { useFeatureEnabled } from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useOrganization } from 'src/providers';
import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';

import DeletePlantingSiteModal from '../edit/DeletePlantingSiteModal';
import PlantingSiteDetailsCard from './PlantingSiteDetailsCard';
import PlantingSiteDetailsHeader from './PlantingSiteDetailsHeader';
import PlantingSiteHistoryCard from './PlantingSiteHistoryCard';
import PlantingSiteMapV2 from './PlantingSiteMapV2';

export default function PlantingSiteView(): JSX.Element {
  const theme = useTheme();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const { plantingSite, isLoading } = usePlantingSite(plantingSiteId);
  const { selectedOrganization } = useOrganization();
  const { goToPlantingSiteEdit } = useNavigateTo();
  const isEditPlantingSiteEnabled = useFeatureEnabled('Edit Planting Site');

  const openModal = useCallback(() => setDeleteModalOpen(true), []);
  const closeModal = useCallback(() => setDeleteModalOpen(false), []);
  const onEditBoundary = useCallback(
    () => goToPlantingSiteEdit(plantingSiteId),
    [goToPlantingSiteEdit, plantingSiteId]
  );

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
          <PlantingSiteDetailsCard key={plantingSite.id} plantingSite={plantingSite} />
        </Box>
        {plantingSite.boundary && (
          <Card
            flushMobile
            radius={theme.spacing(1)}
            rightComponent={
              isEditPlantingSiteEnabled && isAdmin(selectedOrganization) && plantingSite.strata?.length ? (
                <Button
                  icon='iconEdit'
                  id='edit-site-boundary'
                  label={strings.EDIT_SITE_BOUNDARY}
                  onClick={onEditBoundary}
                  priority='secondary'
                  size='medium'
                  type='passive'
                />
              ) : undefined
            }
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
        {isEditPlantingSiteEnabled && <PlantingSiteHistoryCard plantingSiteId={plantingSite.id} />}
      </Box>
    </>
  );
}
