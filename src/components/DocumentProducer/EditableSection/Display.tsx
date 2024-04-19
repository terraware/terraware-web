import React from 'react';

import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import DisplayVariableValue from './DisplayVariableValue';

const useStyles = makeStyles(() => ({
  sectionText: {
    fontSize: '16px',
  },
}));

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
        <SectionValue key={index} pddId={docId} value={v} allVariables={allVariables} />
      ))}
    </Typography>
  ) : null;
};

type SectionValueProps = {
  pddId: number;
  value: VariableValueValue;
  allVariables: VariableWithValues[];
};

const SectionValue = ({ pddId, value, allVariables }: SectionValueProps): React.ReactElement | null => {
  const classes = useStyles();

  switch (value.type) {
    case 'SectionText':
      return <span className={classes.sectionText}>{value.textValue}</span>;
    case 'SectionVariable':
      const reference = value.usageType === 'Reference';
      const variable = allVariables.find((v) => v.id === value.variableId);
      return variable ? <DisplayVariableValue docId={pddId} variable={variable} reference={reference} /> : null;
    default:
      return null;
  }
};

export default EditableSectionDisplay;
