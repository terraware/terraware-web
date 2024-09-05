import React from 'react';

import { Typography } from '@mui/material';

import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import DisplayVariableValue from './DisplayVariableValue';

export type EditableSectionDisplayProps = {
  allVariables: VariableWithValues[];
  docId: number;
  onEditVariableValue: (variable?: VariableWithValues) => void;
  sectionValues?: VariableValueValue[];
};

const EditableSectionDisplay = ({
  allVariables,
  docId,
  onEditVariableValue,
  sectionValues,
}: EditableSectionDisplayProps): React.ReactElement | null => {
  return sectionValues ? (
    <Typography fontSize='14px' fontWeight={400}>
      {sectionValues.map((v, index) => (
        <SectionValue
          allVariables={allVariables}
          documentId={docId}
          key={index}
          onEditVariableValue={onEditVariableValue}
          value={v}
        />
      ))}
    </Typography>
  ) : null;
};

type SectionValueProps = {
  allVariables: VariableWithValues[];
  documentId: number;
  onEditVariableValue: (variable?: VariableWithValues) => void;
  value: VariableValueValue;
};

const SectionValue = ({
  allVariables,
  documentId,
  onEditVariableValue,
  value,
}: SectionValueProps): React.ReactElement | null => {
  switch (value.type) {
    case 'SectionText':
      return <span style={{ fontSize: '16px', whiteSpace: 'pre-wrap' }}>{value.textValue}</span>;
    case 'SectionVariable':
      const reference = value.usageType === 'Reference';
      const variable = allVariables.find((v) => v.id === value.variableId);
      return variable ? (
        <DisplayVariableValue
          docId={documentId}
          onEditVariableValue={onEditVariableValue}
          reference={reference}
          variable={variable}
        />
      ) : null;
    default:
      return null;
  }
};

export default EditableSectionDisplay;
