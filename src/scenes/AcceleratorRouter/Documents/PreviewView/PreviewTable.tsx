import React from 'react';

import {
  SectionVariableWithValues,
  TableColumnWithValues,
  TableVariable,
  TableVariableWithValues,
  VariableUnion,
  VariableWithValues,
  isTableVariable,
  isTableVariableWithValues,
} from 'src/types/documentProducer/Variable';
import { CombinedInjectedValue, VariableValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';

import { getPrintValue } from './render';
import { SectionVariableWithRelevantVariables, getSourceVariable } from './util';

export const getSourceTableVariable = (
  combinedInjectedValue: CombinedInjectedValue,
  sectionVariable: SectionVariableWithValues
): TableVariable | false => {
  const sourceVariable: VariableUnion | undefined = getSourceVariable(combinedInjectedValue, sectionVariable);
  return isTableVariable(sourceVariable) ? sourceVariable : false;
};

type PreviewTableProps = {
  combinedInjectedValue: CombinedInjectedValue;
  sectionVariable: SectionVariableWithRelevantVariables;
  sourceTableVariable: TableVariable;
  suppressCaptions?: boolean;
};

type PreviewTableRenderProps = {
  combinedInjectedValue: CombinedInjectedValue;
  sectionVariable: SectionVariableWithValues;
  relevantTableVariable: TableVariableWithValues;
  rows: VariableValue[][];
};

const PreviewTableHorizontal = ({
  combinedInjectedValue,
  sectionVariable,
  relevantTableVariable,
  rows,
}: PreviewTableRenderProps): React.ReactElement<any> => {
  return (
    <table>
      <thead>
        <tr>
          {relevantTableVariable.columns.map((tableColumn, index: number) => (
            <th key={index}>{tableColumn.variable.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((tableColumn: VariableValue[], index: number) => (
          <tr key={index}>
            {tableColumn.map((cell: VariableValue, _index: number) => {
              return (
                <td key={_index}>
                  {(cell?.values || []).map((value) => getPrintValue(combinedInjectedValue, value, sectionVariable))}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PreviewTableVertical = ({
  combinedInjectedValue,
  sectionVariable,
  relevantTableVariable,
  rows,
}: PreviewTableRenderProps): React.ReactElement<any> => {
  return (
    <>
      {rows.map((value, index: number) => (
        <table key={index}>
          <tbody>
            {(relevantTableVariable.columns as TableColumnWithValues[]).map(
              (column: TableColumnWithValues, _index: number): React.ReactElement<any> => {
                const rowValue: VariableValue = column.variable.variableValues[index];
                return (
                  <tr key={_index}>
                    <th>{column.variable.name}</th>
                    <td>
                      {rowValue.values.map((valueValue: VariableValueValue) =>
                        getPrintValue(combinedInjectedValue, valueValue, sectionVariable)
                      )}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      ))}
    </>
  );
};

export const PreviewTable = ({
  combinedInjectedValue,
  sectionVariable,
  sourceTableVariable,
  suppressCaptions,
}: PreviewTableProps): React.ReactElement<any> => {
  const relevantTableVariable = sectionVariable.relevantVariables.find(
    (variable: VariableWithValues) => variable.id === sourceTableVariable.id
  );

  if (!relevantTableVariable || !isTableVariableWithValues(relevantTableVariable)) {
    throw new Error('Unable to find relevant table variable');
  }

  if (combinedInjectedValue.usageType === 'Reference') {
    return <span>Table {(relevantTableVariable as any).figure}</span>;
  }

  const rows: VariableValue[][] = relevantTableVariable.values
    .map((row) =>
      (relevantTableVariable.columns as TableColumnWithValues[]).map((column: TableColumnWithValues) =>
        column.variable.variableValues.find((variableValue: VariableValue) => variableValue.rowValueId === row.id)
      )
    )
    // Filter out undefined
    .filter((value): value is VariableValue[] => !!value);

  return (
    <>
      {!suppressCaptions && (
        <p className='table-name'>
          Table {(relevantTableVariable as any).figure} {relevantTableVariable.name}
          {combinedInjectedValue.citation && <span className='footnote'>{combinedInjectedValue.citation}</span>}
        </p>
      )}

      {sourceTableVariable.tableStyle === 'Vertical' ? (
        <PreviewTableVertical
          combinedInjectedValue={combinedInjectedValue}
          sectionVariable={sectionVariable}
          relevantTableVariable={relevantTableVariable}
          rows={rows}
        />
      ) : (
        <PreviewTableHorizontal
          combinedInjectedValue={combinedInjectedValue}
          sectionVariable={sectionVariable}
          relevantTableVariable={relevantTableVariable}
          rows={rows}
        />
      )}
    </>
  );
};
