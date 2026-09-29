import { useMemo } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';

import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';
import { associateDocumentVariableValues } from 'src/utils/documentProducer/associateVariableValues';

import { useVariablesAndValues } from './useVariablesWithValues';

const useDocumentVariablesWithValues = (documentId?: number, projectId?: number, maxValueId?: number) => {
  const { variables, values, isLoading, isError, refetch } = useVariablesAndValues(
    documentId !== undefined && projectId !== undefined
      ? { variablesArg: { documentId }, valuesArg: { projectId, maxValueId } }
      : skipToken
  );

  const variablesWithValues = useMemo<(VariableWithValues | SectionVariableWithValues)[] | undefined>(
    () => (variables && values ? associateDocumentVariableValues(variables, values) : undefined),
    [variables, values]
  );

  return { variablesWithValues, isLoading, isError, refetch };
};

export default useDocumentVariablesWithValues;
