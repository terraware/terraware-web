import React, { type JSX } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type CloseSetupConfirmationProps = {
  onDiscard: () => void;
  message?: string;
  nothingToDiscard?: boolean;
  onKeepEditing: () => void;
  siteName: string;
  title?: string;
};

export default function CloseSetupConfirmation({
  message,
  nothingToDiscard,
  onDiscard,
  onKeepEditing,
  siteName,
  title,
}: CloseSetupConfirmationProps): JSX.Element {
  return (
    <DialogBox
      onClose={onKeepEditing}
      open={true}
      title={title ?? strings.CANCEL_SITE_SETUP}
      size='large'
      message={strings.formatString(message ?? strings.CANCEL_DRAFT_SITE_SETUP_MESSAGE, siteName) as string}
      middleButtons={[
        <Button
          id='keep-editing-planting-site'
          key='keep-editing'
          label={strings.KEEP_EDITING}
          onClick={onKeepEditing}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        nothingToDiscard ? (
          <Button
            id='exit-planting-site-setup'
            key='exit'
            label={strings.EXIT_SETUP}
            onClick={onDiscard}
            size='medium'
          />
        ) : (
          <Button
            id='discard-planting-site'
            key='discard'
            label={strings.DISCARD_CHANGES}
            onClick={onDiscard}
            priority='secondary'
            size='medium'
            type='destructive'
          />
        ),
      ]}
    />
  );
}
