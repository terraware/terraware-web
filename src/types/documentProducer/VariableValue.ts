import { operations } from 'src/api/types/generated-schema';
import {
  AppendValueOperationPayload,
  DeleteValueOperationPayload,
  ListVariableValuesResponsePayload,
  NewDateValuePayload,
  NewEmailValuePayload,
  NewLinkValuePayload,
  NewNumberValuePayload,
  NewSectionTextValuePayload,
  NewSectionVariableValuePayload,
  NewSelectValuePayload,
  NewTextValuePayload,
  ReplaceValuesOperationPayload,
  UpdateValueOperationPayload,
  UpdateVariableValuesRequestPayload,
} from 'src/queries/generated/documentProducerValues';
import {
  ExistingDateValuePayload,
  ExistingDeletedValuePayload,
  ExistingEmailValuePayload,
  ExistingImageValuePayload,
  ExistingLinkValuePayload,
  ExistingNumberValuePayload,
  ExistingSectionTextValuePayload,
  ExistingSectionVariableValuePayload,
  ExistingSelectValuePayload,
  ExistingTableValuePayload,
  ExistingTextValuePayload,
} from 'src/queries/generated/documentProducerVariables';

export type VariableValuesListResponse = ListVariableValuesResponsePayload;

export type VariableValue = VariableValuesListResponse['values'][0];

export type VariableValueValue = VariableValuesListResponse['values'][0]['values'][0];

export type DateVariableValue = ExistingDateValuePayload;
export const isDateVariableValue = (input: unknown): input is DateVariableValue =>
  !!(input as DateVariableValue)?.dateValue;

export type DeletedVariableValue = ExistingDeletedValuePayload;

type EmailVariableValue = ExistingEmailValuePayload;

export type ImageVariableValue = ExistingImageValuePayload;

export type LinkVariableValue = ExistingLinkValuePayload;
export const isLinkVariableValue = (input: unknown): input is LinkVariableValue => !!(input as LinkVariableValue)?.url;

export type NumberVariableValue = ExistingNumberValuePayload;
export const isNumberVariableValue = (input: unknown): input is NumberVariableValue =>
  (input as NumberVariableValue)?.numberValue !== undefined;

export type SectionTextVariableValue = ExistingSectionTextValuePayload;
export const isSectionTextVariableValue = (input: unknown): input is SectionTextVariableValue =>
  (input as SectionTextVariableValue)?.type === 'SectionText';

export type SectionVariableVariableValue = ExistingSectionVariableValuePayload;
export const isSectionVariableVariableValue = (input: unknown): input is SectionVariableVariableValue =>
  (input as SectionVariableVariableValue)?.type === 'SectionVariable';

export type SelectVariableValue = ExistingSelectValuePayload;
export const isSelectVariableValue = (input: unknown): input is SelectVariableValue =>
  !!(input as SelectVariableValue)?.optionValues;

export type TableVariableValue = ExistingTableValuePayload;

export type TextVariableValue = ExistingTextValuePayload;
export const isTextVariableValue = (input: unknown): input is TextVariableValue =>
  !!(input as TextVariableValue)?.textValue;

export type ExistingVariableValueUnion =
  | DateVariableValue
  | DeletedVariableValue
  | EmailVariableValue
  | ImageVariableValue
  | LinkVariableValue
  | NumberVariableValue
  | SectionTextVariableValue
  | SectionVariableVariableValue
  | SelectVariableValue
  | TableVariableValue
  | TextVariableValue;

export type NewNonSectionValuePayloadUnion =
  | NewDateValuePayload
  | NewEmailValuePayload
  | NewLinkValuePayload
  | NewNumberValuePayload
  | NewSelectValuePayload
  | NewTextValuePayload;

// This is supposed to be SectionVariableWithValues & VariableValueValue but the types don't exactly line up
export type CombinedInjectedValue = {
  rowValueId?: number;
  citation?: string;
  values: ExistingVariableValueUnion[];
  id: number;
  listPosition: number;
  type:
    | 'Deleted'
    | 'Date'
    | 'Email'
    | 'Image'
    | 'Link'
    | 'Number'
    | 'SectionText'
    | 'SectionVariable'
    | 'Select'
    | 'Table'
    | 'Text';
  variableId: number;
  usageType?: 'Injection' | 'Reference';
};

export type VariableValueTextValue = ExistingTextValuePayload;

export type VariableValueNumberValue = ExistingNumberValuePayload;

export type VariableValueImageValue = ExistingImageValuePayload;

export type VariableValueTableValue = ExistingTableValuePayload;

export type UpdateVariableValueOperation = UpdateValueOperationPayload;

export type VariableValueSelectValue = ExistingSelectValuePayload;

export type VariableValueDateValue = ExistingDateValuePayload;

export type VariableValueEmailValue = ExistingEmailValuePayload;

export type VariableValueLinkValue = ExistingLinkValuePayload;

export type UpdateVariableValuesRequestWithProjectId = UpdateVariableValuesRequestPayload & {
  projectId: number;
};

export type DeleteVariableValueOperation = DeleteValueOperationPayload;

export type Operation =
  | AppendValueOperationPayload
  | DeleteValueOperationPayload
  | ReplaceValuesOperationPayload
  | UpdateValueOperationPayload;

type OriginalUploadImageValue = Required<
  operations['uploadProjectImageValue']
>['requestBody']['content']['application/json'];

// Change type for file attribute from string to File, because that is how we process it in the frontend
type UploadImageValueRequestPayload = Omit<OriginalUploadImageValue, 'file'> & { file: File };

export type UploadImageValueRequestPayloadWithProjectId = UploadImageValueRequestPayload & {
  projectId: number;
};

export type AppendVariableValueOperation = Omit<AppendValueOperationPayload, 'value'> & {
  value: NewNonSectionValuePayloadUnion;
};

export type ReplaceSectionValuesOperationPayloadWithProjectId = Omit<ReplaceValuesOperationPayload, 'values'> & {
  projectId: number;
  values: (NewSectionTextValuePayload | NewSectionVariableValuePayload)[];
};

export type {
  NewTextValuePayload,
  NewNumberValuePayload,
  NewSelectValuePayload,
  NewDateValuePayload,
  NewEmailValuePayload,
  NewLinkValuePayload,
  UpdateVariableValuesRequestPayload,
  NewSectionTextValuePayload,
  NewSectionVariableValuePayload,
};
