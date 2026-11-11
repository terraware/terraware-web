import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box } from '@mui/material';
import { MRT_RowData } from 'material-react-table';

import DeleteViewModal from 'src/components/common/DeleteViewModal';
import SaveViewModal from 'src/components/common/SaveViewModal';
import Button from 'src/components/common/button/Button';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { MIXPANEL_EVENTS, TableViewEventContext, TableViewSaveSource } from 'src/mixpanelEvents';
import { useLocalization, useOrganization, useUser } from 'src/providers';
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
import { getSavedViewAnalytics, getTableViewUserRole } from './tableViewAnalytics';
import { getSaveViewSummary, getViewSummary } from './viewSummary';
import { CurrentViewTable, toTableSource } from './viewTable';

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
  table: CurrentViewTable<TData>;
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
  table: tableInstance,
  tableDefinition,
}: CurrentViewProps<TData>) => {
  'use no memo';
  const table = useMemo(() => toTableSource(tableInstance), [tableInstance]);
  const { strings } = useLocalization();
  const snackbar = useSnackbar();
  const trackEvent = useTrackEvent();
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const [updateSavedTableView] = useUpdateSavedTableViewMutation();
  const storageKey = `${tableDefinition.storageKey}-currentView`;
  const [preset, setPreset] = useState(() => {
    const storedPreset = loadStoredView(storageKey).preset;
    return storedPreset === DEFAULT_VIEW || presetViews?.some((presetView) => presetView.value === storedPreset)
      ? (storedPreset as string)
      : defaultPreset;
  });
  const [savedViewId, setSavedViewId] = useState(() => loadStoredView(storageKey).savedViewId);
  const [saveSource, setSaveSource] = useState<TableViewSaveSource>();
  const [viewToDelete, setViewToDelete] = useState<{ id: number; name: string }>();
  const {
    data: savedTableViewsData,
    isError: isSavedTableViewsError,
    refetch: refetchSavedTableViews,
  } = useListSavedTableViewsQuery({ organizationId, tableName: tableDefinition.stableId });
  const getBaseViewLabel = useCallback(
    (baseView?: string) => {
      if (baseView !== DEFAULT_VIEW) {
        return presetViews?.find((presetView) => presetView.value === baseView)?.label;
      }
      return undefined;
    },
    [presetViews]
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
  const activeSavedViewId = isSavedViewAvailable ? savedViewId : undefined;

  const isConsole = organizationId === undefined;
  const trackingContext = useMemo<TableViewEventContext>(
    () => ({
      table: tableDefinition.stableId,
      location: isConsole ? 'console' : 'forestry_view',
      user_id: user?.id,
      org_id: organizationId,
    }),
    [isConsole, organizationId, tableDefinition.stableId, user?.id]
  );
  const userRole = getTableViewUserRole(isConsole, user, selectedOrganization?.role);
  const myViewsCount = savedTableViewsData?.views.length;

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
        applyTableSettings(table, {}, defaults);
      }
    },
    [changePreset, defaultSettings, presetViews, savedTableViewsData, table]
  );

  const handleSelect = useCallback(
    (value: string) => {
      const isSavedView = savedTableViewsData?.views.some((view) => `${view.id}` === value);
      const isDefault = !isSavedView && value === DEFAULT_VIEW;
      trackEvent(MIXPANEL_EVENTS.TABLE_VIEW_SELECTED, {
        ...trackingContext,
        view_type: isSavedView ? 'my_view' : isDefault ? 'default' : 'preset',
        preset_name: isSavedView || isDefault ? undefined : value,
        my_views_count: myViewsCount,
        user_role: userRole,
      });
      handleChange(value);
    },
    [handleChange, myViewsCount, savedTableViewsData, trackEvent, trackingContext, userRole]
  );

  const hasAppliedStoredView = useRef(false);
  useEffect(() => {
    if (hasAppliedStoredView.current || !savedTableViewsData) {
      return;
    }
    hasAppliedStoredView.current = true;
    const storedView = savedTableViewsData.views.find((view) => `${view.id}` === activeSavedViewId);
    if (storedView) {
      applyTableSettings(
        table,
        storedView.settings as Partial<TableSettings>,
        getDefaultTableSettings(table, defaultSettings)
      );
    }
  }, [activeSavedViewId, defaultSettings, savedTableViewsData, table]);

  const handleRename = useCallback(
    async (value: string, name: string) => {
      try {
        await updateSavedTableView({ id: Number(value), updateSavedTableViewRequestPayload: { name } }).unwrap();
        trackEvent(MIXPANEL_EVENTS.TABLE_VIEW_RENAMED, trackingContext);
        snackbar.toastSuccess(strings.formatString(strings.SAVED_VIEW_UPDATED, name));
      } catch (error) {
        snackbar.toastError();
        throw error;
      }
    },
    [snackbar, strings, trackEvent, trackingContext, updateSavedTableView]
  );

  const handleDeleteView = useCallback(
    (value: string) => setViewToDelete(savedTableViewsData?.views.find((view) => `${view.id}` === value)),
    [savedTableViewsData]
  );
  const closeDeleteViewModal = useCallback(() => setViewToDelete(undefined), []);
  const handleDeleted = useCallback(
    (deletedViewId: number) => {
      trackEvent(MIXPANEL_EVENTS.TABLE_VIEW_DELETED, trackingContext);
      if (`${deletedViewId}` === activeSavedViewId) {
        handleChange(DEFAULT_VIEW);
      }
    },
    [activeSavedViewId, handleChange, trackEvent, trackingContext]
  );

  const handleSaved = useCallback(
    (newViewId: number) => {
      if (saveSource) {
        trackEvent(MIXPANEL_EVENTS.TABLE_VIEW_SAVED, {
          ...trackingContext,
          ...getSavedViewAnalytics(table, getTableSettings(table), getDefaultTableSettings(table, defaultSettings)),
          source: saveSource,
          base_view: preset,
          my_views_count: (myViewsCount ?? 0) + 1,
          user_role: userRole,
        });
      }
      setSavedViewId(`${newViewId}`);
    },
    [defaultSettings, myViewsCount, preset, saveSource, table, trackEvent, trackingContext, userRole]
  );

  const selectedSavedView = savedTableViewsData?.views.find((view) => `${view.id}` === activeSavedViewId);
  const isModified = isTableModified(
    table,
    (selectedSavedView?.settings ?? {}) as Partial<TableSettings>,
    getDefaultTableSettings(table, defaultSettings)
  );

  const openSaveViewModal = useCallback(
    (source: TableViewSaveSource) => {
      if (isSavedTableViewsError) {
        void refetchSavedTableViews();
      }
      trackEvent(MIXPANEL_EVENTS.TABLE_VIEW_SAVE_STARTED, { ...trackingContext, source, user_role: userRole });
      setSaveSource(source);
    },
    [isSavedTableViewsError, refetchSavedTableViews, trackEvent, trackingContext, userRole]
  );
  const openSaveViewModalFromMenu = useCallback(() => openSaveViewModal('menu'), [openSaveViewModal]);
  const openSaveViewModalFromButton = useCallback(() => openSaveViewModal('save_button'), [openSaveViewModal]);
  const closeSaveViewModal = useCallback(() => setSaveSource(undefined), []);

  return (
    <Box display='flex' alignItems='center' gap={1} paddingTop={0.5} marginBottom={-0.5}>
      <Box width='300px' flexShrink={0}>
        <CurrentViewSelect
          defaultViewLabel={defaultViewLabel}
          id={id}
          modified={isModified}
          myViews={savedViewOptions}
          onChange={handleSelect}
          onDeleteView={handleDeleteView}
          onRenameView={handleRename}
          onSave={openSaveViewModalFromMenu}
          presetViews={presetViews}
          selected={activeSavedViewId ?? preset}
          showSave
        />
      </Box>
      {isModified && (
        <Button
          id={`${id ?? 'current-view'}-save-button`}
          label={strings.SAVE_VIEW_BUTTON}
          onClick={openSaveViewModalFromButton}
          priority='ghost'
        />
      )}
      {viewToDelete && <DeleteViewModal onClose={closeDeleteViewModal} onDeleted={handleDeleted} view={viewToDelete} />}
      {saveSource && (
        <SaveViewModal
          baseView={preset}
          existingNames={savedTableViewsData && savedViewOptions.map((view) => view.label)}
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
