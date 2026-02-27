import React, { type JSX, useCallback } from 'react';

import { Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import TextWithLink from 'src/components/common/TextWithLink';
import { useDocLinks } from 'src/docLinks';
import strings from 'src/strings';

export interface SmallSiteWarningDialogProps {
  onSave: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function SmallSiteWarningDialog(props: SmallSiteWarningDialogProps): JSX.Element | null {
  const docLinks = useDocLinks();
  const { onSave, open, setOpen } = props;

  const onClose = useCallback(() => setOpen(false), [setOpen]);

  if (!open) {
    return null;
  }

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.SCHEDULE_OBSERVATION}
      size='medium'
      middleButtons={[
        <Button
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          key='button-1'
        />,
        <Button label={strings.SAVE} type='destructive' onClick={onSave} size='medium' key='button-2' />,
      ]}
      skrim={true}
    >
      <Typography>{strings.OBSERVATION_SMALL_SITE_WARNING}</Typography>
      <TextWithLink href={docLinks.ad_hoc_plots} isExternal text={strings.LEARN_MORE} />
    </DialogBox>
  );
}
