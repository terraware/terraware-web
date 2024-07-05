import React from 'react';

import { Grid } from '@mui/material';

import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import DeliverableVariableDetailsInput from '../DeliverableVariableDetailsInput';

export type DeliverableEditVariableProps = {
  setValues: (variableId: number, values: VariableValueValue[]) => void;
  setRemovedValues: (variableId: number, values: VariableValueValue) => void;
  variable: VariableWithValues;
};

// TODO I think this component should go away, it is only two grid wrappers around the input, they should either
// go into the input or be controller in the parent
const DeliverableEditVariable = (props: DeliverableEditVariableProps): JSX.Element => {
  const { setRemovedValues, setValues, variable } = props;

  return (
    <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <DeliverableVariableDetailsInput
          values={variable.values}
          setValues={(newValues: VariableValueValue[]) => setValues(variable.id, newValues)}
          variable={variable}
          addRemovedValue={(removedValue: VariableValueValue) => setRemovedValues(variable.id, removedValue)}
        />
      </Grid>
    </Grid>
  );
};

export default DeliverableEditVariable;
