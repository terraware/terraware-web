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
  showVariableHistory: () => void;
};

export default function EditVariableModal({
  display,
  onCancel,
  onFinish,
  projectId,
  setUpdateWorkflowRequestId,
  showVariableHistory,
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
          showVariableHistory={showVariableHistory}
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
          showVariableHistory={showVariableHistory}
        />
      );
    case 'Date':
    case 'Email':
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
          showVariableHistory={showVariableHistory}
          variable={variable}
        />
      );
    default:
      return null;
  }
}
