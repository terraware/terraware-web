import React from 'react';

import { Grid } from '@mui/material';

import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import DeliverableVariableDetailsInput from '../DeliverableVariableDetailsInput';

export type DeliverableEditVariableProps = {
  setHasErrors: (variableId: number, hasErrors: boolean) => void;
  setValues: (variableId: number, values: VariableValueValue[]) => void;
  setRemovedValues: (variableId: number, values: VariableValueValue) => void;
  variable: VariableWithValues;
};

const DeliverableEditVariable = (props: DeliverableEditVariableProps): JSX.Element => {
  const { setHasErrors, setRemovedValues, setValues, variable } = props;

  return (
    <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <DeliverableVariableDetailsInput
          values={variable.values}
          setValues={(newValues: VariableValueValue[]) => setValues(variable.id, newValues)}
          validate={true}
          setHasErrors={(hasErrors: boolean) => setHasErrors(variable.id, hasErrors)}
          variable={variable}
          addRemovedValue={(removedValue: VariableValueValue) => setRemovedValues(variable.id, removedValue)}
        />
      </Grid>
    </Grid>
  );
};

export default DeliverableEditVariable;
