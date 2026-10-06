import { skipToken } from '@reduxjs/toolkit/query';

import useVariablesWithValues from './useVariablesWithValues';

const useProjectVariablesWithValues = (projectId?: number, maxValueId?: number) =>
  useVariablesWithValues(
    projectId !== undefined ? { variablesArg: {}, valuesArg: { projectId, maxValueId } } : skipToken
  );

export default useProjectVariablesWithValues;
