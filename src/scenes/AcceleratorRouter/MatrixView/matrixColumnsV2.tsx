import React from 'react';

import {
  EditableTableCellContextV2,
  EditableTableColumnV2,
  EditableTableEditContextV2,
} from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { VariableUnion } from 'src/types/documentProducer/Variable';

import DateEditor from './editors/DateEditor';
import MultiSelectEditor from './editors/MultiSelectEditor';
import SelectEditor from './editors/SelectEditor';
import TextEditor from './editors/TextEditor';
import {
  MatrixRow,
  MatrixValue,
  SaveMatrixValue,
  getMatrixOptionIds,
  getMatrixValue,
  renderMatrixValue,
} from './matrixValues';

export const matchesMatrixSelection = (row: MatrixRow, stableId: string, value: unknown) => {
  const selected = Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : [];
  const options = row.variables?.find((variable) => variable.stableId === stableId)?.values?.[0]?.options ?? [];
  return !selected.length || selected.some((name) => options.some((option) => option.name === name));
};

type MatrixColumnsArgs = {
  variableIds: string[];
  variables: VariableUnion[];
  countryNames: string[];
  dateLocale: string;
  canEdit: boolean;
  save: SaveMatrixValue;
};

export const buildMatrixColumnsV2 = ({
  variableIds,
  variables,
  countryNames,
  dateLocale,
  canEdit,
  save,
}: MatrixColumnsArgs): EditableTableColumnV2<MatrixRow>[] => {
  const base: EditableTableColumnV2<MatrixRow>[] = [
    {
      id: 'projectName',
      header: strings.DEAL_NAME,
      accessorKey: 'acceleratorDetails_dealName',
      size: 200,
      enableEditing: false,
      enableHiding: false,
      filterVariant: 'text',
      Cell: ({ cell, row }: EditableTableCellContextV2<MatrixRow>) => (
        <Link fontSize='16px' to={APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', String(row.original.id))}>
          {String(cell.getValue() ?? '')}
        </Link>
      ),
    },
    {
      id: 'phase',
      header: strings.PHASE,
      accessorKey: 'phase',
      size: 200,
      enableEditing: false,
      filterVariant: 'text',
    },
    {
      id: 'eligibleLand',
      header: strings.ELIGIBLE_LAND,
      accessorKey: 'acceleratorDetails_confirmedReforestableLand(raw)',
      size: 200,
      enableEditing: false,
      filterVariant: 'range',
      Cell: ({ cell }) => renderMatrixValue(cell.getValue(), dateLocale),
    },
    {
      id: 'countryName',
      header: strings.COUNTRY,
      accessorKey: 'country_name',
      size: 200,
      enableEditing: false,
      filterVariant: 'select',
      filterSelectOptions: countryNames,
    },
    {
      id: 'projectLead',
      header: strings.PROJECT_LEAD,
      size: 200,
      enableEditing: false,
      filterVariant: 'text',
      accessorFn: (row) =>
        row.internalUsers?.[0]?.user_firstName
          ? `${row.internalUsers[0].user_firstName} ${row.internalUsers[0].user_lastName}`
          : '',
    },
  ];
  const variableColumns = variableIds.map((stableId): EditableTableColumnV2<MatrixRow> => {
    const definition = variables.find((variable) => variable.stableId === stableId);
    const select = definition?.type === 'Select' ? definition : undefined;
    const options =
      select?.options.map((option) => ({ label: option.renderedText ?? option.name, value: String(option.id) })) ?? [];
    const persist = (row: MatrixRow, value: MatrixValue) => {
      const variable = row.variables?.find((candidate) => candidate.stableId === stableId) ?? definition;
      return variable ? save(row.id, value, variable) : Promise.resolve();
    };
    const Edit = ({ cell, row, cancel }: EditableTableEditContextV2<MatrixRow>) => {
      const saveValue = (nextValue: MatrixValue) => persist(row.original, nextValue);
      if (select) {
        const ids = getMatrixOptionIds(row.original, stableId);
        return select.isMultiple ? (
          <MultiSelectEditor value={ids} options={options} save={saveValue} cancel={cancel} />
        ) : (
          <SelectEditor value={ids[0] ?? ''} options={options} save={saveValue} cancel={cancel} />
        );
      }
      const value = String(cell.getValue() ?? '');
      if (definition?.type === 'Date') {
        return <DateEditor value={value} save={saveValue} cancel={cancel} />;
      }
      return (
        <TextEditor
          value={value}
          save={saveValue}
          cancel={cancel}
          type={
            definition?.type === 'Number'
              ? 'number'
              : definition?.type === 'Link'
                ? 'url'
                : definition?.type === 'Email'
                  ? 'email'
                  : 'text'
          }
        />
      );
    };
    return {
      id: stableId,
      header: definition?.name ?? stableId,
      size: 150,
      accessorFn: (row) => getMatrixValue(row, stableId),
      Cell: ({ cell }) => renderMatrixValue(cell.getValue(), dateLocale),
      enableEditing:
        canEdit &&
        !!definition &&
        !definition.isList &&
        ['Text', 'Number', 'Select', 'Date', 'Link', 'Email'].includes(definition.type),
      filterVariant: select
        ? 'multi-select'
        : definition?.type === 'Number'
          ? 'range'
          : definition?.type === 'Date'
            ? 'date-range'
            : 'text',
      filterSelectOptions: select?.options.map((option) => option.name),
      filterFn: select ? matchesMatrixSelection : undefined,
      editConfig: {
        editVariant: 'custom',
        customEditComponent: Edit,
        onSave: (row, value) => persist(row, Array.isArray(value) ? value.map(String) : String(value ?? '')),
      },
    };
  });
  return [...base, ...variableColumns];
};
