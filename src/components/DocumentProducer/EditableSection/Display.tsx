import React from 'react';

import { Typography } from '@mui/material';

import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import DisplayVariableValue from './DisplayVariableValue';

export type EditableSectionDisplayProps = {
  projectId: number;
  sectionValues?: VariableValueValue[];
  allVariables: VariableWithValues[];
};

const EditableSectionDisplay = ({
  projectId,
  sectionValues,
  allVariables,
}: EditableSectionDisplayProps): React.ReactElement | null => {
  return sectionValues ? (
    <Typography fontSize='14px' fontWeight={400}>
      {sectionValues.map((v, index) => (
        <SectionValue key={index} projectId={projectId} value={v} allVariables={allVariables} />
      ))}
    </Typography>
  ) : null;
};

type SectionValueProps = {
  projectId: number;
  value: VariableValueValue;
  allVariables: VariableWithValues[];
};

const SectionValue = ({ projectId, value, allVariables }: SectionValueProps): React.ReactElement | null => {
  switch (value.type) {
    case 'SectionText':
      return <span style={{ fontSize: '16px', whiteSpace: 'pre-wrap' }}>{value.textValue}</span>;
    case 'SectionVariable':
      const reference = value.usageType === 'Reference';
      const variable = allVariables.find((v) => v.id === value.variableId);
      return variable ? <DisplayVariableValue projectId={projectId} variable={variable} reference={reference} /> : null;
    default:
      return null;
  }
};

export default EditableSectionDisplay;
