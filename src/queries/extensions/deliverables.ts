import { api } from '../generated/deliverables';
import { QueryTagTypes } from '../tags';

type SubmissionArg = { deliverableId: number; projectId: number };

const submissionTag = ({ deliverableId, projectId }: SubmissionArg) => ({
  type: QueryTagTypes.Deliverables,
  id: `d${deliverableId}-p${projectId}`,
});

const submissionWriteTags = (arg: SubmissionArg) => [
  submissionTag(arg),
  { type: QueryTagTypes.Deliverables, id: 'LIST' },
  QueryTagTypes.ApplicationDeliverables,
  QueryTagTypes.ApplicationModules,
];

api.enhanceEndpoints({
  endpoints: {
    listDeliverables: {
      providesTags: (result) => [
        { type: QueryTagTypes.Deliverables, id: 'LIST' },
        ...(result?.deliverables ?? []).map((deliverable) =>
          submissionTag({ deliverableId: deliverable.id, projectId: deliverable.projectId })
        ),
      ],
    },
    getDeliverable: {
      providesTags: (_result, _error, arg) => [submissionTag(arg)],
    },
    updateSubmission: {
      invalidatesTags: (_result, _error, arg) => submissionWriteTags(arg),
    },
    submitSubmission: {
      invalidatesTags: (_result, _error, arg) => submissionWriteTags(arg),
    },
    completeSubmission: {
      invalidatesTags: (_result, _error, arg) => submissionWriteTags(arg),
    },
    incompleteSubmission: {
      invalidatesTags: (_result, _error, arg) => submissionWriteTags(arg),
    },
    uploadDeliverableDocument: {
      invalidatesTags: (_result, _error, arg) =>
        submissionWriteTags({ deliverableId: arg.deliverableId, projectId: Number(arg.body.projectId) }),
    },
    importDeliverables: {
      invalidatesTags: [QueryTagTypes.Deliverables, QueryTagTypes.Modules, QueryTagTypes.ProjectModules],
    },
  },
});
