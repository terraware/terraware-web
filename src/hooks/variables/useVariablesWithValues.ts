import { useCallback, useMemo } from 'react';

import { SkipToken, skipToken } from '@reduxjs/toolkit/query';

import {
  ListProjectVariableValuesApiArg,
  useListProjectVariableValuesQuery,
} from 'src/queries/generated/documentProducerValues';
import { ListVariablesApiArg, useListVariablesQuery } from 'src/queries/generated/documentProducerVariables';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { associateVariableValues } from 'src/utils/documentProducer/associateVariableValues';

type Args = { variablesArg: ListVariablesApiArg; valuesArg: ListProjectVariableValuesApiArg } | SkipToken;

export const useVariablesAndValues = (args: Args) => {
  const variablesQuery = useListVariablesQuery(args === skipToken ? skipToken : args.variablesArg);
  const valuesQuery = useListProjectVariableValuesQuery(args === skipToken ? skipToken : args.valuesArg);

  const isSkipped = args === skipToken;
  const { refetch: refetchVariables } = variablesQuery;
  const { refetch: refetchValues } = valuesQuery;
  const refetch = useCallback(() => {
    if (!isSkipped) {
      void refetchVariables();
      void refetchValues();
    }
  }, [isSkipped, refetchValues, refetchVariables]);

  return {
    refetch,
    variables: variablesQuery.currentData?.variables,
    values: valuesQuery.currentData?.values,
    isLoading: variablesQuery.isFetching || valuesQuery.isFetching,
    isError: variablesQuery.isError || valuesQuery.isError,
  };
};

const useVariablesWithValues = (args: Args) => {
  const { variables, values, isLoading, isError, refetch } = useVariablesAndValues(args);

  const variablesWithValues = useMemo<VariableWithValues[] | undefined>(
    () => (variables && values ? associateVariableValues(variables, values) : undefined),
    [variables, values]
  );

  return { variablesWithValues, isLoading, isError, refetch };
};

export default useVariablesWithValues;
