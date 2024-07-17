/* eslint-disable @typescript-eslint/no-unused-vars */
import createCachedSelector from 're-reselect';

import { RootState } from 'src/redux/rootReducer';
import {
  Section,
  SectionVariableWithValues,
  TableColumnWithValues,
  Variable,
  VariableUnion,
  VariableWithValues,
} from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

import { deliverableCompositeKeyFn } from '../../deliverables/deliverablesSlice';
import { variableListCompositeKeyFn } from '../values/valuesSlice';

export const selectVariables = (state: RootState, manifestId: number | string) =>
  state.documentProducerVariables[manifestId];

export const selectSections = createCachedSelector(
  (state: RootState, manifestId: number) => selectVariables(state, manifestId),
  (response) => {
    if (response?.data) {
      return {
        ...response,
        data: response.data.filter((variable: Variable) => variable.type === 'Section') as Section[],
      };
    } else {
      return response;
    }
  }
)((state: RootState, id: number) => 'sections');

export const searchVariables = createCachedSelector(
  (state: RootState, manifestId: number, query: string) => selectVariables(state, manifestId),
  (state: RootState, id: number, query: string) => query,
  (response, query) => {
    // filter Section, Image and Table variables because we don't want them in the variables table
    const dataResponseToReturn = (response.data || []).filter(
      (variable: Variable) => variable.type !== 'Section' && variable.type !== 'Image' && variable.type !== 'Table'
    );
    if (response?.data && query) {
      const regex = new RegExp(query, 'i');
      const fields = ['name', 'type', 'value'];
      return {
        ...response,
        data: dataResponseToReturn.filter((variable: Variable) =>
          fields.some((field) => `${variable[field as keyof Variable]}`.match(regex))
        ),
      };
    } else {
      return { ...response, data: dataResponseToReturn };
    }
  }
)((state: RootState, id: number, query: string) => query);

export const selectGetVariable = createCachedSelector(
  (state: RootState, manifestId: number | string, variableId: number) => state.documentProducerVariables[manifestId],
  (state: RootState, manifestId: number | string, variableId: number) => manifestId,
  (state: RootState, manifestId: number | string, variableId: number) => variableId,
  (response, manifestId, variableId) => {
    if (response?.data) {
      const variableToReturn = response.data.find((variable: Variable) => variable.id === variableId);
      return {
        ...response,
        data: variableToReturn,
      };
    } else {
      return response;
    }
  }
)((state: RootState, manifestId: number | string, variableId: number) => variableId);

const getCombinedProps = (listA: any, listB: any) => {
  let status = 'pending';
  if (listA.status === 'error' || listB.status === 'error') {
    status = 'error';
  }
  if (listA.status === 'success' && listB.status === 'success') {
    status = 'success';
  }
  if (listA.status === 'partial-success' && listB.status === 'success') {
    status = 'partial-success';
  }
  if (listA.status === 'success' && listB.status === 'partial-success') {
    status = 'partial-success';
  }
  if (listA.status === 'partial-success' && listB.status === 'partial-success') {
    status = 'partial-success';
  }
  const error = listA.error || listB.error;
  return {
    status,
    error,
  };
};

const associateValues = (
  variable: Variable,
  values: VariableValue[],
  variableList: VariableUnion[],
  position?: number,
  parentSection?: string
): VariableWithValues | SectionVariableWithValues => {
  const currentValue = values.find((val: VariableValue) => val.variableId === variable.id);

  const variablesInVariable: number[] = (currentValue?.values || [])
    .map((value) => ('variableId' in value ? value.variableId : false))
    .filter((value): value is number => value === 0 || !!value);

  // Link up the variable values that are referenced within this variable
  const variableValues = values.filter(
    (val) => val.variableId === variable.id || variablesInVariable.includes(val.variableId)
  );

  // Link up the original variable so we can get extra variable specific data needed for rendering the values
  const variableValueVariables: VariableUnion[] = variableList.filter((_variable: Variable) =>
    variablesInVariable.includes(_variable.id)
  );

  if (variable.type === 'Section') {
    const sectionNumber = `${parentSection ? parentSection + '.' : ''}${position ?? '1'}`;
    let children: SectionVariableWithValues[] = [];
    if (variable.children) {
      let subSectionPosition = 0;
      children = variable.children.map((child) => {
        if (child.renderHeading) {
          subSectionPosition++;
        }
        return associateValues(child, values, variableList, subSectionPosition, sectionNumber);
      }) as SectionVariableWithValues[];
    }
    return {
      ...variable,
      children,
      values: currentValue?.values ?? [],
      variableValues,
      variableValueVariables,
      sectionNumber,
      parentSectionNumber: parentSection,
    };
  } else if (variable.type === 'Table') {
    let columns: TableColumnWithValues[] = [];
    if (variable.columns) {
      columns = variable.columns.map((col) => ({
        ...col,
        variable: associateValues(col.variable as Variable, values, variableList) as VariableWithValues,
      }));
    }
    return {
      ...variable,
      columns,
      values: currentValue?.values ?? [],
      variableValues,
    };
  }

  return {
    ...variable,
    values: currentValue?.values ?? [],
    variableValues,
  };
};

