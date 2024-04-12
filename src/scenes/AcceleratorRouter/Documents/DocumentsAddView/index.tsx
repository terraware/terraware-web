import React, { useState } from 'react';

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

  const [associatedOrganization, setAssociatedOrganization] = useState('');
  const [methodologyId, setMethodologyId] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentOwner, setDocumentOwner] = useState('');

  const [formValid, setFormValid] = useState<boolean>();

  const isFormValid = () => associatedOrganization && methodologyId && documentName && documentOwner;

  const saveNewDoc = () => {
    const doc: CreateDocumentPayload = {
      organizationName: associatedOrganization,
      methodologyId: parseInt(methodologyId, 10),
      name: documentName,
      ownedBy: parseInt(documentOwner, 10),
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
      >
        <PageContent styles={{ width: '568px', margin: 'auto' }}>
          <DocumentMetadataEdit
            associatedOrganization={associatedOrganization}
            setAssociatedOrganization={(value: string) => setAssociatedOrganization(value)}
            documentName={documentName}
            setDocumentName={(value: string) => setDocumentName(value)}
            documentOwner={documentOwner}
            setDocumentOwner={(value: string) => setDocumentOwner(value)}
            methodologyId={methodologyId}
            setMethodologyId={(value: string) => setMethodologyId(value)}
            formValid={formValid}
          />
        </PageContent>
      </PageForm>
    </Page>
  );
};

export default DocumentsAddView;
