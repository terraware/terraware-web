import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { IconName, TableColumnType } from '@terraware/web-components';

import PageListView, { PageListViewProps } from 'src/components/DocumentProducer/PageListView';
import useListModules from 'src/hooks/useListModules';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { SearchSortOrder } from 'src/types/Search';

import ModulesCellRenderer from './ModulesCellRenderer';
import UploadModulesModal from './UploadModulesModal';

export default function ModuleContentView() {
  const { activeLocale } = useLocalization();
  const { modules, listModules } = useListModules();
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const dispatch = useDispatch();

  const dispatchSearchRequest = useCallback(() => {
    listModules({});
  }, [dispatch]);

  const columns = (activeLocale: string | null): TableColumnType[] =>
    activeLocale
      ? [
          { key: 'name', name: strings.MODULE, type: 'string' },
          { key: 'id', name: strings.MODULE_ID, type: 'string' },
          { key: 'phaseId', name: strings.PHASE_ID, type: 'string' },
          { key: 'cohortsQuantity', name: strings.VERSION, type: 'number' },
          { key: 'deliverablesQuantity', name: strings.CREATED, type: 'date' },
        ]
      : [];

  const defaultSearchOrder: SearchSortOrder = {
    field: 'name',
    direction: 'Ascending',
  };

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
      id: 'modules-list',
      rows: modules || [],
      Renderer: ModulesCellRenderer,
    },
  };

  return (
    <>
      {openUploadModal && <UploadModulesModal open={openUploadModal} onClose={() => setOpenUploadModal(false)} />}
      <PageListView {...listViewProps}></PageListView>
    </>
  );
}
