import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { CellRenderer, RendererProps, TableColumnType } from '@terraware/web-components';

import EditVariableModal from 'src/components/DocumentProducer/EditableSection/EditVariableModal';
import PageContent from 'src/components/DocumentProducer/PageContent';
import TableContent from 'src/components/DocumentProducer/TableContent';
import VariableHistoryModal from 'src/components/Variables/VariableHistoryModal';
import Link from 'src/components/common/Link';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import strings from 'src/strings';
import { SelectOptionPayload, VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  VariableValueDateValue,
  VariableValueEmailValue,
  VariableValueImageValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTableValue,
  VariableValueTextValue,
} from 'src/types/documentProducer/VariableValue';
import { fuzzyMatch } from 'src/utils/searchAndSort';
import useDebounce from 'src/utils/useDebounce';

type TableRow = VariableWithValues & { instances: number };

const tableCellRenderer = (props: RendererProps<any>): JSX.Element => {
  const { value, column, row } = props;

  if (column.key === 'name') {
    if (props.value) {
      return <CellRenderer {...props} title={value?.toString()} value={<Link>{value?.toString()}</Link>} />;
    }
  }

  if (column.key === 'deliverableQuestion') {
    if (props.value) {
      return <CellRenderer {...props} title={value?.toString()} />;
    }
  }

  const getOptionValue = (optionId: number) => {
    const found = row.options.find((opt: SelectOptionPayload) => opt.id === optionId);
    if (found) {
      return found.name;
    }
  };

  if (column.key === 'values') {
    if (props.value && Array.isArray(props.value) && props.value.length) {
      if (row.type === 'Text') {
        const variableTextValue = props.value[0] as VariableValueTextValue;
        return <CellRenderer {...props} value={variableTextValue.textValue} />;
      }
      if (row.type === 'Number') {
        const variableNumberValue = props.value[0] as VariableValueNumberValue;
        return <CellRenderer {...props} value={variableNumberValue.numberValue} />;
      }
      if (row.type === 'Select') {
        const variableSelectValue = props.value[0] as VariableValueSelectValue;
        return <CellRenderer {...props} value={getOptionValue(variableSelectValue.optionValues[0])} />;
      }
      if (row.type === 'Date') {
        const variableDateValue = props.value[0] as VariableValueDateValue;
        return <CellRenderer {...props} value={variableDateValue.dateValue} />;
      }
      if (row.type === 'Email') {
        const variableEmailValue = props.value[0] as VariableValueEmailValue;
        return <CellRenderer {...props} value={variableEmailValue.emailValue} />;
      }
      if (row.type === 'Link') {
        const variableLinkValue = props.value[0] as VariableValueLinkValue;
        return <CellRenderer {...props} value={variableLinkValue.url} />;
      }
      if (row.type === 'Image') {
        const variableImageValues = props.value as VariableValueImageValue[];
        const imageCount = variableImageValues.length;
        return <CellRenderer {...props} value={`${strings.formatString(strings.N_IMAGES, imageCount)?.toString()}`} />;
      }
      if (row.type === 'Table') {
        const variableTableValues = props.value as VariableValueTableValue[];
        const rowCount = variableTableValues.length;
        return <CellRenderer {...props} value={`${strings.formatString(strings.N_ROWS, rowCount)?.toString()}`} />;
      }
    }
    // Default (type not found): Render an empty cell
    return <CellRenderer {...props} value='' />;
  }

  return <CellRenderer {...props} />;
};

export type DocumentVariablesProps = {
  projectId?: number;
};

const filterSearch =
  (searchValue: string) =>
  (variable: VariableWithValues): boolean => {
    if (!searchValue) {
      return true;
    }

    // check if search value is present in the variable name or deliverable question
    return (
      fuzzyMatch(searchValue, variable.name) ||
      (variable.deliverableQuestion ? fuzzyMatch(searchValue, variable.deliverableQuestion) : false)
    );
  };

