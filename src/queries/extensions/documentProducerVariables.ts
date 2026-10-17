import { api } from '../generated/documentProducerVariables';
import { QueryTagTypes } from '../tags';

const workflowHistoryTag = (projectId: number, variableId: number) => ({
  type: QueryTagTypes.VariableWorkflowHistory,
  id: `p${projectId}-v${variableId}`,
});

api.enhanceEndpoints({
  endpoints: {
    listVariables: {
      providesTags: [{ type: QueryTagTypes.Variables, id: 'LIST' }],
    },
    listVariableOwners: {
      providesTags: (_result, _error, projectId) => [{ type: QueryTagTypes.VariableOwners, id: projectId }],
    },
    getVariableWorkflowHistory: {
      providesTags: (_result, _error, { projectId, variableId }) => [workflowHistoryTag(projectId, variableId)],
    },
    updateVariableOwner: {
      invalidatesTags: (_result, _error, { projectId }) => [{ type: QueryTagTypes.VariableOwners, id: projectId }],
    },
    updateVariableWorkflowDetails: {
      invalidatesTags: (_result, _error, { projectId, variableId }) => [
        { type: QueryTagTypes.VariableValues, id: projectId },
        workflowHistoryTag(projectId, variableId),
        QueryTagTypes.Deliverables,
        QueryTagTypes.ApplicationDeliverables,
        QueryTagTypes.ApplicationModules,
      ],
    },
  },
});
