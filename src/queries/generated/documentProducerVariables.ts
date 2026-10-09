import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listVariableOwners: build.query<ListVariableOwnersApiResponse, ListVariableOwnersApiArg>({
      query: (queryArg) => ({ url: `/api/v1/document-producer/projects/${queryArg}/owners` }),
    }),
    updateVariableOwner: build.mutation<UpdateVariableOwnerApiResponse, UpdateVariableOwnerApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/projects/${queryArg.projectId}/owners/${queryArg.variableId}`,
        method: 'PUT',
        body: queryArg.updateVariableOwnerRequestPayload,
      }),
    }),
    updateVariableWorkflowDetails: build.mutation<
      UpdateVariableWorkflowDetailsApiResponse,
      UpdateVariableWorkflowDetailsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/projects/${queryArg.projectId}/workflow/${queryArg.variableId}`,
        method: 'PUT',
        body: queryArg.updateVariableWorkflowDetailsRequestPayload,
      }),
    }),
    getVariableWorkflowHistory: build.query<GetVariableWorkflowHistoryApiResponse, GetVariableWorkflowHistoryApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/projects/${queryArg.projectId}/workflow/${queryArg.variableId}/history`,
      }),
    }),
    listVariables: build.query<ListVariablesApiResponse, ListVariablesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/variables`,
        params: {
          deliverableId: queryArg.deliverableId,
          documentId: queryArg.documentId,
          stableId: queryArg.stableId,
          variableId: queryArg.variableId,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListVariableOwnersApiResponse = /** status 200 OK */ ListVariableOwnersResponsePayload;
export type ListVariableOwnersApiArg = number;
export type UpdateVariableOwnerApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateVariableOwnerApiArg = {
  projectId: number;
  variableId: number;
  updateVariableOwnerRequestPayload: UpdateVariableOwnerRequestPayload;
};
export type UpdateVariableWorkflowDetailsApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateVariableWorkflowDetailsApiArg = {
  projectId: number;
  variableId: number;
  updateVariableWorkflowDetailsRequestPayload: UpdateVariableWorkflowDetailsRequestPayload;
};
export type GetVariableWorkflowHistoryApiResponse = /** status 200 OK */ GetVariableWorkflowHistoryResponsePayload;
export type GetVariableWorkflowHistoryApiArg = {
  projectId: number;
  variableId: number;
};
export type ListVariablesApiResponse = /** status 200 OK */ ListVariablesResponsePayload;
export type ListVariablesApiArg = {
  deliverableId?: number;
  documentId?: number;
  /** If specified, return the definition of a specific variable given its stable ID. May be specified more than once to return multiple variables. deliverableId and documentId are ignored if this is specified. */
  stableId?: string[];
  /** If specified, return the definition of a specific variable. May be specified more than once to return multiple variables. deliverableId, documentId, and stableId are ignored if this is specified. */
  variableId?: number[];
};
export type SuccessOrError = 'ok' | 'error';
export type VariableOwnersResponseElement = {
  ownedBy: number;
  variableId: number;
};
export type ListVariableOwnersResponsePayload = {
  status: SuccessOrError;
  variables: VariableOwnersResponseElement[];
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateVariableOwnerRequestPayload = {
  /** New owner of the variable, or null if the variable should have no owner. */
  ownedBy?: number;
};
export type UpdateVariableWorkflowDetailsRequestPayload = {
  feedback?: string;
  internalComment?: string;
  status:
    | 'Not Submitted'
    | 'In Review'
    | 'Needs Translation'
    | 'Approved'
    | 'Rejected'
    | 'Not Needed'
    | 'Incomplete'
    | 'Complete';
};
export type ExistingValuePayloadBase = {
  citation?: string;
  id: number;
  listPosition: number;
  type:
    | 'Date'
    | 'Deleted'
    | 'Email'
    | 'Image'
    | 'Link'
    | 'Number'
    | 'SectionText'
    | 'SectionVariable'
    | 'Select'
    | 'Table'
    | 'Text';
};
export type ExistingDateValuePayload = {
  type: 'Date';
} & ExistingValuePayloadBase & {
    dateValue: string;
  };
export type ExistingDeletedValuePayload = {
  type: 'Deleted';
} & ExistingValuePayloadBase;
export type ExistingEmailValuePayload = {
  type: 'Email';
} & ExistingValuePayloadBase & {
    emailValue: string;
  };
export type ExistingImageValuePayload = {
  type: 'Image';
} & ExistingValuePayloadBase & {
    caption?: string;
  };
export type ExistingLinkValuePayload = {
  type: 'Link';
} & ExistingValuePayloadBase & {
    title?: string;
    url: string;
  };
export type ExistingNumberValuePayload = {
  type: 'Number';
} & ExistingValuePayloadBase & {
    numberValue: number;
  };
export type ExistingSectionTextValuePayload = {
  type: 'SectionText';
} & ExistingValuePayloadBase & {
    textValue: string;
  };
export type ExistingSectionVariableValuePayload = {
  type: 'SectionVariable';
} & ExistingValuePayloadBase & {
    displayStyle?: 'Inline' | 'Block';
    usageType: 'Injection' | 'Reference';
    variableId: number;
  };
export type ExistingSelectValuePayload = {
  type: 'Select';
} & ExistingValuePayloadBase & {
    optionValues: number[];
  };
export type ExistingTableValuePayload = {
  type: 'Table';
} & ExistingValuePayloadBase;
export type ExistingTextValuePayload = {
  type: 'Text';
} & ExistingValuePayloadBase & {
    textValue: string;
  };
export type VariableWorkflowHistoryElement = {
  createdBy: number;
  createdTime: string;
  feedback?: string;
  id: number;
  internalComment?: string;
  maxVariableValueId: number;
  projectId: number;
  status:
    | 'Not Submitted'
    | 'In Review'
    | 'Needs Translation'
    | 'Approved'
    | 'Rejected'
    | 'Not Needed'
    | 'Incomplete'
    | 'Complete';
  variableValues: (
    | ExistingDateValuePayload
    | ExistingDeletedValuePayload
    | ExistingEmailValuePayload
    | ExistingImageValuePayload
    | ExistingLinkValuePayload
    | ExistingNumberValuePayload
    | ExistingSectionTextValuePayload
    | ExistingSectionVariableValuePayload
    | ExistingSelectValuePayload
    | ExistingTableValuePayload
    | ExistingTextValuePayload
  )[];
};
export type VariablePayloadBase = {
  deliverableId?: number;
  deliverableQuestion?: string;
  dependencyCondition?: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'neq';
  dependencyValue?: string;
  dependencyVariableStableId?: string;
  description?: string;
  id: number;
  internalOnly: boolean;
  isList: boolean;
  isRequired: boolean;
  name: string;
  position?: number;
  /** IDs of sections that recommend this variable. */
  recommendedBy?: number[];
  stableId: string;
  type: 'Number' | 'Text' | 'Date' | 'Image' | 'Select' | 'Table' | 'Link' | 'Section' | 'Email';
};
export type DateVariablePayload = {
  type: 'Date';
} & VariablePayloadBase;
export type EmailVariablePayload = {
  type: 'Email';
} & VariablePayloadBase;
export type ImageVariablePayload = {
  type: 'Image';
} & VariablePayloadBase;
export type LinkVariablePayload = {
  type: 'Link';
} & VariablePayloadBase;
export type NumberVariablePayload = {
  type: 'Number';
} & VariablePayloadBase & {
    decimalPlaces?: number;
    maxValue?: number;
    minValue?: number;
  };
export type SectionVariablePayload = {
  type: 'Section';
} & VariablePayloadBase & {
    children: SectionVariablePayload[];
    /** IDs of variables that this section recommends. */
    recommends: number[];
    renderHeading: boolean;
  };
export type SelectOptionPayload = {
  description?: string;
  id: number;
  name: string;
  renderedText?: string;
};
export type SelectVariablePayload = {
  type: 'Select';
} & VariablePayloadBase & {
    isMultiple: boolean;
    options: SelectOptionPayload[];
  };
export type TextVariablePayload = {
  type: 'Text';
} & VariablePayloadBase & {
    textType: 'SingleLine' | 'MultiLine';
  };
export type TableColumnPayload = {
  isHeader: boolean;
  variable:
    | DateVariablePayload
    | EmailVariablePayload
    | ImageVariablePayload
    | LinkVariablePayload
    | NumberVariablePayload
    | SectionVariablePayload
    | SelectVariablePayload
    | TableVariablePayload
    | TextVariablePayload;
};
export type TableVariablePayload = {
  type: 'Table';
} & VariablePayloadBase & {
    columns: TableColumnPayload[];
    tableStyle: 'Horizontal' | 'Vertical';
  };
export type GetVariableWorkflowHistoryResponsePayload = {
  history: VariableWorkflowHistoryElement[];
  status: SuccessOrError;
  variable:
    | DateVariablePayload
    | EmailVariablePayload
    | ImageVariablePayload
    | LinkVariablePayload
    | NumberVariablePayload
    | SectionVariablePayload
    | SelectVariablePayload
    | TableVariablePayload
    | TextVariablePayload;
};
export type ListVariablesResponsePayload = {
  status: SuccessOrError;
  variables: (
    | DateVariablePayload
    | EmailVariablePayload
    | ImageVariablePayload
    | LinkVariablePayload
    | NumberVariablePayload
    | SectionVariablePayload
    | SelectVariablePayload
    | TableVariablePayload
    | TextVariablePayload
  )[];
};
export const {
  useListVariableOwnersQuery,
  useLazyListVariableOwnersQuery,
  useUpdateVariableOwnerMutation,
  useUpdateVariableWorkflowDetailsMutation,
  useGetVariableWorkflowHistoryQuery,
  useLazyGetVariableWorkflowHistoryQuery,
  useListVariablesQuery,
  useLazyListVariablesQuery,
} = injectedRtkApi;
