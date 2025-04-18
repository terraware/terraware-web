import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { useParticipants } from 'src/hooks/useParticipants';
import { useLocalization } from 'src/providers';
import { selectDocumentSearch } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestSearchDocuments } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { Document } from 'src/types/documentProducer/Document';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        { key: 'name', name: strings.NAME, type: 'string' },
        { key: 'projectDealName', name: strings.DEAL_NAME, type: 'string' },
        { key: 'documentTemplateName', name: strings.DOCUMENT_TEMPLATE, type: 'string' },
        { key: 'lastSavedVersionId', name: strings.VERSION, type: 'number' },
        { key: 'createdTime', name: strings.CREATED, type: 'date' },
        { key: 'modifiedTime', name: strings.LAST_EDITED, type: 'date' },
        { key: 'status', name: strings.STATUS, type: 'string' },
      ]
    : [];

const fuzzySearchColumns = ['name', 'projectDealName'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

export default function DocumentsView(): JSX.Element | null {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useStateLocation();
  const { goToDocumentNew } = useNavigateTo();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { availableParticipants } = useParticipants();

  const [tableRows, setTableRows] = useState<Document[]>([]);
  const [tableSelectedRows, tableSetSelectedRows] = useState<TableRowType[]>([]);
  const [requestId, setRequestId] = useState('');
  const query = useQuery();

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

  const availableProjects = useMemo(() => {
    return availableParticipants.flatMap((participant) =>
      participant.projects.map((project) => ({
        id: project.projectId,
        name: project.projectName,
        dealName: project.projectDealName,
      }))
    );
  }, [availableParticipants]);

  const filteredProject = useMemo(() => {
    if (availableProjects && query.get('dealName')) {
      return availableProjects.find((p) => p.dealName === query.get('dealName'));
    }
  }, [availableProjects, query.get('dealName')]);

  const resetFilter = useCallback(() => {
    navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
  }, [location, query]);

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
                {strings.DEAL_NAME}
              </Typography>
            </Grid>
            <Grid item sx={{ marginLeft: theme.spacing(1.5) }}>
              <ProjectsDropdown
                allowUnselect
                availableProjects={availableProjects}
                record={{ projectId: filteredProject?.id }}
                setRecord={(setFn) => {
                  const newProjectFilter = setFn({ projectId: filteredProject?.id });
                  if (newProjectFilter.projectId) {
                    const newProject = availableProjects.find((p) => p.id === newProjectFilter.projectId);
                    if (newProject?.dealName) {
                      query.set('dealName', newProject.dealName);
                      resetFilter();
                    }
                  } else {
                    query.delete('dealName');
                    resetFilter();
                  }
                }}
                label={''}
                unselectLabel={strings.ALL}
                unselectValue={undefined}
                useDealName
              />
            </Grid>
          </Grid>
        </>
      ) : undefined,
    [activeLocale, availableProjects, query.get('dealName')]
  );

  const extraTableFilters: SearchNodePayload[] = useMemo(() => {
    return query.get('dealName')
      ? [
          {
            operation: 'field',
            field: 'projectDealName',
            type: 'Exact',
            values: [`${query.get('dealName')}`],
          },
        ]
      : [];
  }, [query.get('dealName')]);

  useEffect(() => {
    if (!documentsResponse) {
      return;
    }

    if (documentsResponse?.status === 'success' && documentsResponse?.data) {
      setTableRows(documentsResponse.data ?? []);
    } else if (documentsResponse?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, documentsResponse]);

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
