import {
  SectionVariableWithValues,
  TableColumnWithValues,
  Variable,
  VariableUnion,
  VariableWithValues,
} from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

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
        variable: associateValues(col.variable, values, variableList) as VariableWithValues,
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
        variable: associateNonSectionVariableValues(col.variable, values, variableList),
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

export const associateDocumentVariableValues = (
  variables: VariableUnion[],
  values: VariableValue[]
): (VariableWithValues | SectionVariableWithValues)[] => {
  let topLevelSectionPosition = 0;
  return variables.map((variable: Variable) => {
    if (variable.type === 'Section' && variable.renderHeading) {
      topLevelSectionPosition++;
    }
    return associateValues(variable, values, variables, topLevelSectionPosition);
  });
};

export const associateVariableValues = (variables: VariableUnion[], values: VariableValue[]): VariableWithValues[] =>
  variables.map((variable: Variable) => associateNonSectionVariableValues(variable, values, variables));
