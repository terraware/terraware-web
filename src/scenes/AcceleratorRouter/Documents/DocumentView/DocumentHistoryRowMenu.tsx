import React, { type JSX, useState } from 'react';

import { IconButton } from '@mui/material';
import { DropdownItem, Icon, Popover } from '@terraware/web-components';

import PageWorkflow from 'src/components/DocumentProducer/PageWorkflow';
import { useUpdateSavedDocumentVersionMutation } from 'src/queries/generated/documentProducerDocuments';
import strings from 'src/strings';
import { toWorkflowState } from 'src/utils/mutationStatus';

type DocumentHistoryMenuProps = {
  documentId: number;
  versionId: number;
  isSubmitted?: boolean;
};

export default function DocumentHistoryRowMenu({
  documentId,
  versionId,
  isSubmitted,
}: DocumentHistoryMenuProps): JSX.Element {
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [updateSavedVersion, updateSavedVersionResult] = useUpdateSavedDocumentVersionMutation();

  const markAsSubmitted = () => {
    const payload = {
      isSubmitted: !isSubmitted,
    };
    void updateSavedVersion({ documentId, versionId, updateSavedDocumentVersionRequestPayload: payload });
    setActionMenuAnchorEl(null);
  };

  return (
    <PageWorkflow workflowState={toWorkflowState(updateSavedVersionResult)} onSuccess={updateSavedVersionResult.reset}>
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
