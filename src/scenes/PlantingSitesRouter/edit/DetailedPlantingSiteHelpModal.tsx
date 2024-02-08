import strings from 'src/strings';
import React from 'react';
import { Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';
import TextWithLink from 'src/components/common/TextWithLink';
import { useDocLinks } from 'src/docLinks';

export type DetailedPlantingSiteHelpModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function DetailedPlantingSiteHelpModal(props: DetailedPlantingSiteHelpModalProps): JSX.Element {
  const { open, onClose } = props;
  const docLinks = useDocLinks();

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
        <TextWithLink href={docLinks.contact_us} isExternal text={strings.PLANTING_SITE_CREATE_DETAILED_HELP} />
      </Typography>
    </DialogBox>
  );
}
