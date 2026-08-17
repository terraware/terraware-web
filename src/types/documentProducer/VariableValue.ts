import { components, operations } from 'src/api/types/generated-schema';

export type VariableValuesListResponse = components['schemas']['ListVariableValuesResponsePayload'];

export type VariableValue = VariableValuesListResponse['values'][0];

export type VariableValueValue = VariableValuesListResponse['values'][0]['values'][0];

export type DateVariableValue = components['schemas']['ExistingDateValuePayload'];
export const isDateVariableValue = (input: unknown): input is DateVariableValue =>
  !!(input as DateVariableValue)?.dateValue;

export type DeletedVariableValue = components['schemas']['ExistingDeletedValuePayload'];

export type EmailVariableValue = components['schemas']['ExistingEmailValuePayload'];

export type ImageVariableValue = components['schemas']['ExistingImageValuePayload'];

export type LinkVariableValue = components['schemas']['ExistingLinkValuePayload'];
export const isLinkVariableValue = (input: unknown): input is LinkVariableValue => !!(input as LinkVariableValue)?.url;

export type NumberVariableValue = components['schemas']['ExistingNumberValuePayload'];
export const isNumberVariableValue = (input: unknown): input is NumberVariableValue =>
  (input as NumberVariableValue)?.numberValue !== undefined;

export type SectionTextVariableValue = components['schemas']['ExistingSectionTextValuePayload'];
export const isSectionTextVariableValue = (input: unknown): input is SectionTextVariableValue =>
  (input as SectionTextVariableValue)?.type === 'SectionText';

export type SectionVariableVariableValue = components['schemas']['ExistingSectionVariableValuePayload'];
export const isSectionVariableVariableValue = (input: unknown): input is SectionVariableVariableValue =>
  (input as SectionVariableVariableValue)?.type === 'SectionVariable';

export type SelectVariableValue = components['schemas']['ExistingSelectValuePayload'];
export const isSelectVariableValue = (input: unknown): input is SelectVariableValue =>
  !!(input as SelectVariableValue)?.optionValues;

export type TableVariableValue = components['schemas']['ExistingTableValuePayload'];
export const isTableVariableValue = (input: unknown): input is TableVariableValue =>
  (input as TableVariableValue)?.type === 'Table';

export type TextVariableValue = components['schemas']['ExistingTextValuePayload'];
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

export type VariableValueTextValue = components['schemas']['ExistingTextValuePayload'];

export type VariableValueNumberValue = components['schemas']['ExistingNumberValuePayload'];

export type VariableValueImageValue = components['schemas']['ExistingImageValuePayload'];

export type VariableValueTableValue = components['schemas']['ExistingTableValuePayload'];

export type UpdateVariableValueOperation = components['schemas']['UpdateValueOperationPayload'];

export type VariableValueSelectValue = components['schemas']['ExistingSelectValuePayload'];

export type VariableValueDateValue = components['schemas']['ExistingDateValuePayload'];

export type VariableValueEmailValue = components['schemas']['ExistingEmailValuePayload'];

export type VariableValueLinkValue = components['schemas']['ExistingLinkValuePayload'];

export type NewTextValuePayload = components['schemas']['NewTextValuePayload'];

export type NewNumberValuePayload = components['schemas']['NewNumberValuePayload'];

export type NewSelectValuePayload = components['schemas']['NewSelectValuePayload'];

export type NewDateValuePayload = components['schemas']['NewDateValuePayload'];

export type NewEmailValuePayload = components['schemas']['NewEmailValuePayload'];

export type NewLinkValuePayload = components['schemas']['NewLinkValuePayload'];

export type UpdateVariableValuesRequestWithProjectId = UpdateVariableValuesRequestPayload & {
  projectId: number;
};

export type DeleteVariableValueOperation = components['schemas']['DeleteValueOperationPayload'];

export type UpdateVariableValuesRequestPayload = components['schemas']['UpdateVariableValuesRequestPayload'];

export type Operation =
  | components['schemas']['AppendValueOperationPayload']
  | components['schemas']['DeleteValueOperationPayload']
  | components['schemas']['ReplaceValuesOperationPayload']
  | components['schemas']['UpdateValueOperationPayload'];

export type OriginalUploadImageValue = Required<
  operations['uploadProjectImageValue']
>['requestBody']['content']['application/json'];

// Change type for file attribute from string to File, because that is how we process it in the frontend
export type UploadImageValueRequestPayload = Omit<OriginalUploadImageValue, 'file'> & { file: File };

export type UploadImageValueRequestPayloadWithProjectId = UploadImageValueRequestPayload & {
  projectId: number;
};

export type AppendVariableValueOperation = Omit<components['schemas']['AppendValueOperationPayload'], 'value'> & {
  value: NewNonSectionValuePayloadUnion;
};

export type NewSectionTextValuePayload = components['schemas']['NewSectionTextValuePayload'];

export type NewSectionVariableValuePayload = components['schemas']['NewSectionVariableValuePayload'];

export type ReplaceSectionValuesOperationPayloadWithProjectId = Omit<
  components['schemas']['ReplaceValuesOperationPayload'],
  'values'
> & {
  projectId: number;
  values: (NewSectionTextValuePayload | NewSectionVariableValuePayload)[];
};
