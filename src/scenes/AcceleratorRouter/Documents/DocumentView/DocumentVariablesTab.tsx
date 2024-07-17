import React, { useCallback, useEffect, useState } from 'react';

import { CellRenderer, RendererProps, TableColumnType } from '@terraware/web-components';

import EditVariable from 'src/components/DocumentProducer/EditVariable';
import PageContent from 'src/components/DocumentProducer/PageContent';
import TableContent from 'src/components/DocumentProducer/TableContent';
import Link from 'src/components/common/Link';
import { requestListVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectAllVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListAllVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { RootState } from 'src/redux/rootReducer';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';
import {
  SectionVariableWithValues,
  SelectOptionPayload,
  VariableWithValues,
} from 'src/types/documentProducer/Variable';
import {
  VariableValueDateValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
} from 'src/types/documentProducer/VariableValue';

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
  document: Document;
  setSelectedTab?: (tab: string) => void;
};

const filterSearch =
  (searchValue: string) =>
  (variable: VariableWithValues): boolean =>
    searchValue ? variable.name.toLowerCase().includes(searchValue) : true;

const DocumentVariablesTab = ({ document: doc, setSelectedTab }: DocumentVariablesProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const [tableRows, setTableRows] = useState<TableRow[]>([]);
  const [variables, setVariables] = useState<VariableWithValues[]>([]);
  const [sectionVariables, setSectionVariables] = useState<SectionVariableWithValues[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [openEditVariableModal, setOpenEditVariableModal] = useState<boolean>(false);
  const [selectedVariableId, setSelectedVariableId] = useState<number>();

  const allVariables = useAppSelector((state: RootState) => selectAllVariablesWithValues(state, doc.projectId));

  useEffect(() => {
    const sectionVariables = allVariables
      .filter((d: VariableWithValues) => d.type === 'Section')
      .filter(filterSearch(searchValue)) as SectionVariableWithValues[];

    setSectionVariables(sectionVariables);
    setVariables(
      allVariables
        .filter((d: VariableWithValues) => d.type !== 'Section' && d.type !== 'Image' && d.type !== 'Table')
        .filter(filterSearch(searchValue))
    );
  }, [allVariables, searchValue]);

  useEffect(() => {
    dispatch(requestListAllVariables());
    dispatch(requestListVariablesValues({ projectId: doc.projectId }));
  }, [dispatch, doc.variableManifestId, doc.projectId]);

  const containingSections = useCallback(
    (variableId?: number) => (acc: string[], currentVal: SectionVariableWithValues) => {
      const newAcc = [...acc];
      if (
        currentVal.parentSectionNumber &&
        currentVal?.values?.some((val) => val.type === 'SectionVariable' && val.variableId === variableId)
      ) {
        newAcc.push(currentVal.parentSectionNumber);
      }
      currentVal.children.forEach((childSection) => {
        const childContainingSections = containingSections(variableId)([], childSection as SectionVariableWithValues);
        newAcc.push(...childContainingSections);
      });

      return newAcc;
    },
    []
  );

  useEffect(() => {
    setTableRows(
      variables.map((v) => ({ ...v, instances: sectionVariables.reduce(containingSections(v.id), []).length }))
    );
  }, [variables, sectionVariables, containingSections]);

  const [sectionsUsed, setSectionsUsed] = useState<string[]>([]);
  useEffect(() => {
    const sectionNumbers = sectionVariables.reduce(containingSections(selectedVariableId), []);
    setSectionsUsed(sectionNumbers);
  }, [selectedVariableId, sectionVariables, containingSections]);

  const onSectionClicked = useCallback(
    (sectionNumber: string) => {
      setOpenEditVariableModal(false);
      setSelectedVariableId(-1);
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

  const onUpdate = () => {
    dispatch(requestListAllVariables());
    dispatch(requestListVariablesValues({ projectId: doc.projectId }));
  };

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
      tableReloadData: () => onUpdate(),
      tableOnSelect: (selected: any) => {
        setSelectedVariableId(selected.id);
        setOpenEditVariableModal(true);
      },
    },
  };

  const onFinish = useCallback(
    (updated: boolean) => {
      if (updated) {
        dispatch(requestListVariablesValues({ projectId: doc.projectId }));
      }
    },
    [dispatch, doc.projectId]
  );

  return (
    <>
      {openEditVariableModal && (
        <EditVariable
          onFinish={(updated: boolean) => {
            setOpenEditVariableModal(false);
            onFinish(updated);
          }}
          manifestId={doc.variableManifestId}
          projectId={doc.projectId}
          variableId={selectedVariableId || -1}
          sectionsUsed={sectionsUsed}
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
