import React from 'react';

import EditImagesModal from 'src/components/DocumentProducer/EditImagesModal';
import EditVariable from 'src/components/DocumentProducer/EditVariable';
import EditableTableEdit from 'src/components/DocumentProducer/EditableTableModal';
import {
  ImageVariableWithValues,
  TableVariableWithValues,
  VariableWithValues,
} from 'src/types/documentProducer/Variable';

type EditVariableModalProps = {
  variable: VariableWithValues;
  onFinish: () => void;
  onCancel: () => void;
  docId: number;
  manifestId: number;
};

export default function EditVariableModal({ variable, onFinish, onCancel, docId, manifestId }: EditVariableModalProps) {
  switch (variable.type) {
    case 'Image':
      return (
        <EditImagesModal
          variable={variable as ImageVariableWithValues}
          docId={docId}
          onFinish={onFinish}
          onCancel={onCancel}
        />
      );
    case 'Table':
      return (
        <EditableTableEdit
          variable={variable as TableVariableWithValues}
          documentId={docId}
          onFinish={onFinish}
          onCancel={onCancel}
        />
      );
    case 'Date':
    case 'Link':
    case 'Select':
    case 'Number':
    case 'Text':
      return <EditVariable variableId={variable.id} documentId={docId} onFinish={onFinish} manifestId={manifestId} />;
    default:
      return null;
  }
}
