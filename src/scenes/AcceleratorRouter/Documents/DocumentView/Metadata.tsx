import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import StatusBadge from 'src/components/DocumentProducer/StatusBadge';
import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import { selectDocumentRequest } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestUpdateDocument } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DocumentStatus } from 'src/types/documentProducer/Document';
import useSnackbar from 'src/utils/useSnackbar';

import InternalComment from './InternalComment';

const Metadata = ({ disabled }: { disabled: boolean }): JSX.Element => {
  const snackbar = useSnackbar();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const selector = useAppSelector(selectDocumentRequest(requestId));
  const { document, reloadDocument } = useDocumentProducerData();

  const onUpdateInternalComment = useCallback(
    (internalComment: string, status: string) => {
      if (document) {
        const request = dispatch(
          requestUpdateDocument({
            id: document.id,
            payload: {
              internalComment,
              name: document.name,
              ownedBy: document.ownedBy,
              status: status as DocumentStatus,
            },
          })
        );
        setRequestId(request.requestId);
      }
    },
    [document, dispatch]
  );

  useEffect(() => {
    if (selector?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reloadDocument();
    } else if (selector?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [selector, snackbar, reloadDocument]);

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
