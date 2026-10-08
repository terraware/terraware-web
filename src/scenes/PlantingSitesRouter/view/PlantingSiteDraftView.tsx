import React, { type JSX, useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner, Message } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useUser } from 'src/providers';
import DeleteDraftPlantingSiteModal from 'src/scenes/PlantingSitesRouter/edit/DeleteDraftPlantingSiteModal';
import useDraftPlantingSite from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteGet';
import strings from 'src/strings';

import DraftPlantingSiteBoundaryCard from './DraftPlantingSiteBoundaryCard';
import DraftPlantingSiteDetailsCard from './DraftPlantingSiteDetailsCard';
import DraftPlantingSiteHeader from './DraftPlantingSiteHeader';

export default function PlantingSiteDraftView(): JSX.Element {
  const theme = useTheme();
  const { user } = useUser();
  const navigate = useSyncNavigate();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const { site: plantingSite } = useDraftPlantingSite({ draftId: Number(plantingSiteId) });
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  const editDisabled = !user || plantingSite?.createdBy !== user.id;

  const goToEditDraftPlantingSite = useCallback(() => {
    if (plantingSiteId) {
      navigate({ pathname: APP_PATHS.PLANTING_SITES_DRAFT_EDIT.replace(':plantingSiteId', plantingSiteId) });
    }
  }, [plantingSiteId, navigate]);

  const openDeleteModal = useCallback(() => setDeleteModalOpen(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalOpen(false), []);

  if (!plantingSite) {
    return <BusySpinner withSkrim={true} />;
  }

  return (
    <TfMain>
      {deleteModalOpen && <DeleteDraftPlantingSiteModal plantingSite={plantingSite} onClose={closeDeleteModal} />}
      <DraftPlantingSiteHeader
        editDisabled={editDisabled}
        onDelete={openDeleteModal}
        onEdit={goToEditDraftPlantingSite}
        plantingSite={plantingSite}
      />
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      <Box display='flex' flexDirection='column' gap={theme.spacing(2.5)} marginTop={theme.spacing(3)}>
        <Message
          body={
            plantingSite.boundary
              ? strings.DRAFT_SITE_BOUNDARY_IN_PROGRESS_MESSAGE
              : strings.DRAFT_SITE_BOUNDARY_NOT_STARTED_MESSAGE
          }
          priority='warning'
          type='page'
        />
        <DraftPlantingSiteDetailsCard plantingSite={plantingSite} />
        <DraftPlantingSiteBoundaryCard plantingSite={plantingSite} />
      </Box>
    </TfMain>
  );
}
