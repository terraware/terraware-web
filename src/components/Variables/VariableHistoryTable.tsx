import React, { type JSX, useEffect, useMemo } from 'react';

import { BusySpinner } from '@terraware/web-components';

import { BaseTable as Table } from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { useLocalization } from 'src/providers';
import { selectVariableHistory } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestGetVariableHistory } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { SelectOptionPayload } from 'src/types/documentProducer/Variable';
import {
  VariableValueDateValue,
  VariableValueEmailValue,
  VariableValueImageValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
} from 'src/types/documentProducer/VariableValue';

import VariableHistoryCellRenderer from './VariableHistoryCellRenderer';

export type VariableChange = {
  field: 'feedback' | 'internalComment' | 'status' | 'value' | 'table' | 'image';
  previous: string;
  current: string;
};

export type VariableHistoryTableRow = {
  change: VariableChange;
  date: string;
  editedBy: number;
};

type VariableHistoryTableProps = {
  projectId: number;
  variableId: number;
};

export const VariableHistoryTable = ({ projectId, variableId }: VariableHistoryTableProps): JSX.Element => {
  const activeLocale = useLocalization();
  const dispatch = useAppDispatch();

  const columns = useMemo((): TableColumnType[] => {
    return activeLocale
      ? [
          {
            key: 'date',
            name: strings.DATE,
            type: 'date',
          },
          {
            key: 'changes',
            name: strings.CHANGES,
            type: 'string',
          },
          {
            key: 'editedBy',
            name: strings.EDITED_BY,
            type: 'string',
          },
        ]
      : [];
  }, [activeLocale]);

  const historyResponse = useAppSelector((state) => selectVariableHistory(state, variableId, projectId));

  useEffect(() => {
    void dispatch(requestGetVariableHistory({ projectId, variableId }));
  }, [dispatch, projectId, variableId]);

  const rows: VariableHistoryTableRow[] = useMemo(() => {
    if (!historyResponse || historyResponse.status !== 'success' || !historyResponse.data) {
      return [];
    }

    // Most recent first
    const variableHistory = historyResponse.data.history;
    const variable = historyResponse.data.variable;

    const reversedVariableHistory = variableHistory.toReversed();

    return reversedVariableHistory
      .flatMap((history, idx) => {
        const newRows: VariableHistoryTableRow[] = [];
        const previous = idx > 0 ? reversedVariableHistory[idx - 1] : undefined;

        if (previous?.feedback !== history.feedback) {
          newRows.push({
            date: history.createdTime,
            editedBy: history.createdBy,
            change: {
              field: 'feedback',
              previous: previous?.feedback ?? '',
              current: history.feedback ?? '',
            },
          });
        }

        if (previous?.internalComment !== history.internalComment) {
          newRows.push({
            date: history.createdTime,
            editedBy: history.createdBy,
            change: {
              field: 'internalComment',
              previous: previous?.internalComment ?? '',
              current: history.internalComment ?? '',
            },
          });
        }

        if (previous?.status !== history.status) {
          newRows.push({
            date: history.createdTime,
            editedBy: history.createdBy,
            change: {
              field: 'status',
              previous: previous?.status ?? '',
              current: history.status,
            },
          });
        }

        if (variable.type === 'Table') {
          const currentTableValueIds = history.variableValues
            .toSorted((a, b) => a.listPosition - b.listPosition)
            .map((value) => value.id)
            .join(',');

          const previousTableValueIds = (previous?.variableValues ?? [])
            .toSorted((a, b) => a.listPosition - b.listPosition)
            .map((value) => value.id)
            .join(',');

          if (previousTableValueIds !== currentTableValueIds) {
            newRows.push({
              date: history.createdTime,
              editedBy: history.createdBy,
              change: {
                field: 'table',
                previous: previousTableValueIds,
                current: currentTableValueIds,
              },
            });
          }
        } else if (variable.type === 'Date') {
          const currentValue = history.variableValues[0] as VariableValueDateValue | undefined;
          const previousValue = previous?.variableValues[0] as VariableValueDateValue | undefined;

          if (previousValue?.dateValue !== currentValue?.dateValue) {
            newRows.push({
              date: history.createdTime,
              editedBy: history.createdBy,
              change: {
                field: 'value',
                previous: previousValue?.dateValue ?? '',
                current: currentValue?.dateValue ?? '',
              },
            });
          }
        } else if (variable.type === 'Email') {
          const currentValue = history.variableValues[0] as VariableValueEmailValue | undefined;
          const previousValue = previous?.variableValues[0] as VariableValueEmailValue | undefined;

          if (previousValue?.emailValue !== currentValue?.emailValue) {
            newRows.push({
              date: history.createdTime,
              editedBy: history.createdBy,
              change: {
                field: 'value',
                previous: previousValue?.emailValue ?? '',
                current: currentValue?.emailValue ?? '',
              },
            });
          }
        } else if (variable.type === 'Number') {
          const currentValue = history.variableValues[0] as VariableValueNumberValue | undefined;
          const previousValue = previous?.variableValues[0] as VariableValueNumberValue | undefined;

          if (previousValue?.numberValue !== currentValue?.numberValue) {
            newRows.push({
              date: history.createdTime,
              editedBy: history.createdBy,
              change: {
                field: 'value',
                previous: previousValue?.numberValue.toString() ?? '',
                current: currentValue?.numberValue.toString() ?? '',
              },
            });
          }
        } else if (variable.type === 'Text') {
          const currentValue = history.variableValues[0] as VariableValueTextValue | undefined;
          const previousValue = previous?.variableValues[0] as VariableValueTextValue | undefined;

          if (previousValue?.textValue !== currentValue?.textValue) {
            newRows.push({
              date: history.createdTime,
              editedBy: history.createdBy,
              change: {
                field: 'value',
                previous: previousValue?.textValue ?? '',
                current: currentValue?.textValue ?? '',
              },
            });
          }
        } else if (variable.type === 'Select') {
          const currentValues = history.variableValues[0] as VariableValueSelectValue | undefined;
          const previousValues = previous?.variableValues[0] as VariableValueSelectValue | undefined;

          const currentOptionValues = (currentValues?.optionValues ?? [])
            .toSorted()
            .map((id) => variable.options.find((option) => option.id === id))
            .filter((option): option is SelectOptionPayload => option !== undefined) // drop unrecognized select options
            .map((option) => option.name)
            .join(',');

          const previousOptionValues = (previousValues?.optionValues ?? [])
            .toSorted()
            .map((id) => variable.options.find((option) => option.id === id))
            .filter((option): option is SelectOptionPayload => option !== undefined)
            .map((option) => option.name)
            .join(',');

          if (previousOptionValues !== currentOptionValues) {
            newRows.push({
              date: history.createdTime,
              editedBy: history.createdBy,
              change: {
                field: 'value',
                previous: previousOptionValues,
                current: currentOptionValues,
              },
            });
          }
        } else if (variable.type === 'Link') {
          const currentValue = history.variableValues[0] as VariableValueLinkValue | undefined;
          const previousValue = previous?.variableValues[0] as VariableValueLinkValue | undefined;

          if (previousValue?.url !== currentValue?.url) {
            newRows.push({
              date: history.createdTime,
              editedBy: history.createdBy,
              change: {
                field: 'value',
                previous: previousValue?.url ?? '',
                current: currentValue?.url ?? '',
              },
            });
          }
        } else if (variable.type === 'Image') {
          const currentValue = history.variableValues[0] as VariableValueImageValue | undefined;
          const previousValue = previous?.variableValues[0] as VariableValueImageValue | undefined;

          if (previousValue?.id !== currentValue?.id) {
            newRows.push({
              date: history.createdTime,
              editedBy: history.createdBy,
              change: {
                field: 'image',
                previous: previousValue?.id.toString() ?? '',
                current: currentValue?.id.toString() ?? '',
              },
            });
          }
        }

        return newRows;
      })
      .toReversed();
  }, [historyResponse]);

  if (!historyResponse || historyResponse.status === 'pending') {
    return <BusySpinner />;
  }

  return <Table columns={columns} rows={rows} order={'desc'} orderBy={'date'} Renderer={VariableHistoryCellRenderer} />;
};
