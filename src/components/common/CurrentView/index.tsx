import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box } from '@mui/material';
import { MRT_RowData, MRT_TableInstance } from 'material-react-table';

import DeleteViewModal from 'src/components/common/DeleteViewModal';
import SaveViewModal from 'src/components/common/SaveViewModal';
import Button from 'src/components/common/button/Button';
import { useFeatureEnabled } from 'src/features';
import { useLocalization } from 'src/providers';
import { useListSavedTableViewsQuery, useUpdateSavedTableViewMutation } from 'src/queries/generated/savedTableViews';
import { TableDefinition } from 'src/types/Tables';
import useSnackbar from 'src/utils/useSnackbar';

import CurrentViewSelect, { DEFAULT_VIEW, ViewOption, sortViewsByLabel } from './CurrentViewSelect';
import {
  TableSettings,
  applyTableSettings,
  getDefaultTableSettings,
  getTableSettings,
  isTableModified,
} from './tableSettings';
import { getSaveViewSummary, getViewSummary } from './viewSummary';

export { DEFAULT_VIEW } from './CurrentViewSelect';
export type { ViewOption } from './CurrentViewSelect';

type StoredView = { preset?: string; savedViewId?: string };

const loadStoredView = (storageKey: string): StoredView => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return {
      preset: typeof stored.preset === 'string' ? stored.preset : undefined,
      savedViewId: typeof stored.savedViewId === 'string' ? stored.savedViewId : undefined,
    };
  } catch {
    return {};
  }
};

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
  const snackbar = useSnackbar();
  const [updateSavedTableView] = useUpdateSavedTableViewMutation();
  const storageKey = `${tableDefinition.storageKey}-currentView`;
  const [preset, setPreset] = useState(() => {
    const storedPreset = loadStoredView(storageKey).preset;
    return storedPreset === DEFAULT_VIEW || presetViews?.some((presetView) => presetView.value === storedPreset)
      ? (storedPreset as string)
      : defaultPreset;
  });
  const [savedViewId, setSavedViewId] = useState(() => loadStoredView(storageKey).savedViewId);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [viewToDelete, setViewToDelete] = useState<{ id: number; name: string }>();
  const { data: savedTableViewsData, isError: isSavedTableViewsError } = useListSavedTableViewsQuery(
    { organizationId, tableName: tableDefinition.stableId },
    { skip: !isSavedTableViewsEnabled }
  );
  const getBaseViewLabel = useCallback(
    (baseView?: string) => {
      if (baseView !== DEFAULT_VIEW) {
        return presetViews?.find((presetView) => presetView.value === baseView)?.label;
      }
      return defaultViewLabel === null ? undefined : (defaultViewLabel ?? strings.DEFAULT);
    },
    [defaultViewLabel, presetViews, strings]
  );
  const savedViewOptions = useMemo(
    () =>
      sortViewsByLabel(
        savedTableViewsData?.views.map((view) => ({
          description: getViewSummary(
            table,
            { ...getDefaultTableSettings(table, defaultSettings), ...(view.settings as Partial<TableSettings>) },
            getBaseViewLabel(view.baseView)
          ),
          label: view.name,
          value: `${view.id}`,
        }))
      ) ?? [],
    [defaultSettings, getBaseViewLabel, savedTableViewsData, table]
  );
  const isSavedViewAvailable = savedTableViewsData
    ? savedTableViewsData.views.some((view) => `${view.id}` === savedViewId)
    : !isSavedTableViewsError;
  const activeSavedViewId = isSavedTableViewsEnabled && isSavedViewAvailable ? savedViewId : undefined;

  const hasNotifiedRestoredPreset = useRef(false);
  useEffect(() => {
    if (!hasNotifiedRestoredPreset.current) {
      hasNotifiedRestoredPreset.current = true;
      onPresetChange?.(preset);
    }
  }, [onPresetChange, preset]);

  const changePreset = useCallback(
    (value: string) => {
      setPreset(value);
      onPresetChange?.(value);
    },
    [onPresetChange]
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ preset, savedViewId }));
    } catch {
      // ignore
    }
  }, [preset, savedViewId, storageKey]);

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

  const handleRename = useCallback(
    async (value: string, name: string) => {
      try {
        await updateSavedTableView({ id: Number(value), updateSavedTableViewRequestPayload: { name } }).unwrap();
        snackbar.toastSuccess(strings.formatString(strings.SAVED_VIEW_UPDATED, name));
      } catch (error) {
        snackbar.toastError();
        throw error;
      }
    },
    [snackbar, strings, updateSavedTableView]
  );

  const handleDeleteView = useCallback(
    (value: string) => setViewToDelete(savedTableViewsData?.views.find((view) => `${view.id}` === value)),
    [savedTableViewsData]
  );
  const closeDeleteViewModal = useCallback(() => setViewToDelete(undefined), []);
  const handleDeleted = useCallback(
    (deletedViewId: number) => {
      if (`${deletedViewId}` === activeSavedViewId) {
        handleChange(DEFAULT_VIEW);
      }
    },
    [activeSavedViewId, handleChange]
  );

  const handleSaved = useCallback((newViewId: number) => setSavedViewId(`${newViewId}`), []);

  const selectedSavedView = savedTableViewsData?.views.find((view) => `${view.id}` === activeSavedViewId);
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
          onDeleteView={isSavedTableViewsEnabled ? handleDeleteView : undefined}
          onRenameView={isSavedTableViewsEnabled ? handleRename : undefined}
          onSave={openSaveViewModal}
          presetViews={presetViews}
          selected={activeSavedViewId ?? preset}
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
      {viewToDelete && <DeleteViewModal onClose={closeDeleteViewModal} onDeleted={handleDeleted} view={viewToDelete} />}
      {showSaveViewModal && (
        <SaveViewModal
          baseView={preset}
          onClose={closeSaveViewModal}
          onSaved={handleSaved}
          open
          organizationId={organizationId}
          settings={getTableSettings(table)}
          summary={getSaveViewSummary(table, getTableSettings(table), getBaseViewLabel(preset))}
          tableName={tableDefinition.stableId}
        />
      )}
    </Box>
  );
};

export default CurrentView;
