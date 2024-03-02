import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Typography } from '@mui/material';
import { BusySpinner, Button, DialogBox } from '@terraware/web-components';

import TextWithLink from 'src/components/common/TextWithLink';
import { APP_PATHS } from 'src/constants';
import { useDocLinks } from 'src/docLinks';
import { selectPlantingsForSite } from 'src/redux/features/plantings/plantingsSelectors';
import { useAppSelector } from 'src/redux/store';
import { TrackingService } from 'src/services';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';

export type DeletePlantingSiteModalProps = {
  plantingSite: PlantingSite;
  onClose: () => void;
};

export default function DeletePlantingSiteModal(props: DeletePlantingSiteModalProps): JSX.Element {
  const { onClose, plantingSite } = props;
  const [busy, setBusy] = useState<boolean>(false);
  const history = useHistory();
  const snackbar = useSnackbar();
  const docLinks = useDocLinks();
  const hasPlantings = useAppSelector((state) => selectPlantingsForSite(state, plantingSite.id)).length > 0;

  const deleteHandler = async () => {
    setBusy(true);
    const response = await TrackingService.deletePlantingSite(plantingSite.id);
    setBusy(false);
    if (response.requestSucceeded) {
      snackbar.toastSuccess(strings.PLANTING_SITE_DELETED);
      history.push(APP_PATHS.PLANTING_SITES);
    } else {
      snackbar.toastError();
    }
  };

  return (
    <>
      {busy && <BusySpinner withSkrim={true} />}
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
            disabled={hasPlantings}
          />,
        ]}
        message={strings.formatString(
          hasPlantings ? strings.DELETE_PLANTING_SITE_IN_USE_MESSAGE : strings.DELETE_PLANTING_SITE_MESSAGE,
          plantingSite.name
        )}
        skrim={true}
      >
        <Typography sx={{ paddingTop: 3 }}>
          {hasPlantings ? (
            <TextWithLink href={docLinks.contact_us} text={strings.DELETE_PLANTING_SITE_CONTACT_US} />
          ) : (
            strings.ARE_YOU_SURE
          )}
        </Typography>
      </DialogBox>
    </>
  );
}
