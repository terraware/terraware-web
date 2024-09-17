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
  display?: boolean;
  variable: VariableWithValues;
  onFinish: (edited: boolean) => void;
  onCancel: () => void;
  projectId: number;
  setUpdateWorkflowRequestId?: (requestId: string) => void;
};

export default function EditVariableModal({
  display,
  onCancel,
  onFinish,
  projectId,
  setUpdateWorkflowRequestId,
  variable,
}: EditVariableModalProps) {
  const { getUsedSections } = useDocumentProducerData();

  switch (variable.type) {
    case 'Image':
      return (
        <EditImagesModal
          display={display}
          variable={variable as ImageVariableWithValues}
          projectId={projectId}
          onFinish={onFinish}
          onCancel={onCancel}
        />
      );
    case 'Table':
      return (
        <EditableTableEdit
          display={display}
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
          display={display}
          onFinish={onFinish}
          projectId={projectId}
          sectionsUsed={getUsedSections(variable.id)}
          setUpdateWorkflowRequestId={setUpdateWorkflowRequestId}
          variable={variable}
        />
      );
    default:
      return null;
  }
}
