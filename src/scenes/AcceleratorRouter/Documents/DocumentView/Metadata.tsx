import React, { type JSX, useCallback } from 'react';

import { Box, useTheme } from '@mui/material';

import StatusBadge from 'src/components/DocumentProducer/StatusBadge';
import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import { useUpdateDocumentMutation } from 'src/queries/generated/documentProducerDocuments';
import strings from 'src/strings';
import { DocumentStatus } from 'src/types/documentProducer/Document';
import useSnackbar from 'src/utils/useSnackbar';

import InternalComment from './InternalComment';

const Metadata = ({ disabled }: { disabled: boolean }): JSX.Element => {
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [updateDocument] = useUpdateDocumentMutation();
  const { document } = useDocumentProducerData();

  const onUpdateInternalComment = useCallback(
    (internalComment: string, status: string) => {
      if (!document) {
        return;
      }
      void updateDocument({
        id: document.id,
        updateDocumentRequestPayload: {
          internalComment,
          name: document.name,
          ownedBy: document.ownedBy,
          status: status as DocumentStatus,
        },
      })
        .unwrap()
        .then(() => snackbar.toastSuccess(strings.CHANGES_SAVED))
        .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
    },
    [document, snackbar, updateDocument]
  );

  return (
    <Box display='flex' flexDirection='column'>
      {document && (
        <Box
          border={`1px solid ${theme.palette.TwClrBaseGray100}`}
          borderRadius='8px'
          marginBottom='16px'
          padding='16px'
        >
          <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
            <StatusBadge status={document.status} />
          </div>
          <InternalComment entity={document} update={onUpdateInternalComment} disabled={disabled} />
        </Box>
      )}
    </Box>
  );
};

export default Metadata;
