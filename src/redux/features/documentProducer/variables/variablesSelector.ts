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

import { AsyncRequest, AsyncRequestT, Statuses } from '../../asyncUtils';
import { deliverableCompositeKeyFn } from '../../deliverables/deliverablesSlice';
import { variableListCompositeKeyFn } from '../values/valuesSlice';

export const selectDocumentVariables = (state: RootState, documentId: number | undefined) =>
  documentId ? state.documentProducerDocumentVariables[documentId] : undefined;

export const selectSections = createCachedSelector(
  (state: RootState, documentId: number | undefined) => selectDocumentVariables(state, documentId),
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
)((state: RootState, documentId: number | undefined) => 'sections');

export const searchVariables = createCachedSelector(
  (state: RootState, documentId: number | undefined, query: string) => selectDocumentVariables(state, documentId),
  (state: RootState, documentId: number | undefined, query: string) => query,
  (response, query) => {
    // filter Section, Image and Table variables because we don't want them in the variables table
    const dataResponseToReturn = (response?.data || []).filter(
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
)((state: RootState, documentId: number | undefined, query: string) => query);

export const selectGetVariable = createCachedSelector(
  (state: RootState, variableId: number) => state.documentProducerAllVariables['all'],
  (state: RootState, variableId: number) => variableId,
  (response, variableId) => {
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
)((state: RootState, variableId: number) => variableId);

const getCombinedProps = (listA: any, listB: any): { status: Statuses; error: string | undefined } => {
  let status: Statuses = 'pending';
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

export const selectDocumentVariablesWithValues = createCachedSelector(
  (state: RootState, documentId: number | undefined, projectId: number, maxValueId?: number) =>
    selectDocumentVariables(state, documentId),
  (state: RootState, documentId: number | undefined, projectId: number, maxValueId?: number) =>
    state.documentProducerVariableValuesList[variableListCompositeKeyFn({ projectId, maxValueId })],
  (variableList, valueList): AsyncRequest | undefined => {
    const variables = variableList?.data;
    const values = valueList?.data;

    if (variables && values) {
      let topLevelSectionPosition = 0;
      const output = variables.map((v: Variable) => {
        if (v.type === 'Section' && v.renderHeading) {
          topLevelSectionPosition++;
        }
        return associateValues(v, values, variables, topLevelSectionPosition);
      });
      return {
        ...getCombinedProps(variableList, valueList),
        data: output,
      };
    } else {
      return undefined;
    }
  }
)((state: RootState, documentId: number | undefined, projectId: number) => `${projectId}-${documentId}`);

const associateNonSectionVariableValues = (
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
        variable: associateNonSectionVariableValues(col.variable as Variable, values, variableList),
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

export const selectAllVariablesWithValues = createCachedSelector(
  (state: RootState, projectId: number | undefined, maxValueId?: number) => state.documentProducerAllVariables['all'],
  (state: RootState, projectId: number | undefined, maxValueId?: number) =>
    state.documentProducerVariableValuesList[variableListCompositeKeyFn({ projectId, maxValueId })],
  (variableList, valueList): AsyncRequestT<VariableWithValues[]> | undefined => {
    const variables = variableList?.data;
    const values = valueList?.data;

    if (variables && values) {
      return {
        ...getCombinedProps(variableList, valueList),
        data: variables.map((v: Variable) => associateNonSectionVariableValues(v, values, variables)),
      };
    } else {
      return undefined;
    }
  }
)((state: RootState, projectId: number | undefined, maxValueId?: number) =>
  variableListCompositeKeyFn({ projectId, maxValueId })
);

export const selectDeliverableVariablesWithValues = createCachedSelector(
  (state: RootState, deliverableId: number, projectId: number) =>
    state.documentProducerDeliverableVariables[deliverableId],
  (state: RootState, deliverableId: number, projectId: number) =>
    state.documentProducerDeliverableVariableValues[deliverableCompositeKeyFn({ deliverableId, projectId })],
  (variableList, valueList) => {
    const variables = variableList?.data;
    const values = valueList?.data;

    if (variables && values) {
      return variables.map((v: Variable) => associateNonSectionVariableValues(v, values, variables));
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

export const selectVariablesOwners = (state: RootState, projectId: number | undefined) =>
  projectId ? state.variablesOwners[projectId] : undefined;
