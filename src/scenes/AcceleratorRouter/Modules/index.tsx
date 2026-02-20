import React, { useCallback, useEffect, useState } from 'react';

import { IconName, TableColumnType } from '@terraware/web-components';

import PageListView, { PageListViewProps } from 'src/components/DocumentProducer/PageListView';
import { useLocalization } from 'src/providers';
import { requestSearchModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectSearchModules } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ModuleSearchResult } from 'src/types/Module';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

import ModulesCellRenderer from './ModulesCellRenderer';
import UploadModulesModal from './UploadModulesModal';

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        { key: 'name', name: strings.MODULE, type: 'string' },
        { key: 'id', name: strings.MODULE_ID, type: 'string' },
        { key: 'projectsQuantity', name: strings.PROJECTS, type: 'number' },
        { key: 'deliverablesQuantity', name: strings.DELIVERABLES, type: 'number' },
      ]
    : [];

const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

const fuzzySearchColumns = ['name'];

export default function ModuleContentView() {
  const { activeLocale } = useLocalization();
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState('');
  const modulesResponse = useAppSelector(selectSearchModules(requestId));
  const [modules, setModules] = useState<ModuleSearchResult[]>([]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      const request = dispatch(requestSearchModules({ search, sortOrder: searchSortOrder }));
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!modulesResponse) {
      return;
    }

    if (modulesResponse?.status === 'success' && modulesResponse?.data) {
      setModules(modulesResponse.data);
    }
  }, [modulesResponse]);

  const showUploadModal = () => {
    setOpenUploadModal(true);
  };

  const listViewProps: PageListViewProps = {
    title: strings.MODULES,
    primaryButton: {
      title: strings.UPLOAD_ELLIPSIS,
      onClick: showUploadModal,
      icon: 'iconImport' as IconName,
    },
    tableWithSearchProps: {
      columns: () => columns(activeLocale),
      defaultSearchOrder,
      dispatchSearchRequest,
      fuzzySearchColumns,
      id: 'modules-list',
      rows: modules,
      Renderer: ModulesCellRenderer,
      clientSortedFields: ['projectsQuantity', 'deliverablesQuantity'],
    },
  };

  const reloadData = useCallback(
    () =>
      dispatchSearchRequest(
        activeLocale,
        {
          operation: 'and',
          children: [],
        },
        defaultSearchOrder
      ),
    [activeLocale, dispatchSearchRequest]
  );

  return (
    <>
      {openUploadModal && (
        <UploadModulesModal open={openUploadModal} onClose={() => setOpenUploadModal(false)} reloadData={reloadData} />
      )}
      <PageListView {...listViewProps} />
    </>
  );
}
