import React, { type JSX } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type CloseSetupConfirmationProps = {
  isNewSite: boolean;
  onDiscard: () => void;
  onKeepEditing: () => void;
  onSaveAsDraft: () => void;
  siteName: string;
};

export default function CloseSetupConfirmation({
  isNewSite,
  onDiscard,
  onKeepEditing,
  onSaveAsDraft,
  siteName,
}: CloseSetupConfirmationProps): JSX.Element {
  const canSave = !!siteName;

  const getMessage = () => {
    if (!canSave) {
      return strings.DISCARD_UNNAMED_SITE_MESSAGE;
    }
    const template = isNewSite ? strings.CLOSE_NEW_SITE_SETUP_MESSAGE : strings.CLOSE_DRAFT_SITE_SETUP_MESSAGE;
    return strings.formatString(template, siteName) as string;
  };

  return (
    <DialogBox
      onClose={onKeepEditing}
      open={true}
      title={canSave ? strings.CLOSE_SITE_SETUP : strings.DISCARD_THIS_SITE}
      size='medium'
      message={getMessage()}
      leftButton={
        <Button
          id='keep-editing-planting-site'
          label={strings.KEEP_EDITING}
          onClick={onKeepEditing}
          priority='secondary'
          type='passive'
        />
      }
      rightButtons={[
        <Button
          id='discard-planting-site'
          key='discard'
          label={strings.DISCARD}
          onClick={onDiscard}
          priority={canSave ? 'secondary' : 'primary'}
          type='destructive'
        />,
        ...(canSave
          ? [
              <Button
                id='save-planting-site-as-draft'
                key='save'
                label={strings.SAVE_AS_DRAFT}
                onClick={onSaveAsDraft}
              />,
            ]
          : []),
      ]}
    />
  );
}
