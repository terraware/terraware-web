import strings from 'src/strings';
import React from 'react';
import { Typography } from '@mui/material';
import { TERRAWARE_SUPPORT_LINK } from 'src/constants';
import parseHtml from 'html-react-parser';
import { Button, DialogBox } from '@terraware/web-components';

export type PlantingSiteWithMapHelpModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function PlantingSiteWithMapHelpModal(props: PlantingSiteWithMapHelpModalProps): JSX.Element {
  const { open, onClose } = props;

  return (
    <DialogBox
      scrolled
      onClose={onClose}
      open={open}
      title={strings.SELECT_PLANTING_SITE_TYPE}
      size={'medium'}
      middleButtons={[<Button onClick={onClose} id='done' label={strings.DONE} key='button-1' />]}
    >
      <Typography>
        {parseHtml(
          strings.formatString(
            strings.PLANTING_SITE_WITH_MAP_HELP,
            `<a href=${TERRAWARE_SUPPORT_LINK}>` + strings.CONTACT_US.toLowerCase() + '</a>'
          ) as string
        )}
      </Typography>
    </DialogBox>
  );
}
