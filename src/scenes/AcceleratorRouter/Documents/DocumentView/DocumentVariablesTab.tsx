import React, { useCallback, useEffect, useState } from 'react';

import { CellRenderer, RendererProps, TableColumnType } from '@terraware/web-components';

import EditVariable from 'src/components/DocumentProducer/EditVariable';
import PageContent from 'src/components/DocumentProducer/PageContent';
import TableContent from 'src/components/DocumentProducer/TableContent';
import VariableHistoryModal from 'src/components/Variables/VariableHistoryModal';
import Link from 'src/components/common/Link';
import { useUser } from 'src/providers';
import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import strings from 'src/strings';
import { SelectOptionPayload, VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  VariableValueDateValue,
  VariableValueEmailValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
} from 'src/types/documentProducer/VariableValue';
import { fuzzyMatch } from 'src/utils/searchAndSort';

const tableColumns: TableColumnType[] = [
  { key: 'name', name: strings.NAME, type: 'string' },
  { key: 'type', name: strings.TYPE, type: 'string' },
  { key: 'values', name: strings.VALUE, type: 'string' },
  { key: 'instances', name: strings.INSTANCES, type: 'string' },
];

type TableRow = VariableWithValues & { instances: number };

const tableCellRenderer = (props: RendererProps<any>): JSX.Element => {
  const { value, column, row } = props;

  if (column.key === 'name') {
    if (props.value) {
      return <CellRenderer {...props} value={<Link>{value?.toString()}</Link>} />;
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
    }
    // Default (type not found): Render an empty cell
    return <CellRenderer {...props} value='' />;
  }

  return <CellRenderer {...props} />;
};

export type DocumentVariablesProps = {
  setSelectedTab?: (tab: string) => void;
};

const filterSearch =
  (searchValue: string) =>
  (variable: VariableWithValues): boolean =>
    searchValue ? fuzzyMatch(searchValue, variable.name.toLowerCase()) : true;

const DocumentVariablesTab = ({ setSelectedTab }: DocumentVariablesProps): JSX.Element => {
  const { allVariables, documentSectionVariables, getUsedSections, projectId, reload } = useDocumentProducerData();

  const [tableRows, setTableRows] = useState<TableRow[]>([]);
  const [variables, setVariables] = useState<VariableWithValues[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [openVariableHistoryModal, setOpenVariableHistoryModal] = useState<boolean>(false);
  const [openEditVariableModal, setOpenEditVariableModal] = useState<boolean>(false);
  const [selectedVariable, setSelectedVariable] = useState<VariableWithValues>();
  const [sectionsUsed, setSectionsUsed] = useState<string[]>([]);
  const { isAllowed } = useUser();

  useEffect(() => {
    setVariables(
      (allVariables || [])
        .filter((d: VariableWithValues) => {
          return d.type !== 'Section' && d.type !== 'Image' && d.type !== 'Table';
        })
        .filter(filterSearch(searchValue))
    );
  }, [allVariables, searchValue]);

  useEffect(() => {
    setTableRows(
      variables.map((v) => ({
        ...v,
        instances: getUsedSections(v.id).length,
      }))
    );
  }, [documentSectionVariables, getUsedSections, variables]);

  useEffect(() => {
    if (selectedVariable) {
      const sectionNumbers = getUsedSections(selectedVariable.id);
      setSectionsUsed(sectionNumbers);
    }
  }, [documentSectionVariables, getUsedSections, selectedVariable]);

  const onSectionClicked = useCallback(
    (sectionNumber: string) => {
      setOpenEditVariableModal(false);
      setSelectedVariable(undefined);

      if (setSelectedTab) {
        setSelectedTab(strings.DOCUMENT);
        setTimeout(() => {
          // do find and scroll async to allow tab-switching to occur first
          const relevantSection = document.getElementById(sectionNumber);
          relevantSection?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
      }
    },
    [setSelectedTab]
  );

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
          projectId={projectId}
          variableId={selectedVariable.id}
        />
      )}
      {openEditVariableModal && selectedVariable && (
        <EditVariable
          onFinish={(updated: boolean) => {
            setOpenEditVariableModal(false);
            onFinish(updated);
          }}
          projectId={projectId}
          variable={selectedVariable}
          sectionsUsed={sectionsUsed}
          showVariableHistory={() => setOpenVariableHistoryModal(true)}
          onSectionClicked={onSectionClicked}
        />
      )}
      <PageContent styles={{ marginTop: 0 }}>
        <TableContent {...props} />
      </PageContent>
    </>
  );
};

export default DocumentVariablesTab;
