import { useState } from 'react';

import { Button } from '@terraware/web-components';

import DocumentMetadataEdit from 'src/components/DocumentProducer/DocumentMetadataEdit';
import PageDialog from 'src/components/DocumentProducer/PageDialog';
import { selectDocumentRequest } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestUpdateDocument } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';

export type UpdateMetadataProps = {
  doc: Document;
  onFinish: (saved: boolean) => void;
};

const UpdateMetadata = ({ doc, onFinish }: UpdateMetadataProps): JSX.Element => {
  const [associatedOrganization, setAssociatedOrganization] = useState<string>(doc.organizationName);
  const [documentName, setDocumentName] = useState<string>(doc.name);
  const [documentOwner, setDocumentOwner] = useState<string>(doc.ownedBy.toString());
  const [requestId, setRequestId] = useState<string>('');
  const [formValid, setFormValid] = useState<boolean>();
  const dispatch = useAppDispatch();

  const selector = useAppSelector(selectDocumentRequest(requestId));

  const isFormValid = () => associatedOrganization && documentName && documentOwner;

  const save = () => {
    if (!isFormValid()) {
      setFormValid(false);
      return;
    }

    setFormValid(true);

    const request = dispatch(
      requestUpdateDocument({
        id: doc.id,
        payload: { organizationName: associatedOrganization, name: documentName, ownedBy: parseInt(documentOwner, 10) },
      })
    );
    setRequestId(request.requestId);
  };

  const cancel = () => onFinish(false);

  return (
    <PageDialog
      workflowState={requestId ? selector : undefined}
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
        associatedOrganization={associatedOrganization}
        setAssociatedOrganization={(value: string) => setAssociatedOrganization(value)}
        documentName={documentName}
        setDocumentName={(value: string) => setDocumentName(value)}
        documentOwner={documentOwner}
        setDocumentOwner={(value: string) => setDocumentOwner(value)}
        methodologyId={doc.methodologyId.toString()}
        formValid={formValid}
        isEdit={true}
      />
    </PageDialog>
  );
};

export default UpdateMetadata;
