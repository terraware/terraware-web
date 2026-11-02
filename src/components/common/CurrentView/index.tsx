import React, { useCallback, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { MRT_RowData, MRT_TableInstance } from 'material-react-table';

import SaveViewModal from 'src/components/common/SaveViewModal';
import Button from 'src/components/common/button/Button';
import { useFeatureEnabled } from 'src/features';
import { useLocalization } from 'src/providers';
import { useListSavedTableViewsQuery } from 'src/queries/generated/savedTableViews';
import { TableDefinition } from 'src/types/Tables';

import CurrentViewSelect, { DEFAULT_VIEW, ViewOption, sortViewsByLabel } from './CurrentViewSelect';
import {
  TableSettings,
  applyTableSettings,
  getDefaultTableSettings,
  getTableSettings,
  isTableModified,
} from './tableSettings';

export { DEFAULT_VIEW } from './CurrentViewSelect';
export type { ViewOption } from './CurrentViewSelect';

export type CurrentViewProps<TData extends MRT_RowData> = {
  defaultPreset?: string;
  defaultSettings?: Partial<TableSettings>;
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
  defaultSettings,
  defaultViewLabel,
  id,
  onPresetChange,
  organizationId,
  presetViews,
  table,
  tableDefinition,
}: CurrentViewProps<TData>) => {
  'use no memo';
  const { strings } = useLocalization();
  const isSavedTableViewsEnabled = useFeatureEnabled('Saved Table Views');
  const [preset, setPreset] = useState(defaultPreset);
  const [savedViewId, setSavedViewId] = useState<string>();
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const { data: savedTableViewsData } = useListSavedTableViewsQuery(
    { organizationId, tableName: tableDefinition.stableId },
    { skip: !isSavedTableViewsEnabled }
  );
  const savedViewOptions = useMemo(
    () => sortViewsByLabel(savedTableViewsData?.views.map((view) => ({ label: view.name, value: `${view.id}` }))) ?? [],
    [savedTableViewsData]
  );

  const changePreset = useCallback(
    (value: string) => {
      setPreset(value);
      onPresetChange?.(value);
    },
    [onPresetChange]
  );

  const handleChange = useCallback(
    (value: string) => {
      const defaults = getDefaultTableSettings(table, defaultSettings);
      const savedView = savedTableViewsData?.views.find((view) => `${view.id}` === value);
      if (savedView) {
        setSavedViewId(value);
        if (
          savedView.baseView === DEFAULT_VIEW ||
          presetViews?.some((presetView) => presetView.value === savedView.baseView)
        ) {
          changePreset(savedView.baseView as string);
        }
        applyTableSettings(table, savedView.settings as Partial<TableSettings>, defaults);
      } else {
        setSavedViewId(undefined);
        changePreset(value);
        if (isSavedTableViewsEnabled) {
          applyTableSettings(table, {}, defaults);
        }
      }
    },
    [changePreset, defaultSettings, isSavedTableViewsEnabled, presetViews, savedTableViewsData, table]
  );

  const handleSaved = useCallback((newViewId: number) => setSavedViewId(`${newViewId}`), []);

  const selectedSavedView = savedTableViewsData?.views.find((view) => `${view.id}` === savedViewId);
  const isModified =
    isSavedTableViewsEnabled &&
    isTableModified(
      table,
      (selectedSavedView?.settings ?? {}) as Partial<TableSettings>,
      getDefaultTableSettings(table, defaultSettings)
    );

  const openSaveViewModal = useCallback(() => setShowSaveViewModal(true), []);
  const closeSaveViewModal = useCallback(() => setShowSaveViewModal(false), []);

  return (
    <Box display='flex' alignItems='center' gap={1}>
      <Box width='300px' flexShrink={0}>
        <CurrentViewSelect
          defaultViewLabel={defaultViewLabel}
          id={id}
          modified={isModified}
          myViews={savedViewOptions}
          onChange={handleChange}
          onSave={openSaveViewModal}
          presetViews={presetViews}
          selected={savedViewId ?? preset}
          showSave={isSavedTableViewsEnabled}
        />
      </Box>
      {isModified && (
        <Button
          id={`${id ?? 'current-view'}-save-button`}
          label={strings.SAVE_VIEW_BUTTON}
          onClick={openSaveViewModal}
          priority='ghost'
        />
      )}
      {showSaveViewModal && (
        <SaveViewModal
          baseView={preset}
          onClose={closeSaveViewModal}
          onSaved={handleSaved}
          open
          organizationId={organizationId}
          settings={getTableSettings(table)}
          tableName={tableDefinition.stableId}
        />
      )}
    </Box>
  );
};

export default CurrentView;
