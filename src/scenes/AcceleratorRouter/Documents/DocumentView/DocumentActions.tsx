import React, { type JSX, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button, DropdownItem } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import OptionsMenu from 'src/components/common/OptionsMenu';
import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';

import Preview from '../PreviewView';
import SaveVersion from './SaveVersion';
import UpdateMetadata from './UpdateMetadata';

export type DocumentActionsProps = {
  document: Document;
  onDocumentUpdate: () => void;
};

const DocumentActions = ({ document, onDocumentUpdate }: DocumentActionsProps): JSX.Element => {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const [openSaveVersion, setOpenSaveVersion] = useState<boolean>(false);
  const [openUpdateMetadata, setOpenUpdateMetadata] = useState<boolean>(false);
  const [openPreview, setOpenPreview] = useState<boolean>(false);

  const onFinish = (saved: boolean) => {
    if (saved) {
      onDocumentUpdate();
    }
  };

  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'edit-document-details') {
      setOpenUpdateMetadata(true);
    }
  };

  return (
    <>
      {openUpdateMetadata && (
        <UpdateMetadata
          doc={document}
          onFinish={(saved: boolean) => {
            setOpenUpdateMetadata(false);
            onFinish(saved);
          }}
        />
      )}
      {openSaveVersion && (
        <SaveVersion
          docId={document.id}
          onFinish={(saved: boolean) => {
            setOpenSaveVersion(false);
            onFinish(saved);
          }}
        />
      )}
      {openPreview && <Preview close={() => setOpenPreview(false)} />}
      <Box margin={theme.spacing(isMobile ? 2 : 5, isMobile ? 'auto' : 0, 0)}>
        <Button
          id={`preview-document-${document.id}`}
          label={strings.PREVIEW}
          onClick={() => setOpenPreview(true)}
          size='medium'
          priority='secondary'
        />
        <Button
          id={`save-document-version-${document.id}`}
          label={strings.SAVE_VERSION_ELLIPSIS}
          onClick={() => setOpenSaveVersion(true)}
          size='medium'
          priority='primary'
        />
        <OptionsMenu
          onOptionItemClick={onOptionItemClick}
          optionItems={[{ label: strings.EDIT_DOCUMENT_DETAILS, value: 'edit-document-details' }]}
        />
      </Box>
    </>
  );
};

export default DocumentActions;
