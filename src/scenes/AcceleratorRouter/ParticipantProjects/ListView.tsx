import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { DropdownItem, TableColumnType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import ExportCsvModal from 'src/components/common/ExportCsvModal';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useUser } from 'src/providers';
import { requestListParticipantProjects } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectsListRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ParticipantProjectService } from 'src/services';
import strings from 'src/strings';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useSnackbar from 'src/utils/useSnackbar';
import { PreferencesService } from 'src/services';
import EditColumns from 'src/scenes/AcceleratorRouter/ParticipantProjects/EditColumns';

import { defaultPreset as DefaultColumns, columns as AllColumns } from 'src/scenes/AcceleratorRouter/ParticipantProjects/columns';
import CellRenderer from './CellRenderer';

const fuzzySearchColumns = ['dealName'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'dealName',
  direction: 'Ascending',
};

export default function ListView(): JSX.Element {
  const { activeLocale } = useLocalization();
  const { isAllowed, userPreferences, reloadUserPreferences } = useUser();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const mixpanel = useMixpanel();
  const [editColumnsModalOpen, setEditColumnsModalOpen] = useState(false);

  const [openDownload, setOpenDownload] = useState<boolean>(false);
  const [lastSearch, setLastSearch] = useState<SearchNodePayload>();
  const [lastSort, setLastSort] = useState<SearchSortOrder>();
  const [projects, setProjects] = useState<ParticipantProject[]>([]);
  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantProjectsListRequest(requestId));
  const [columns, setColumns] = useState<TableColumnType[]>(
    AllColumns().filter(column => DefaultColumns().fields.includes(column.key))
  );

  const setDefaults = useCallback(() => {
      const savedColumns = userPreferences.projectColumns ? (userPreferences.projectColumns as string[]) : [];
      const defaultColumns = savedColumns.length ? savedColumns : DefaultColumns().fields;
      setColumns(AllColumns().filter(column => defaultColumns.includes(column.key)));
      //console.log(`new columns = ${AllColumns().filter(column => defaultColumns.includes(column.key))}`);
  }, [userPreferences]);

  useEffect(() => {
    setDefaults();
  }, [setDefaults]);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    }
    if (result?.status === 'success' && result?.data) {
      setProjects(result.data);
    }
  }, [result, snackbar]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, sortOrder: SearchSortOrder) => {
      if (locale) {
        setLastSearch(search);
        setLastSort(sortOrder);
        const request = dispatch(requestListParticipantProjects({ locale, search, sortOrder }));
        setRequestId(request.requestId);
      }
    },
    [dispatch]
  );

  const saveUpdateColumns = useCallback(
    async (savedColumns: string[]) => {

      const defaultColumns = savedColumns.length ? savedColumns : DefaultColumns().fields;
      setColumns(AllColumns().filter(column => defaultColumns.includes(column.key)));

    console.log("UPDATING!!!!");
        await PreferencesService.updateUserPreferences({ projectColumns: savedColumns });
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await reloadUserPreferences();
    },
    [reloadUserPreferences]
  );

  const onOpenEditColumnsModal = () => {
    setEditColumnsModalOpen(true);
  };
  const columnsWithLocale = (activeLocale: string | null, columns: TableColumnType[]) => 
    activeLocale
      ? columns : []
  ;

  const onCloseEditColumnsModal = (columnNames?: string[]) => {
    if (columnNames) {
      void saveUpdateColumns(columnNames);
    }
    setEditColumnsModalOpen(false);
  };

  const cohorts = useMemo<Record<string, string>>(
    () =>
      (projects || []).reduce(
        (acc, project) => {
          if (project.cohortId && project.cohortName) {
            acc[project.cohortId] = project.cohortName;
          }
          return acc;
        },
        {} as Record<string, string>
      ),
    [projects]
  );

  const featuredFilters: FilterConfig[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              field: 'cohortId',
              id: 'cohortId',
              label: strings.COHORT,
              options: (projects || [])?.map((project: ParticipantProject) => project.cohortId?.toString() ?? ''),
              pillValueRenderer: (values: (string | number | null)[]) =>
                values.map((value) => cohorts[value || ''] || '').join(', '),
              renderOption: (id: string | number) => cohorts[id] || '',
            },
            {
              field: 'cohortPhase',
              id: 'cohortPhase',
              label: strings.PHASE,
              options: (projects || [])?.map((project: ParticipantProject) => project.cohortPhase?.toString() ?? ''),
            },
          ]
        : [],
    [activeLocale, cohorts, projects]
  );

  const actionMenus = useMemo<ReactNode | null>(() => {
    const canExport = isAllowed('EXPORT_PARTICIPANTS');

    if (!activeLocale || !canExport) {
      return null;
    }

    return (
      <OptionsMenu
        size='small'
        onOptionItemClick={(item: DropdownItem) => {
          if (item.value === 'export') {
            mixpanel?.track(MIXPANEL_EVENTS.CONSOLE_PROJECTS_EXPORT);
            setOpenDownload(true);
          }
          else if( item.value === 'customize') {
            onOpenEditColumnsModal();
          }
        }}
        optionItems={[{ label: strings.CUSTOMIZE_COLUMNS, value: 'customize' }, { label: strings.EXPORT, value: 'export' }]}
      />
    );
  }, [activeLocale, isAllowed]);

  return (
    <>
      <ExportCsvModal
        onClose={() => setOpenDownload(false)}
        onExport={() => ParticipantProjectService.downloadList(lastSearch, lastSort)}
        open={openDownload}
      />
      <EditColumns open={editColumnsModalOpen} value={DefaultColumns().fields} onClose={onCloseEditColumnsModal} />

      <TableWithSearchFilters
        busy={result?.status === 'pending'}
        columns={() => columnsWithLocale(activeLocale, columns)}
        defaultSearchOrder={defaultSearchOrder}
        dispatchSearchRequest={dispatchSearchRequest}
        featuredFilters={featuredFilters}
        fuzzySearchColumns={fuzzySearchColumns}
        id='accelerator-participant-projects-table'
        Renderer={CellRenderer}
        rightComponent={actionMenus}
        rows={projects}
        title={strings.PROJECTS}
        stickyFilters
      />
    </>
  );
}
