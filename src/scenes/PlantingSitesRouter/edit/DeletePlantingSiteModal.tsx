import React, { type JSX, useCallback, useEffect, useMemo } from 'react';

import { Typography } from '@mui/material';
import { BusySpinner, Button, DialogBox } from '@terraware/web-components';

import TextWithLink from 'src/components/common/TextWithLink';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useDeletePlantingSiteMutation, useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { useSearchPlantingsForSiteQuery } from 'src/queries/search/plantings';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export type DeletePlantingSiteModalProps = {
  plantingSiteId: number;
  onClose: () => void;
};

export default function DeletePlantingSiteModal(props: DeletePlantingSiteModalProps): JSX.Element {
  const { onClose, plantingSiteId } = props;
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const { data: plantingSiteData } = useGetPlantingSiteQuery(plantingSiteId);
  const [deleteSite, deleteResult] = useDeletePlantingSiteMutation();
  const { data: plantings } = useSearchPlantingsForSiteQuery(plantingSiteId);

  const hasPlantings = useMemo(() => {
    return plantings && plantings?.length > 0;
  }, [plantings]);

  const deleteHandler = useCallback(() => {
    void deleteSite(plantingSiteId);
  }, [deleteSite, plantingSiteId]);

  useEffect(() => {
    if (deleteResult.isSuccess) {
      snackbar.toastSuccess(strings.PLANTING_SITE_DELETED);
      navigate(APP_PATHS.PLANTING_SITES);
    } else if (deleteResult.isError) {
      snackbar.toastError();
    }
  }, [deleteResult, navigate, snackbar]);

  return (
    <>
      {deleteResult.isLoading && <BusySpinner withSkrim={true} />}
      <DialogBox
        onClose={onClose}
        open={true}
        title={strings.DELETE_PLANTING_SITE}
        size='medium'
        middleButtons={[
          <Button
            id='cancelDeletePlantingSite'
            label={strings.CANCEL}
            type='passive'
            onClick={onClose}
            priority='secondary'
            key='button-1'
          />,
          <Button
            id='saveDeletePlantingSite'
            onClick={deleteHandler}
            type='destructive'
            label={strings.DELETE}
            key='button-2'
            disabled={hasPlantings || deleteResult.isLoading}
          />,
        ]}
        message={strings.formatString(
          hasPlantings ? strings.DELETE_PLANTING_SITE_IN_USE_MESSAGE : strings.DELETE_PLANTING_SITE_MESSAGE,
          plantingSiteData?.site.name ?? ''
        )}
        skrim={true}
      >
        <Typography sx={{ paddingTop: 3 }}>
          {hasPlantings ? (
            <TextWithLink href={APP_PATHS.HELP_SUPPORT} text={strings.DELETE_PLANTING_SITE_CONTACT_US} />
          ) : (
            strings.ARE_YOU_SURE
          )}
        </Typography>
      </DialogBox>
    </>
  );
}
