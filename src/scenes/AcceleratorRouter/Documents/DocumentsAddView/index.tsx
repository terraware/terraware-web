import React, { type JSX, useCallback, useState } from 'react';

import DocumentMetadataEdit from 'src/components/DocumentProducer/DocumentMetadataEdit';
import PageContent from 'src/components/DocumentProducer/PageContent';
import PageForm from 'src/components/DocumentProducer/PageForm';
import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { selectDocumentRequest } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestCreateDocument } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { CreateDocumentPayload } from 'src/types/documentProducer/Document';

const DocumentsAddView = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { goToDocuments } = useNavigateTo();

  const [requestId, setRequestId] = useState('');
  const createDocSelector = useAppSelector(selectDocumentRequest(requestId));

  const [documentTemplateId, setDocumentTemplateId] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentOwner, setDocumentOwner] = useState('');
  const [projectId, setProjectId] = useState('');

  const [formValid, setFormValid] = useState<boolean>();

  const isFormValid = () => documentTemplateId && documentName && documentOwner;

  const saveNewDoc = () => {
    const doc: CreateDocumentPayload = {
      documentTemplateId: parseInt(documentTemplateId, 10),
      name: documentName,
      ownedBy: parseInt(documentOwner, 10),
      projectId: parseInt(projectId, 10),
    };
    const request = dispatch(requestCreateDocument(doc));
    setRequestId(request.requestId);
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
        workflowState={createDocSelector}
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
