import React, { useCallback, useState } from 'react';

import { MRT_RowData, MRT_TableInstance } from 'material-react-table';

import SaveViewModal from 'src/components/common/SaveViewModal';
import { useFeatureEnabled } from 'src/features';
import { TableDefinition } from 'src/types/Tables';

import CurrentViewSelect, { DEFAULT_VIEW, ViewOption } from './CurrentViewSelect';
import { getTableSettings } from './tableSettings';

export { DEFAULT_VIEW } from './CurrentViewSelect';
export type { ViewOption } from './CurrentViewSelect';

export type CurrentViewProps<TData extends MRT_RowData> = {
  defaultPreset?: string;
  defaultViewLabel?: string | null;
  id?: string;
  onPresetChange?: (preset: string) => void;
  organizationId?: number;
  presetViews?: ViewOption[];
  table: MRT_TableInstance<TData>;
  tableDefinition: TableDefinition;
};

const CurrentView = <TData extends MRT_RowData>({
  defaultPreset = DEFAULT_VIEW,
  defaultViewLabel,
  id,
  onPresetChange,
  organizationId,
  presetViews,
  table,
  tableDefinition,
}: CurrentViewProps<TData>) => {
  'use no memo';
  const isSavedTableViewsEnabled = useFeatureEnabled('Saved Table Views');
  const [preset, setPreset] = useState(defaultPreset);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);

  const handleChange = useCallback(
    (value: string) => {
      setPreset(value);
      onPresetChange?.(value);
    },
    [onPresetChange]
  );

  const openSaveViewModal = useCallback(() => setShowSaveViewModal(true), []);
  const closeSaveViewModal = useCallback(() => setShowSaveViewModal(false), []);

  return (
    <>
      <CurrentViewSelect
        defaultViewLabel={defaultViewLabel}
        id={id}
        onChange={handleChange}
        onSave={openSaveViewModal}
        presetViews={presetViews}
        selected={preset}
        showSave={isSavedTableViewsEnabled}
      />
      {showSaveViewModal && (
        <SaveViewModal
          baseView={preset}
          onClose={closeSaveViewModal}
          open
          organizationId={organizationId}
          settings={getTableSettings(table)}
          tableName={tableDefinition.stableId}
        />
      )}
    </>
  );
};

export default CurrentView;
