import React from 'react';

import { Typography } from '@mui/material';

import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import DisplayVariableValue from './DisplayVariableValue';

export type EditableSectionDisplayProps = {
  docId: number;
  sectionValues?: VariableValueValue[];
  allVariables: VariableWithValues[];
};

const EditableSectionDisplay = ({
  docId,
  sectionValues,
  allVariables,
}: EditableSectionDisplayProps): React.ReactElement | null => {
  return sectionValues ? (
    <Typography fontSize='14px' fontWeight={400}>
      {sectionValues.map((v, index) => (
        <SectionValue key={index} documentId={docId} value={v} allVariables={allVariables} />
      ))}
    </Typography>
  ) : null;
};

type SectionValueProps = {
  documentId: number;
  value: VariableValueValue;
  allVariables: VariableWithValues[];
};

const SectionValue = ({ documentId, value, allVariables }: SectionValueProps): React.ReactElement | null => {
  switch (value.type) {
    case 'SectionText':
      return <span style={{ fontSize: '16px' }}>{value.textValue}</span>;
    case 'SectionVariable':
      const reference = value.usageType === 'Reference';
      const variable = allVariables.find((v) => v.id === value.variableId);
      return variable ? <DisplayVariableValue docId={documentId} variable={variable} reference={reference} /> : null;
    default:
      return null;
  }
};

export default EditableSectionDisplay;