export const selectVariablesWithValues = createCachedSelector(
  (state: RootState, manifestId: number | string, projectId: number, maxValueId?: number) =>
    (state.documentProducerVariables as any)[manifestId],
  (state: RootState, manifestId: number | string, projectId: number, maxValueId?: number) =>
    (state.documentProducerVariableValuesList as any)[variableListCompositeKeyFn({ projectId, maxValueId })],
  (variableList, valueList) => {
    if (variableList?.data && valueList?.data) {
      let topLevelSectionPosition = 0;
      const output = variableList.data.map((v: Variable) => {
        if (v.type === 'Section' && v.renderHeading) {
          topLevelSectionPosition++;
        }
        return associateValues(v, valueList.data, variableList.data, topLevelSectionPosition);
      });
      return {
        ...getCombinedProps(variableList, valueList),
        data: output,
      };
    } else {
      return [];
    }
  }
)((state: RootState, manifestId: number | string, projectId: number) => `${projectId}-${manifestId}`);

const associateDeliverableVariableValues = (
  variable: Variable,
  values: VariableValue[],
  variableList: VariableUnion[]
): VariableWithValues => {
  const currentValue = values.find((val: VariableValue) => val.variableId === variable.id);

  const variablesInVariable: number[] = (currentValue?.values || [])
    .map((value) => ('variableId' in value ? value.variableId : false))
    .filter((value): value is number => value === 0 || !!value);

  // Link up the variable values that are referenced within this variable
  const variableValues = values.filter(
    (val) => val.variableId === variable.id || variablesInVariable.includes(val.variableId)
  );

  if (variable.type === 'Table') {
    let columns: TableColumnWithValues[] = [];
    if (variable.columns) {
      columns = variable.columns.map((col) => ({
        ...col,
        variable: associateDeliverableVariableValues(col.variable as Variable, values, variableList),
      }));
    }
    return {
      ...variable,
      columns,
      values: currentValue?.values ?? [],
      variableValues,
    };
  }

  return {
    ...variable,
    values: currentValue?.values ?? [],
    variableValues,
  };
};

export const selectDeliverableVariablesWithValues = createCachedSelector(
  (state: RootState, deliverableId: number, projectId: number) =>
    state.documentProducerDeliverableVariables[deliverableId],
  (state: RootState, deliverableId: number, projectId: number) =>
    state.documentProducerDeliverableVariableValues[deliverableCompositeKeyFn({ deliverableId, projectId })],
  (variableList, valueList) => {
    if (variableList?.data && valueList?.data) {
      const variables = variableList.data;
      const values = valueList.data;

      return variableList.data.map((v: Variable) => associateDeliverableVariableValues(v, values, variables));
    } else {
      return [];
    }
  }
)((state: RootState, deliverableId: number, projectId: number) =>
  deliverableCompositeKeyFn({ deliverableId, projectId })
);

export const selectUpdateVariableWorkflowDetails = (requestId: string) => (state: RootState) =>
  state.variableWorkflowDetailsUpdate[requestId];

export const selectUpdateVariableOwner = (requestId: string) => (state: RootState) =>
  state.variableOwnerUpdate[requestId];

export const selectVariablesOwners = (state: RootState, projectId: number | string) => state.variablesOwners[projectId];
