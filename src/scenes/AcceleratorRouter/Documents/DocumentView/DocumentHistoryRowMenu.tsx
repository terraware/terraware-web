import React, { type JSX, useState } from 'react';

import { IconButton } from '@mui/material';
import { DropdownItem, Icon, Popover } from '@terraware/web-components';

import PageWorkflow from 'src/components/DocumentProducer/PageWorkflow';
import { selectDocumentRequest } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestMarkSubmitted } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

type DocumentHistoryMenuProps = {
  documentId: number;
  versionId: number;
  isSubmitted?: boolean;
  reloadData?: () => void;
};

export default function DocumentHistoryRowMenu({
  documentId,
  versionId,
  isSubmitted,
  reloadData,
}: DocumentHistoryMenuProps): JSX.Element {
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<HTMLElement | null>(null);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');

  const results = useAppSelector(selectDocumentRequest(requestId));

  const markAsSubmitted = () => {
    const payload = {
      isSubmitted: !isSubmitted,
    };
    const request = dispatch(requestMarkSubmitted({ docId: documentId, versionId, payload }));
    setRequestId(request.requestId);
    setActionMenuAnchorEl(null);
  };

  const onSuccess = () => {
    if (reloadData) {
      reloadData();
    }
    setRequestId('');
  };

  return (
    <PageWorkflow workflowState={results} onSuccess={onSuccess}>
      <IconButton onClick={(event) => setActionMenuAnchorEl(event.currentTarget)}>
        <Icon name='menuVertical' />
      </IconButton>
      <Popover
        sections={[
          [
            isSubmitted
              ? { label: strings.MARK_AS_SUBMITTED_UNDO, value: 'undo-mark-as-submitted' }
              : { label: strings.MARK_AS_SUBMITTED, value: 'mark-as-submitted' },
          ],
        ]}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handleClick={(item: DropdownItem) => {
          markAsSubmitted();
        }}
        anchorElement={actionMenuAnchorEl}
        setAnchorElement={setActionMenuAnchorEl}
      />
    </PageWorkflow>
  );
}
