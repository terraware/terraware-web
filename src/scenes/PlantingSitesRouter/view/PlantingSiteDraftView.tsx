import React, { type JSX, useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner, Message } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization, useUser } from 'src/providers';
import { useUpdateDraftPlantingSiteMutation } from 'src/queries/generated/draftPlantingSites';
import DeleteDraftPlantingSiteModal from 'src/scenes/PlantingSitesRouter/edit/DeleteDraftPlantingSiteModal';
import DraftSiteDetailsModal from 'src/scenes/PlantingSitesRouter/edit/DraftSiteDetailsModal';
import useDraftPlantingSite from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteGet';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { fromDraft } from 'src/utils/draftPlantingSiteUtils';
import { isAdmin } from 'src/utils/organization';
import useSnackbar from 'src/utils/useSnackbar';

import DraftPlantingSiteBoundaryCard from './DraftPlantingSiteBoundaryCard';
import DraftPlantingSiteDetailsCard from './DraftPlantingSiteDetailsCard';
import DraftPlantingSiteHeader from './DraftPlantingSiteHeader';

export default function PlantingSiteDraftView(): JSX.Element {
  const theme = useTheme();
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const { site: plantingSite } = useDraftPlantingSite({ draftId: Number(plantingSiteId) });
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [updateDraftPlantingSite, { isLoading: isUpdating }] = useUpdateDraftPlantingSiteMutation();

  const editDisabled = !user || plantingSite?.createdBy !== user.id;
  const canEditDetails = isAdmin(selectedOrganization) && !editDisabled;

  const goToEditDraftPlantingSite = useCallback(() => {
    if (plantingSiteId) {
      navigate({ pathname: APP_PATHS.PLANTING_SITES_DRAFT_EDIT.replace(':plantingSiteId', plantingSiteId) });
    }
  }, [plantingSiteId, navigate]);

  const openDeleteModal = useCallback(() => setDeleteModalOpen(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalOpen(false), []);
  const openDetailsModal = useCallback(() => setDetailsModalOpen(true), []);
  const closeDetailsModal = useCallback(() => setDetailsModalOpen(false), []);

  const saveDetails = useCallback(
    async (draft: DraftPlantingSite): Promise<boolean> => {
      try {
        await updateDraftPlantingSite({
          id: draft.id,
          updateDraftPlantingSiteRequestPayload: fromDraft(draft),
        }).unwrap();
        snackbar.toastSuccess(strings.PLANTING_SITE_SAVED);
        return true;
      } catch {
        snackbar.toastError(strings.GENERIC_ERROR);
        return false;
      }
    },
    [snackbar, updateDraftPlantingSite]
  );

  const saveDetailsAndClose = useCallback(
    (draft: DraftPlantingSite) => {
      void saveDetails(draft).then((saved) => saved && setDetailsModalOpen(false));
    },
    [saveDetails]
  );

  const saveDetailsAndContinue = useCallback(
    (draft: DraftPlantingSite) => {
      void saveDetails(draft).then((saved) => saved && goToEditDraftPlantingSite());
    },
    [goToEditDraftPlantingSite, saveDetails]
  );

  if (!plantingSite) {
    return <BusySpinner withSkrim={true} />;
  }

  return (
    <TfMain>
      {deleteModalOpen && <DeleteDraftPlantingSiteModal plantingSite={plantingSite} onClose={closeDeleteModal} />}
      {detailsModalOpen && (
        <DraftSiteDetailsModal
          busy={isUpdating}
          onClose={closeDetailsModal}
          onSave={saveDetailsAndContinue}
          onSaveAndClose={saveDetailsAndClose}
          saveLabel={strings.SAVE_AND_CONTINUE}
          site={plantingSite}
          title={strings.EDIT_DETAILS}
        />
      )}
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
        <Message body={strings.DRAFT_SITE_BOUNDARY_IN_PROGRESS_MESSAGE} priority='warning' type='page' />
        <DraftPlantingSiteDetailsCard
          onEdit={canEditDetails ? openDetailsModal : undefined}
          plantingSite={plantingSite}
        />
        <DraftPlantingSiteBoundaryCard plantingSite={plantingSite} />
      </Box>
    </TfMain>
  );
}
