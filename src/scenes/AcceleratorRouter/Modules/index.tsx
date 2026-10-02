import React, { useCallback, useState } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';
import { IconName, TableColumnType } from '@terraware/web-components';

import PageListView, { PageListViewProps } from 'src/components/DocumentProducer/PageListView';
import { useLocalization, useUser } from 'src/providers';
import { useSearchModulesQuery } from 'src/queries/search/modules';
import strings from 'src/strings';
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
  const { isAllowed } = useUser();
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [searchArgs, setSearchArgs] = useState<{ search: SearchNodePayload; sortOrder: SearchSortOrder }>();
  // `data` keeps the previous rows on screen while a new search is in flight
  const { data: modules } = useSearchModulesQuery(searchArgs ?? skipToken);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      setSearchArgs({ search, sortOrder: searchSortOrder });
    },
    []
  );

  const showUploadModal = () => {
    setOpenUploadModal(true);
  };

  const listViewProps: PageListViewProps = {
    title: strings.MODULES,
    primaryButton: isAllowed('UPDATE_PROJECT_MODULES')
      ? {
          title: strings.UPLOAD_ELLIPSIS,
          onClick: showUploadModal,
          icon: 'iconImport' as IconName,
        }
      : undefined,
    tableWithSearchProps: {
      columns: () => columns(activeLocale),
      defaultSearchOrder,
      dispatchSearchRequest,
      fuzzySearchColumns,
      id: 'modules-list',
      rows: modules ?? [],
      Renderer: ModulesCellRenderer,
      clientSortedFields: ['projectsQuantity', 'deliverablesQuantity'],
    },
  };

  return (
    <>
      {openUploadModal && <UploadModulesModal open={openUploadModal} onClose={() => setOpenUploadModal(false)} />}
      <PageListView {...listViewProps} />
    </>
  );
}
