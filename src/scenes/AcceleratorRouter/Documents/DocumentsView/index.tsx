import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { IconName, Separator, TableColumnType } from '@terraware/web-components';
import CellRenderer, { TableRowType } from '@terraware/web-components/components/table/TableCellRenderer';
import { RendererProps } from '@terraware/web-components/components/table/types';

import PageListView, { PageListViewProps } from 'src/components/DocumentProducer/PageListView';
import StatusBadge from 'src/components/DocumentProducer/StatusBadge';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization } from 'src/providers';
import { selectDocumentSearch } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestSearchDocuments } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { DocumentsSearchResponseElement } from 'src/services/documentProducer/DocumentService';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useSnackbar from 'src/utils/useSnackbar';

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        { key: 'name', name: strings.NAME, type: 'string' },
        { key: 'project_name', name: strings.PROJECT, type: 'string' },
        { key: 'documentTemplate_name', name: strings.DOCUMENT_TEMPLATE, type: 'string' },
        { key: 'lastSavedVersionId', name: strings.VERSION, type: 'number' },
        { key: 'createdTime', name: strings.CREATED, type: 'date' },
        { key: 'modifiedTime', name: strings.LAST_EDITED, type: 'date' },
        { key: 'status', name: strings.STATUS, type: 'string' },
      ]
    : [];

const fuzzySearchColumns = ['name', 'project_name'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

export default function DocumentsView(): JSX.Element | null {
  const dispatch = useAppDispatch();
  const { goToDocumentNew } = useNavigateTo();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { availableProjects } = useProjects();

  const [tableRows, setTableRows] = useState<DocumentsSearchResponseElement[]>([]);
  const [tableSelectedRows, tableSetSelectedRows] = useState<TableRowType[]>([]);
  const [requestId, setRequestId] = useState('');
  const [projectFilter, setProjectFilter] = useState<{ projectId?: number }>({ projectId: undefined });

  const documentsResponse = useAppSelector(selectDocumentSearch(requestId));

  const tableCellRenderer = useCallback((props: RendererProps<TableRowType>): JSX.Element => {
    switch (props.column.key) {
      case 'name':
        return (
          <CellRenderer
            {...props}
            value={
              <Link
                fontSize='16px'
                to={APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENT_VIEW.replace(':documentId', `${props.row.id}`)}
              >
                {props.row.name}
              </Link>
            }
          />
        );
      case 'status':
        return <CellRenderer {...props} value={<StatusBadge status={props.row.status} />} />;
      case 'lastSavedVersionId':
        const value = props.value ?? '-';
        return <CellRenderer {...props} value={value} />;
      default:
        return <CellRenderer {...props} />;
    }
  }, []);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      const request = dispatch(requestSearchDocuments({ locale, search, searchSortOrder }));
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  const PageHeaderLeftComponent = useMemo(
    () =>
      activeLocale ? (
        <>
          <Grid container sx={{ marginTop: theme.spacing(0.5) }}>
            <Grid item>
              <Separator height={'40px'} />
            </Grid>
            <Grid item>
              <Typography sx={{ lineHeight: '40px' }} component={'span'}>
                {strings.PROJECT}
              </Typography>
            </Grid>
            <Grid item sx={{ marginLeft: theme.spacing(1.5) }}>
              <ProjectsDropdown
                allowUnselect
                availableProjects={availableProjects}
                record={projectFilter}
                setRecord={setProjectFilter}
                label={''}
              />
            </Grid>
          </Grid>
        </>
      ) : undefined,
    [activeLocale, availableProjects, projectFilter]
  );

  const extraTableFilters: SearchNodePayload[] = useMemo(
    () =>
      projectFilter.projectId
        ? [
            {
              operation: 'field',
              field: 'project_id',
              type: 'Exact',
              values: [`${projectFilter.projectId}`],
            },
          ]
        : [],
    [projectFilter]
  );

  useEffect(() => {
    if (!documentsResponse) {
      return;
    }

    if (documentsResponse?.status === 'success' && documentsResponse?.data) {
      setTableRows(documentsResponse.data);
    } else if (documentsResponse?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, documentsResponse]);

  // if (tableRows.length === 0) {
  //   return <DocumentsEmptyPage />;
  // }

  const listViewProps: PageListViewProps = {
    leftComponent: PageHeaderLeftComponent,
    title: strings.DOCUMENTS,
    primaryButton: {
      title: strings.ADD_DOCUMENT,
      onClick: goToDocumentNew,
      icon: 'plus' as IconName,
    },
    tableWithSearchProps: {
      columns: () => columns(activeLocale),
      defaultSearchOrder,
      dispatchSearchRequest,
      extraTableFilters,
      fuzzySearchColumns,
      id: 'documents-list',
      Renderer: tableCellRenderer,
      rows: tableRows,
      selectedRows: tableSelectedRows,
      setSelectedRows: tableSetSelectedRows,
    },
  };

  return <PageListView {...listViewProps} />;
}
