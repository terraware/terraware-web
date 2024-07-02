import React, { useState } from 'react';

import { Grid } from '@mui/material';

import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import DeliverableVariableDetailsInput from '../DeliverableVariableDetailsInput';

export type DeliverableEditVariableProps = {
  setHasErrors: (variableId: number, hasErrors: boolean) => void;
  setValues: (variableId: number, values: VariableValueValue[]) => void;
  variable: VariableWithValues;
};

const DeliverableEditVariable = (props: DeliverableEditVariableProps): JSX.Element => {
  const { setHasErrors, setValues, variable } = props;

  const [removedValues, setRemovedValues] = useState<VariableValueValue[]>();

  const onAddRemovedValue = (newRemovedValue: VariableValueValue) => {
    setRemovedValues((prev) => {
      if (prev) {
        return [...prev, newRemovedValue];
      } else {
        return [newRemovedValue];
      }
    });
  };

  return (
    <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
      <Grid item xs={12}>
        <DeliverableVariableDetailsInput
          values={variable.values}
          setValues={(newValues: VariableValueValue[]) => setValues(variable.id, newValues)}
          validate={true}
          setHasErrors={(hasErrors: boolean) => setHasErrors(variable.id, hasErrors)}
          variable={variable}
          addRemovedValue={onAddRemovedValue}
        />
      </Grid>
    </Grid>
  );
};

export default DeliverableEditVariable;
