import React from 'react';

import EditImagesModal from 'src/components/DocumentProducer/EditImagesModal';
import EditVariable from 'src/components/DocumentProducer/EditVariable';
import EditableTableEdit from 'src/components/DocumentProducer/EditableTableModal';
import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import {
  ImageVariableWithValues,
  TableVariableWithValues,
  VariableWithValues,
} from 'src/types/documentProducer/Variable';

type EditVariableModalProps = {
  variable: VariableWithValues;
  onFinish: () => void;
  onCancel: () => void;
  projectId: number;
};

export default function EditVariableModal({ variable, onFinish, onCancel, projectId }: EditVariableModalProps) {
  const { getUsedSections } = useDocumentProducerData();

  switch (variable.type) {
    case 'Image':
      return (
        <EditImagesModal
          variable={variable as ImageVariableWithValues}
          projectId={projectId}
          onFinish={onFinish}
          onCancel={onCancel}
        />
      );
    case 'Table':
      return (
        <EditableTableEdit
          variable={variable as TableVariableWithValues}
          projectId={projectId}
          onFinish={onFinish}
          onCancel={onCancel}
        />
      );
    case 'Date':
    case 'Link':
    case 'Select':
    case 'Number':
    case 'Text':
      return (
        <EditVariable
          onFinish={onFinish}
          projectId={projectId}
          sectionsUsed={getUsedSections(variable.id)}
          variable={variable}
        />
      );
    default:
      return null;
  }
}