const DocumentVariablesTab = ({ projectId: projectIdProp }: DocumentVariablesProps): JSX.Element => {
  const activeLocale = useLocalization();
  const { isAllowed } = useUser();
  const { allVariables, documentSectionVariables, getUsedSections, projectId, reload } = useDocumentProducerData();

  const [tableRows, setTableRows] = useState<TableRow[]>([]);
  const [variables, setVariables] = useState<VariableWithValues[]>([]);
  const [openVariableHistoryModal, setOpenVariableHistoryModal] = useState<boolean>(false);
  const [openEditVariableModal, setOpenEditVariableModal] = useState<boolean>(false);
  const [selectedVariable, setSelectedVariable] = useState<VariableWithValues>();
  const [searchValue, setSearchValue] = useState<string>('');

  const debouncedSearchTerm = useDebounce(searchValue, DEFAULT_SEARCH_DEBOUNCE_MS);

  const tableColumns = useMemo((): TableColumnType[] => {
    if (!activeLocale) {
      return [];
    }

    return [
      { key: 'name', name: strings.NAME, type: 'string' },
      { key: 'deliverableQuestion', name: strings.QUESTION, type: 'string' },
      { key: 'type', name: strings.TYPE, type: 'string' },
      { key: 'values', name: strings.VALUE, type: 'string' },
      { key: 'instances', name: strings.INSTANCES, type: 'string' },
    ];
  }, [activeLocale]);

  const supportedVariables = useMemo(() => {
    return (allVariables || []).filter((d: VariableWithValues) => {
      return d.type !== 'Section';
    });
  }, [allVariables]);

  useEffect(() => {
    setVariables(supportedVariables.filter(filterSearch(debouncedSearchTerm)));
  }, [debouncedSearchTerm, supportedVariables]);

  useEffect(() => {
    setTableRows(
      variables.map((v) => ({
        ...v,
        instances: getUsedSections(v.id).length,
      }))
    );
  }, [documentSectionVariables, getUsedSections, variables]);

  const onSectionClicked = useCallback((sectionNumber: string) => {
    setOpenEditVariableModal(false);
    setSelectedVariable(undefined);

    const documentTabElement: HTMLButtonElement | null = document.querySelector('button[role="tab"]');
    if (documentTabElement) {
      documentTabElement.click();

      setTimeout(() => {
        // do find and scroll async after timeout to allow tab-switching to occur first
        const relevantSection = document.getElementById(sectionNumber);
        relevantSection?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  }, []);

  const onSearch = (str: string) => setSearchValue(str);

  const props = {
    searchProps: {
      onSearch,
      searchValue,
    },
    tableProps: {
      tableRows,
      tableSelectable: false,
      tableOrderBy: 'date',
      tableColumns,
      tableCellRenderer,
      tableReloadData: reload,
      tableOnSelect: (selected: VariableWithValues) => {
        if (isAllowed('UPDATE_DELIVERABLE')) {
          setSelectedVariable(selected);
          setOpenEditVariableModal(true);
        }
      },
    },
  };

  const onFinish = useCallback(
    (updated: boolean) => {
      if (updated) {
        reload();
      }
    },
    [reload]
  );

  return (
    <>
      {openVariableHistoryModal && selectedVariable && (
        <VariableHistoryModal
          open={openVariableHistoryModal}
          setOpen={setOpenVariableHistoryModal}
          projectId={projectIdProp || projectId}
          variableId={selectedVariable.id}
        />
      )}
      {openEditVariableModal && selectedVariable && (
        <EditVariableModal
          onCancel={() => setOpenEditVariableModal(false)}
          onFinish={(updated: boolean) => {
            setOpenEditVariableModal(false);
            onFinish(updated);
          }}
          onSectionClicked={onSectionClicked}
          projectId={projectIdProp || projectId}
          showVariableHistory={() => setOpenVariableHistoryModal(true)}
          variable={selectedVariable}
        />
      )}
      <PageContent styles={{ marginTop: 0 }}>
        <TableContent {...props} />
      </PageContent>
    </>
  );
};

export default DocumentVariablesTab;
