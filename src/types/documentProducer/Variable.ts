import { isArray } from 'lodash';

import { components } from 'src/api/types/generated-schema';
import {
  DateVariablePayload,
  EmailVariablePayload,
  GetVariableWorkflowHistoryResponsePayload,
  ImageVariablePayload,
  LinkVariablePayload,
  ListVariableOwnersResponsePayload,
  ListVariablesResponsePayload,
  NumberVariablePayload,
  SectionVariablePayload,
  SelectOptionPayload,
  SelectVariablePayload,
  TableVariablePayload,
  TextVariablePayload,
  UpdateVariableOwnerRequestPayload,
  UpdateVariableWorkflowDetailsRequestPayload,
} from 'src/queries/generated/documentProducerVariables';

import { VariableValue, VariableValueImageValue, VariableValueTableValue, VariableValueValue } from './VariableValue';

export type VariableListResponse = ListVariablesResponsePayload;

export type Variable = VariableListResponse['variables'][0];

export type VariableType = components['schemas']['ExistingValuePayload']['type'];

type LinkVariable = LinkVariablePayload;

type SectionVariable = SectionVariablePayload;

type DateVariable = DateVariablePayload;

type EmailVariable = EmailVariablePayload;

export type TextVariable = TextVariablePayload;
export const isTextVariable = (input: unknown): input is TableVariable => (input as TextVariable).type === 'Text';

export type ImageVariable = ImageVariablePayload;
export const isImageVariable = (input: unknown): input is ImageVariable => (input as ImageVariable).type === 'Image';

export type TableVariable = TableVariablePayload;
export const isTableVariable = (input: unknown): input is TableVariable => (input as TableVariable).type === 'Table';

export type TableColumn = TableVariablePayload['columns'][0];

type NumberVariable = NumberVariablePayload;

export type SelectVariable = SelectVariablePayload;
export const isSelectVariable = (input: unknown): input is SelectVariable =>
  Array.isArray((input as SelectVariable).options);

export type VariableUnion =
  | TextVariable
  | ImageVariable
  | TableVariable
  | NumberVariable
  | SelectVariable
  | DateVariable
  | EmailVariable
  | LinkVariable
  | SectionVariable;

export type Section = SectionVariablePayload;

export type TableColumnWithValues = Omit<TableColumn, 'variable'> & {
  variable: VariableWithValues;
};

export type VariableWithValues = Variable & {
  values: VariableValueValue[];
  variableValues: VariableValue[];
};

export type ImageVariableWithValues = ImageVariable & {
  values: VariableValueImageValue[];
  variableValues: VariableValue[];
};

export type TableVariableWithValues = TableVariable & {
  values: VariableValueTableValue[];
  variableValues: VariableValue[];
};
export const isTableVariableWithValues = (input: unknown): input is TableVariableWithValues =>
  !!(input as TableVariableWithValues).columns;

export type SectionVariableWithValues = Section & {
  values: VariableValueValue[] | undefined;
  sectionNumber: string | undefined;
  parentSectionNumber: string | undefined;
  variableValues: VariableValue[];
  variableValueVariables?: VariableUnion[];
  children: SectionVariableWithValues[];
};

export const isSectionVariableWithValues = (input: unknown): input is SectionVariableWithValues =>
  !!(
    input &&
    (input as SectionVariableWithValues).type === 'Section' &&
    isArray((input as SectionVariableWithValues).children)
  );

export type GetVariableHistoryResponse = GetVariableWorkflowHistoryResponsePayload;

export type UpdateVariableWorkflowDetailsPayload = UpdateVariableWorkflowDetailsRequestPayload;

export type UpdateVariableOwnerPayload = UpdateVariableOwnerRequestPayload;

export type VariableStatusType = UpdateVariableWorkflowDetailsRequestPayload['status'];

export const NonSectionVariableStatuses: VariableStatusType[] = [
  'Approved',
  'In Review',
  'Needs Translation',
  'Not Needed',
  'Not Submitted',
  'Rejected',
];

export type VariableOwnersListResponse = ListVariableOwnersResponsePayload;

export type VariableOwners = ListVariableOwnersResponsePayload['variables'][0];

export type DependencyCondition = VariableWithValues['dependencyCondition'];
export const DependencyConditions: DependencyCondition[] = ['gt', 'gte', 'lt', 'lte', 'eq', 'neq'];

export type { SelectOptionPayload };
