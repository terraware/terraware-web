import { SectionVariableWithValues, VariableUnion, VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  CombinedInjectedValue,
  SectionTextVariableValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';
import { memoize } from 'src/utils/memoize';

export type SectionVariableWithRelevantVariables = SectionVariableWithValues & {
  relevantVariables: VariableWithValues[];
};

export const getSourceVariable = memoize(
  (
    combinedInjectedValue: CombinedInjectedValue,
    sectionVariable: SectionVariableWithRelevantVariables
  ): VariableUnion | undefined => {
    return sectionVariable.relevantVariables.find(
      (variable: VariableWithValues) => variable.id === combinedInjectedValue.variableId
    );
  }
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

// These regexes should be scrutinized, they are well tests but there are always edge cases
export const isMarkdownTableHeaderSeparatorRow = (input: string | undefined): boolean =>
  !!/\|\s*\-\-\-+\s*\|/g.exec(input || '');

const MarkdownTableRowRegex = () => /\|\s*([^|]*?)\s*(?=\|)/g;
export const isMarkdownTableRow = (input: string | undefined): boolean => !!MarkdownTableRowRegex().exec(input || '');

export const getMarkdownTableCellValues = (input: string): string[] => {
  const values: string[] = [];
  let match: RegExpMatchArray | null;
  // To ensure we keep an accurate index
  const regex = MarkdownTableRowRegex();
  while ((match = regex.exec(input)) !== null) {
    values.push(match[1].trim());
  }
  return values;
};

export type VariableValueValueTableDisplay = {
  headers: string[];
  rows: string[][];
};
export const isTableDisplay = (input: unknown): input is VariableValueValueTableDisplay => {
  const cast = input as VariableValueValueTableDisplay;
  return Array.isArray(cast.headers) && Array.isArray(cast.rows);
};

export type PreviewValueDisplayUnion = VariableValueValue | VariableValueValueTableDisplay;

export const collectTablesForPreview = (inputValues: VariableValueValue[]): PreviewValueDisplayUnion[] => {
  // Since a table is made up of several values (several lines of text), if we collect any tables
  // from the values, we will need to ignore lines of text that are part of the already collected table
  const collectedIndices: Map<number, boolean> = new Map();

  const values: PreviewValueDisplayUnion[] = inputValues
    .map((value: VariableValueValue, index): PreviewValueDisplayUnion | null => {
      if (collectedIndices.get(index)) {
        return null;
      }

      const headerRow = value as SectionTextVariableValue;
      if (!headerRow.textValue || !isMarkdownTableRow(headerRow.textValue)) {
        return value;
      }

      let nextIndex = inputValues.indexOf(value) + 1;

      // If this is a table row, and the next input value is a separator, then we need to
      // collect the entire table as a single element
      const separatorRow = inputValues[nextIndex] as SectionTextVariableValue;
      if (!separatorRow.textValue || !isMarkdownTableHeaderSeparatorRow(separatorRow.textValue)) {
        return value;
      }

      // Since the separator row will be part of the table element, we can ignore it as a top level element
      collectedIndices.set(nextIndex, true);

      const tableElement: VariableValueValueTableDisplay = {
        headers: getMarkdownTableCellValues(headerRow.textValue),
        rows: [],
      };

      let nextValue: VariableValueValue | undefined = inputValues[++nextIndex] as SectionTextVariableValue;

      while (nextValue && isMarkdownTableRow(nextValue.textValue)) {
        // Since each row will be part of the table element, we can ignore it as a top level element
        collectedIndices.set(nextIndex, true);
        // Push the row and values to the table element
        tableElement.rows.push(getMarkdownTableCellValues(nextValue.textValue));

        nextValue = inputValues[++nextIndex] as SectionTextVariableValue;
      }

      return tableElement;
    })
    .filter((value: PreviewValueDisplayUnion | null): value is PreviewValueDisplayUnion => !!value);

  return values;
};
