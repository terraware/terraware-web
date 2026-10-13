import React, { type JSX } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type CloseSetupConfirmationProps = {
  onDiscard: () => void;
  onKeepEditing: () => void;
  onSaveAsDraft: () => void;
  siteName: string;
};

export default function CloseSetupConfirmation({
  onDiscard,
  onKeepEditing,
  onSaveAsDraft,
  siteName,
}: CloseSetupConfirmationProps): JSX.Element {
  return (
    <DialogBox
      onClose={onKeepEditing}
      open={true}
      title={strings.CLOSE_SITE_SETUP}
      size='large'
      message={strings.formatString(strings.CLOSE_DRAFT_SITE_SETUP_MESSAGE, siteName) as string}
      leftButton={
        <Button
          id='keep-editing-planting-site'
          label={strings.KEEP_EDITING}
          onClick={onKeepEditing}
          priority='secondary'
          size='medium'
          type='passive'
        />
      }
      rightButtons={[
        <Button
          id='discard-planting-site'
          key='discard'
          label={strings.DISCARD_CHANGES}
          onClick={onDiscard}
          priority='secondary'
          type='destructive'
        />,
        <Button id='save-planting-site-as-draft' key='save' label={strings.SAVE_AND_CLOSE} onClick={onSaveAsDraft} />,
      ]}
    />
  );
}
