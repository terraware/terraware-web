import React, { type JSX, useState } from 'react';

import { Button } from '@terraware/web-components';

import DocumentMetadataEdit from 'src/components/DocumentProducer/DocumentMetadataEdit';
import PageDialog from 'src/components/DocumentProducer/PageDialog';
import { useUpdateDocumentMutation } from 'src/queries/generated/documentProducerDocuments';
import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';
import { toWorkflowState } from 'src/utils/mutationStatus';

type UpdateMetadataProps = {
  doc: Document;
  onFinish: (saved: boolean) => void;
};

const UpdateMetadata = ({ doc, onFinish }: UpdateMetadataProps): JSX.Element => {
  const [documentName, setDocumentName] = useState<string>(doc.name);
  const [documentOwner, setDocumentOwner] = useState<string>(doc.ownedBy.toString());
  const [formValid, setFormValid] = useState<boolean>();

  const [updateDocument, updateDocumentResult] = useUpdateDocumentMutation();

  const isFormValid = () => documentName && documentOwner;

  const save = () => {
    if (!isFormValid()) {
      setFormValid(false);
      return;
    }

    setFormValid(true);

    void updateDocument({
      id: doc.id,
      updateDocumentRequestPayload: { name: documentName, ownedBy: parseInt(documentOwner, 10), status: doc.status },
    });
  };

  const cancel = () => onFinish(false);

  return (
    <PageDialog
      workflowState={toWorkflowState(updateDocumentResult)}
      onSuccess={() => onFinish(true)}
      onClose={cancel}
      open={true}
      title={strings.DOCUMENT_DETAILS}
      size='medium'
      middleButtons={[
        <Button
          id='save-version-cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={cancel}
          key='button-1'
        />,
        <Button id='save-version' label={strings.SAVE} onClick={save} key='button-2' />,
      ]}
    >
      <DocumentMetadataEdit
        documentName={documentName}
        setDocumentName={(value: string) => setDocumentName(value)}
        documentOwner={documentOwner}
        setDocumentOwner={(value: string) => setDocumentOwner(value)}
        documentTemplateId={doc.documentTemplateId.toString()}
        formValid={formValid}
        isEdit={true}
      />
    </PageDialog>
  );
};

export default UpdateMetadata;
