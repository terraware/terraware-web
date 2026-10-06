import { skipToken } from '@reduxjs/toolkit/query';

import { VariableWithValues } from 'src/types/documentProducer/Variable';

import useVariablesWithValues from './useVariablesWithValues';

const NO_VARIABLES: VariableWithValues[] = [];

const useDeliverableVariablesWithValues = (deliverableId?: number, projectId?: number) => {
  const result = useVariablesWithValues(
    deliverableId !== undefined && projectId !== undefined
      ? { variablesArg: { deliverableId }, valuesArg: { projectId, deliverableId } }
      : skipToken
  );
  return { ...result, variablesWithValues: result.variablesWithValues ?? NO_VARIABLES };
};

export default useDeliverableVariablesWithValues;
