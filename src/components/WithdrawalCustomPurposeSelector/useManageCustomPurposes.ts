import { useCallback, useState } from 'react';

import { useLocalization } from 'src/providers';
import {
  WithdrawalCustomPurposePayload,
  useUpdateCustomPurposeMutation,
} from 'src/queries/generated/withdrawalCustomPurposes';
import useSnackbar from 'src/utils/useSnackbar';
import { findCustomPurposeByName, normalizeCustomPurposeName } from 'src/utils/withdrawalCustomPurposes';

type UseManageCustomPurposesProps = {
  customPurposes: WithdrawalCustomPurposePayload[];
  /** The name the withdrawal being filled in is using, so a rename or archive can follow it. */
  selectedName: string;
  onSelectedNameChange: (name: string) => void;
};

/**
 * Renaming and archiving the organization's saved purposes, shared by the suggestion list and the
 * dialog that offers the same actions to keyboard users.
 */
const useManageCustomPurposes = ({
  customPurposes,
  selectedName,
  onSelectedNameChange,
}: UseManageCustomPurposesProps) => {
  const { strings } = useLocalization();
  const snackbar = useSnackbar();
  const [updateCustomPurpose, { isLoading: isUpdating }] = useUpdateCustomPurposeMutation();

  const [editing, setEditing] = useState<{ id: number; name: string }>();
  const [archiving, setArchiving] = useState<WithdrawalCustomPurposePayload>();

  const startRenaming = useCallback((customPurpose: WithdrawalCustomPurposePayload) => {
    setEditing({ id: customPurpose.id, name: customPurpose.name });
  }, []);

  const cancelRenaming = useCallback(() => setEditing(undefined), []);

  const changeEditingName = useCallback((name: string) => {
    setEditing((previous) => (previous ? { ...previous, name } : previous));
  }, []);

  /** Resolves to whether the editor is finished with: a rejected name stays open for correction. */
  const saveRename = useCallback(async (): Promise<boolean> => {
    if (!editing) {
      return false;
    }

    const name = editing.name.trim();
    const previous = customPurposes.find((customPurpose) => customPurpose.id === editing.id);
    if (name === '' || name === previous?.name) {
      setEditing(undefined);
      return true;
    }

    const conflict = findCustomPurposeByName(customPurposes, name);
    if (conflict && conflict.id !== editing.id) {
      snackbar.toastError(strings.CUSTOM_PURPOSE_NAME_EXISTS);
      return false;
    }

    try {
      await updateCustomPurpose({
        customPurposeId: editing.id,
        updateWithdrawalCustomPurposeRequestPayload: { name },
      }).unwrap();
      // The withdrawal refers to the purpose by name, not by id, so it has to follow the rename.
      if (previous && normalizeCustomPurposeName(selectedName) === normalizeCustomPurposeName(previous.name)) {
        onSelectedNameChange(name);
      }
      setEditing(undefined);
      return true;
    } catch (e) {
      snackbar.toastError((e as { status?: number })?.status === 409 ? strings.CUSTOM_PURPOSE_NAME_EXISTS : undefined);
      return false;
    }
  }, [customPurposes, editing, onSelectedNameChange, selectedName, snackbar, strings, updateCustomPurpose]);

  const archive = useCallback(async () => {
    if (!archiving) {
      return;
    }

    try {
      await updateCustomPurpose({
        customPurposeId: archiving.id,
        updateWithdrawalCustomPurposeRequestPayload: { isArchived: true },
      }).unwrap();
      if (normalizeCustomPurposeName(selectedName) === normalizeCustomPurposeName(archiving.name)) {
        onSelectedNameChange('');
      }
      setArchiving(undefined);
    } catch (e) {
      snackbar.toastError();
    }
  }, [archiving, onSelectedNameChange, selectedName, snackbar, updateCustomPurpose]);

  return {
    archive,
    archiving,
    cancelRenaming,
    changeEditingName,
    editing,
    isUpdating,
    saveRename,
    startArchiving: setArchiving,
    startRenaming,
    stopArchiving: useCallback(() => setArchiving(undefined), []),
  };
};

export default useManageCustomPurposes;
