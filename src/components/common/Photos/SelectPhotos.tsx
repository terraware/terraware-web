import React, { type JSX } from 'react';

import { PhotoChooser, PhotoChooserErrorType, PhotoChooserProps } from '@terraware/web-components';

import strings from 'src/strings';

export type ErrorType = PhotoChooserErrorType;

/**
 * Wrapper for photo chooser with strings set
 */
export default function SelectPhotos(props: PhotoChooserProps): JSX.Element {
  return (
    <PhotoChooser
      {...props}
      uploadText={strings.ADD_PHOTOS}
      uploadDescription={strings.UPLOAD_PHOTO_DESCRIPTION}
      uploadMobileDescription={strings.UPLOAD_PHOTO_MOBILE_DESCRIPTION}
      chooseFileText={strings.ADD_PHOTO}
    />
  );
}
