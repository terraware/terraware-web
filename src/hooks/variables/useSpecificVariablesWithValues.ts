import { skipToken } from '@reduxjs/toolkit/query';

import { VariableWithValues } from 'src/types/documentProducer/Variable';

import useVariablesWithValues from './useVariablesWithValues';

const NO_VARIABLES: VariableWithValues[] = [];

const useSpecificVariablesWithValues = (stableIds: string[], projectId?: number) => {
  const result = useVariablesWithValues(
    stableIds.length > 0 && projectId !== undefined
      ? { variablesArg: { stableId: stableIds }, valuesArg: { projectId, stableId: stableIds } }
      : skipToken
  );
  return { ...result, variablesWithValues: result.variablesWithValues ?? NO_VARIABLES };
};

export default useSpecificVariablesWithValues;
