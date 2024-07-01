import { isArray } from 'lodash';

import { components } from 'src/api/types/generated-schema';

import { VariableValue, VariableValueImageValue, VariableValueTableValue, VariableValueValue } from './VariableValue';

export type VariableListResponse = components['schemas']['ListVariablesResponsePayload'];

export type Variable = VariableListResponse['variables'][0];

export type VariableType = components['schemas']['ExistingValuePayload']['type'];

export type Column = components['schemas']['TableColumnPayload'];

export type LinkVariable = components['schemas']['LinkVariablePayload'];

export type SectionVariable = components['schemas']['SectionVariablePayload'];

export type DateVariable = components['schemas']['DateVariablePayload'];

export type TextVariable = components['schemas']['TextVariablePayload'];

export type ImageVariable = components['schemas']['ImageVariablePayload'];
export const isImageVariable = (input: unknown): input is ImageVariable => (input as ImageVariable).type === 'Image';

export type TableVariable = components['schemas']['TableVariablePayload'];
export const isTableVariable = (input: unknown): input is TableVariable => (input as TableVariable).type === 'Table';

export type TableColumn = components['schemas']['TableVariablePayload']['columns'][0];

export type NumberVariable = components['schemas']['NumberVariablePayload'];

export type SelectVariable = components['schemas']['SelectVariablePayload'];
export const isSelectVariable = (input: unknown): input is SelectVariable =>
  Array.isArray((input as SelectVariable).options);

export type VariableUnion =
  | TextVariable
  | ImageVariable
  | TableVariable
  | NumberVariable
  | SelectVariable
  | DateVariable
  | LinkVariable
  | SectionVariable;

export type Section = components['schemas']['SectionVariablePayload'];

export type SelectOptionPayload = components['schemas']['SelectOptionPayload'];

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

export type ImageFile = {
  url: string;
  id: string;
  caption?: string;
  citation?: string;
};
