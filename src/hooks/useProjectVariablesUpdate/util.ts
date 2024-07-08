import { VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  NewDateValuePayload,
  NewLinkValuePayload,
  NewNumberValuePayload,
  NewSelectValuePayload,
  NewTextValuePayload,
  Operation,
  VariableValueDateValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';

// TODO this was taken from the pdd-web code, but there is no test, it definitely seems test-worthy
export const makeVariableValueOperations = (
  variable: VariableWithValues,
  pendingValues: VariableValueValue[],
  removedValue?: VariableValueValue
) => {
  const operations: Operation[] = [];

  let newValue:
    | NewDateValuePayload
    | NewTextValuePayload
    | NewNumberValuePayload
    | NewSelectValuePayload
    | NewLinkValuePayload
    | undefined;

  let newValues: NewTextValuePayload[] = [];
  let valueIdToUpdate = -1;

  if (variable.type === 'Text') {
    const firstValue = pendingValues[0] as VariableValueTextValue;
    valueIdToUpdate = firstValue.id;

    newValues = pendingValues.reduce((acc: NewTextValuePayload[], nV: VariableValueValue) => {
      if (nV.type === 'Text') {
        acc.push({ type: 'Text', textValue: nV.textValue });
      }
      return acc;
    }, []);
  }

  if (variable.type === 'Number') {
    const firstValue = pendingValues[0] as VariableValueNumberValue;
    valueIdToUpdate = firstValue.id;
    newValue = { type: 'Number', numberValue: firstValue.numberValue, citation: firstValue.citation };
  }

  if (variable.type === 'Select') {
    const firstValue = pendingValues[0] as VariableValueSelectValue;
    valueIdToUpdate = firstValue.id;
    newValue = { type: 'Select', optionIds: firstValue.optionValues, citation: firstValue.citation };
  }

  if (variable.type === 'Date') {
    const firstValue = pendingValues[0] as VariableValueDateValue;
    valueIdToUpdate = firstValue.id;
    newValue = { type: 'Date', dateValue: firstValue.dateValue, citation: firstValue.citation };
  }

  if (variable.type === 'Link') {
    const firstValue = pendingValues[0] as VariableValueLinkValue;
    valueIdToUpdate = firstValue.id;
    newValue = { type: 'Link', url: firstValue.url, citation: firstValue.citation, title: firstValue.title };
  }

  if (newValue) {
    if (pendingValues[0].id !== -1) {
      operations.push({
        operation: 'Update',
        valueId: valueIdToUpdate,
        value: newValue,
        existingValueId: valueIdToUpdate,
      });
    } else {
      operations.push({ operation: 'Append', variableId: variable.id, value: newValue });
    }
  }

  if (newValues) {
    newValues.forEach((nV, index) => {
      if (pendingValues[index].id !== -1) {
        operations.push({
          operation: 'Update',
          valueId: pendingValues[index].id,
          value: nV,
          existingValueId: pendingValues[index].id,
        });
      } else {
        operations.push({ operation: 'Append', variableId: variable.id, value: nV });
      }
    });

    // Delete list of values removed
    if (removedValue) {
      operations.push({
        operation: 'Delete',
        valueId: removedValue.id,
        existingValueId: removedValue.id,
      });
    }
  }

  return operations;
};
