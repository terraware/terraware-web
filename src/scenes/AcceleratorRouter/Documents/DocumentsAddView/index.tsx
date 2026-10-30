import React, { type JSX, useCallback, useState } from 'react';

import DocumentMetadataEdit from 'src/components/DocumentProducer/DocumentMetadataEdit';
import PageContent from 'src/components/DocumentProducer/PageContent';
import PageForm from 'src/components/DocumentProducer/PageForm';
import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import {
  CreateDocumentRequestPayload,
  useCreateDocumentMutation,
} from 'src/queries/generated/documentProducerDocuments';
import strings from 'src/strings';
import { toWorkflowState } from 'src/utils/mutationStatus';

const DocumentsAddView = (): JSX.Element => {
  const { goToDocuments } = useNavigateTo();
  const [createDocument, createDocumentResult] = useCreateDocumentMutation();

  const [documentTemplateId, setDocumentTemplateId] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentOwner, setDocumentOwner] = useState('');
  const [projectId, setProjectId] = useState('');

  const [formValid, setFormValid] = useState<boolean>();

  const isFormValid = () => documentTemplateId && documentName && documentOwner;

  const saveNewDoc = () => {
    const doc: CreateDocumentRequestPayload = {
      documentTemplateId: parseInt(documentTemplateId, 10),
      name: documentName,
      ownedBy: parseInt(documentOwner, 10),
      projectId: parseInt(projectId, 10),
    };
    void createDocument(doc);
  };

  const onSave = () => {
    // All fields in this form are required
    if (!isFormValid()) {
      setFormValid(false);
      return;
    }

    setFormValid(true);

    saveNewDoc();
  };

  const handleSetProjectId = useCallback(
    (value: string) => {
      setProjectId(value);
    },
    [setProjectId]
  );

  return (
    <Page title={strings.ADD_DOCUMENT}>
      <PageForm
        workflowState={toWorkflowState(createDocumentResult)}
        onSave={onSave}
        onCancel={goToDocuments}
        onSuccess={goToDocuments}
        cancelID='cancel'
        saveID='save'
        saveButtonText={strings.SAVE}
        cancelButtonText={strings.CANCEL}
        style={{ width: '100%' }}
      >
        <PageContent styles={{ width: '568px', margin: 'auto' }}>
          <DocumentMetadataEdit
            documentName={documentName}
            setDocumentName={(value: string) => setDocumentName(value)}
            documentOwner={documentOwner}
            setDocumentOwner={(value: string) => setDocumentOwner(value)}
            documentTemplateId={documentTemplateId}
            setDocumentTemplateId={(value: string) => setDocumentTemplateId(value)}
            projectId={projectId}
            setProjectId={handleSetProjectId}
            formValid={formValid}
          />
        </PageContent>
      </PageForm>
    </Page>
  );
};

export default DocumentsAddView;
