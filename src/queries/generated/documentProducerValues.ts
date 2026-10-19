import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadProjectImageValue: build.mutation<UploadProjectImageValueApiResponse, UploadProjectImageValueApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/projects/${queryArg.projectId}/images`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    getProjectImageValue: build.query<GetProjectImageValueApiResponse, GetProjectImageValueApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/projects/${queryArg.projectId}/images/${queryArg.valueId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
    listProjectVariableValues: build.query<ListProjectVariableValuesApiResponse, ListProjectVariableValuesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/projects/${queryArg.projectId}/values`,
        params: {
          deliverableId: queryArg.deliverableId,
          minValueId: queryArg.minValueId,
          maxValueId: queryArg.maxValueId,
          stableId: queryArg.stableId,
          variableId: queryArg.variableId,
        },
      }),
    }),
    updateProjectVariableValues: build.mutation<
      UpdateProjectVariableValuesApiResponse,
      UpdateProjectVariableValuesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/projects/${queryArg.projectId}/values`,
        method: 'POST',
        body: queryArg.updateVariableValuesRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type UploadProjectImageValueApiResponse = /** status 200 OK */ UploadImageFileResponsePayload;
export type UploadProjectImageValueApiArg = {
  projectId: number;
  body: {
    caption?: string;
    citation?: string;
    file: Blob;
    /** If the variable is a list, which list position to use for the value. If not specified, the server will use the next available list position if the variable is a list, or will replace any existing image if the variable is not a list. */
    listPosition?: number;
    /** If the variable is a table column, value ID of the row the value should belong to. */
    rowValueId?: number;
    variableId: number;
  };
};
export type GetProjectImageValueApiResponse = /** status 200 OK */ Blob;
export type GetProjectImageValueApiArg = {
  projectId: number;
  valueId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type ListProjectVariableValuesApiResponse = /** status 200 OK */ ListVariableValuesResponsePayload;
export type ListProjectVariableValuesApiArg = {
  projectId: number;
  /** If specified, only return values that belong to variables that are associated to the given ID */
  deliverableId?: number;
  /** If specified, only return values with this ID or higher. Use this to poll for incremental updates to a document. Incremental results may include values of type 'Deleted' in cases where, e.g., elements have been removed from a list. */
  minValueId?: number;
  /** If specified, only return values with this ID or lower. Use this to retrieve saved document versions. */
  maxValueId?: number;
  /** If specified, return the value of the variable with this stable ID. May be specified more than once to return values for multiple variables. Ignored if variableId is specified. */
  stableId?: string[];
  /** If specified, return the value of this variable. May be specified more than once to return values for multiple variables. */
  variableId?: number[];
};
export type UpdateProjectVariableValuesApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateProjectVariableValuesApiArg = {
  projectId: number;
  updateVariableValuesRequestPayload: UpdateVariableValuesRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
export type UploadImageFileResponsePayload = {
  status: SuccessOrError;
  valueId: number;
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
export type ExistingVariableValuesPayload = {
  /** User-visible feedback from reviewer. Not populated for table cell values. */
  feedback?: string;
  /** Internal comment from reviewer. Only populated if the current user has permission to read internal comments. Not populated for table cell values. */
  internalComment?: string;
  /** If this is the value of a table cell, the ID of the row it's part of. */
  rowValueId?: number;
  /** Current status of this variable. Not populated for table cell values. */
  status?:
    | 'Not Submitted'
    | 'In Review'
    | 'Needs Translation'
    | 'Approved'
    | 'Rejected'
    | 'Not Needed'
    | 'Incomplete'
    | 'Complete';
  /** Values of this variable or this table cell. When getting the full set of values for a document, this will be the complete list of this variable's values in order of list position. When getting incremental changes to a document, this is only the items that have changed, and existing items won't be present. For example, if a variable is a list and has 3 values, and a fourth value is added, the incremental list of values in this payload will have one item and its list position will be 3 (since lists are 0-indexed). */
  values: (
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
  variableId: number;
};
export type ListVariableValuesResponsePayload = {
  /** The next unused value ID. You can pass this back to the endpoint as the minValueId parameter to poll for newly-updated values. */
  nextValueId: number;
  status: SuccessOrError;
  /** Variable values organized by variable ID and table row. If you are getting incremental values (that is, you passed minValueId to the endpoint) this list may include values of type "Deleted" to indicate that existing values were deleted and not replaced with new values. */
  values: ExistingVariableValuesPayload[];
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type ValueOperationPayloadBase = {
  existingValueId?: number;
  operation: string;
};
export type NewValuePayloadBase = {
  type: string;
};
export type NewDateValuePayload = {
  type: 'Date';
} & NewValuePayloadBase & {
    citation?: string;
    dateValue: string;
  };
export type NewEmailValuePayload = {
  type: 'Email';
} & NewValuePayloadBase & {
    citation?: string;
    emailValue: string;
  };
export type NewImageValuePayload = {
  type: 'Image';
} & NewValuePayloadBase & {
    caption?: string;
    citation?: string;
  };
export type NewLinkValuePayload = {
  type: 'Link';
} & NewValuePayloadBase & {
    citation?: string;
    title?: string;
    url: string;
  };
export type NewNumberValuePayload = {
  type: 'Number';
} & NewValuePayloadBase & {
    citation?: string;
    numberValue: number;
  };
export type NewSectionTextValuePayload = {
  type: 'SectionText';
} & NewValuePayloadBase & {
    /** Citation for this chunk of text. If you want text with multiple citations at different positions, you can split it into multiple text values and put a citation on each of them. */
    citation?: string;
    textValue: string;
  };
export type NewSectionVariableValuePayload = {
  type: 'SectionVariable';
} & NewValuePayloadBase & {
    displayStyle?: 'Inline' | 'Block';
    usageType: 'Injection' | 'Reference';
    variableId: number;
  };
export type NewSelectValuePayload = {
  type: 'Select';
} & NewValuePayloadBase & {
    citation?: string;
    optionIds: number[];
  };
export type NewTableValuePayload = {
  type: 'Table';
} & NewValuePayloadBase & {
    /** Citations on table values can be used if you want a citation that is associated with the table as a whole rather than with individual cells, or if you want a citation on an empty table: append a row with no column values but with a citation. */
    citation?: string;
  };
export type NewTextValuePayload = {
  type: 'Text';
} & NewValuePayloadBase & {
    citation?: string;
    textValue: string;
  };
export type AppendValueOperationPayload = {
  operation: 'Append';
} & ValueOperationPayloadBase & {
    /** If the variable is a table column and the new value should be appended to an existing row, the existing row's value ID. */
    rowValueId?: number;
    value:
      | NewDateValuePayload
      | NewEmailValuePayload
      | NewImageValuePayload
      | NewLinkValuePayload
      | NewNumberValuePayload
      | NewSectionTextValuePayload
      | NewSectionVariableValuePayload
      | NewSelectValuePayload
      | NewTableValuePayload
      | NewTextValuePayload;
    variableId: number;
  };
export type DeleteValueOperationPayload = {
  operation: 'Delete';
} & ValueOperationPayloadBase & {
    valueId: number;
  };
export type ReplaceValuesOperationPayload = {
  operation: 'Replace';
} & ValueOperationPayloadBase & {
    /** If the variable is a table column, the value ID of the row whose values should be replaced. */
    rowValueId?: number;
    values: (
      | NewDateValuePayload
      | NewEmailValuePayload
      | NewImageValuePayload
      | NewLinkValuePayload
      | NewNumberValuePayload
      | NewSectionTextValuePayload
      | NewSectionVariableValuePayload
      | NewSelectValuePayload
      | NewTableValuePayload
      | NewTextValuePayload
    )[];
    variableId: number;
  };
export type UpdateValueOperationPayload = {
  operation: 'Update';
} & ValueOperationPayloadBase & {
    value:
      | NewDateValuePayload
      | NewEmailValuePayload
      | NewImageValuePayload
      | NewLinkValuePayload
      | NewNumberValuePayload
      | NewSectionTextValuePayload
      | NewSectionVariableValuePayload
      | NewSelectValuePayload
      | NewTableValuePayload
      | NewTextValuePayload;
    valueId: number;
  };
export type UpdateVariableValuesRequestPayload = {
  /** List of operations to perform on the document's values. The operations are applied in order, and atomically: if any of them fail, none of them will be applied. */
  operations: (
    | AppendValueOperationPayload
    | DeleteValueOperationPayload
    | ReplaceValuesOperationPayload
    | UpdateValueOperationPayload
  )[];
  /** Whether to update variable statuses. Defaults to true. Accelerator admins can bypass the status updates by setting the flag to false. */
  updateStatuses?: boolean;
};
export const {
  useUploadProjectImageValueMutation,
  useGetProjectImageValueQuery,
  useLazyGetProjectImageValueQuery,
  useListProjectVariableValuesQuery,
  useLazyListProjectVariableValuesQuery,
  useUpdateProjectVariableValuesMutation,
} = injectedRtkApi;
