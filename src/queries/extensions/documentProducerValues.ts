import { api } from '../generated/documentProducerValues';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listProjectVariableValues: {
      providesTags: (_result, _error, { projectId }) => [{ type: QueryTagTypes.VariableValues, id: projectId }],
    },
    updateProjectVariableValues: {
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: QueryTagTypes.VariableValues, id: projectId },
        QueryTagTypes.VariableWorkflowHistory,
        QueryTagTypes.Deliverables,
        QueryTagTypes.ApplicationDeliverables,
        QueryTagTypes.ApplicationModules,
      ],
    },
    uploadProjectImageValue: {
      invalidatesTags: (_result, _error, { projectId }) => [{ type: QueryTagTypes.VariableValues, id: projectId }],
    },
  },
});
