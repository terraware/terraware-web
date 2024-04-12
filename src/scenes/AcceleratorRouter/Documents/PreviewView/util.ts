import {
  SectionVariableWithValues,
  Variable,
  VariableUnion,
  VariableWithValues,
} from 'src/types/documentProducer/Variable';
import { CombinedInjectedValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';
import { memoize } from 'src/utils/memoize';

export const getSourceVariable = memoize(
  (
    combinedInjectedValue: CombinedInjectedValue,
    sectionVariable: SectionVariableWithValues
  ): VariableUnion | undefined =>
    (sectionVariable.variableValueVariables || ([] as VariableUnion[])).find(
      (variable: Variable) => variable.id === combinedInjectedValue.variableId
    )
);

const variableInSectionHierarchy = (
  variable: VariableWithValues,
  sectionVariable: SectionVariableWithValues
): boolean => {
  return !!(
    (sectionVariable.values || []).find(
      (value: VariableValueValue) => 'variableId' in value && value.variableId === variable.id
    ) ||
    sectionVariable.children.some((child: SectionVariableWithValues) => variableInSectionHierarchy(variable, child))
  );
};

export const getRelevantVariables = (
  sectionVariable: SectionVariableWithValues,
  variables: VariableWithValues[]
): VariableWithValues[] => variables.filter((variable) => variableInSectionHierarchy(variable, sectionVariable));

// This function mutates the variable and adds the new variable count
const calculateFiguresForSection = (
  sectionVariable: SectionVariableWithValues,
  variables: VariableWithValues[],
  variableType: 'Image' | 'Table',
  currentFigure: number
): number => {
  let newCurrentFigure = currentFigure;

  const isLeaf = sectionVariable.children.length === 0;
  if (isLeaf) {
    // If this is a leaf section, check to see if we Add figure to all "figured" children (table | image)
    for (const value of sectionVariable.values || []) {
      if (value.type === 'SectionVariable' && value.usageType === 'Injection') {
        const relevantVariables = getRelevantVariables(sectionVariable, variables);
        for (const variable of relevantVariables) {
          if (variable.type === variableType && !(variable as any).figure) {
            (variable as any).figure = ++newCurrentFigure;
          }
        }
      }
    }
  } else {
    for (const childSection of sectionVariable.children) {
      newCurrentFigure = calculateFiguresForSection(childSection, variables, variableType, newCurrentFigure);
    }
  }

  return newCurrentFigure;
};

// Mutates all applicable variables and adds the variable count
export const calculateFigures = (
  sectionVariables: SectionVariableWithValues[],
  variables: VariableWithValues[],
  variableType: 'Image' | 'Table'
): void => {
  let currentFigure = 0;

  for (const sectionVariable of sectionVariables) {
    currentFigure = calculateFiguresForSection(sectionVariable, variables, variableType, currentFigure);
  }
};
