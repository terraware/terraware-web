import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, SxProps, useTheme } from '@mui/material';
import { ValueType } from '@terraware/web-components/components/Autocomplete/Autocomplete';

import Autocomplete from 'src/components/common/Autocomplete';
import useWithdrawalCustomPurposes from 'src/hooks/useWithdrawalCustomPurposes';
import { useLocalization, useOrganization } from 'src/providers';
import { WithdrawalCustomPurposePayload } from 'src/queries/generated/withdrawalCustomPurposes';
import { isAdmin } from 'src/utils/organization';
import {
  CUSTOM_PURPOSE_MAX_LENGTH,
  isCustomPurposeTooLong,
  normalizeCustomPurposeName,
} from 'src/utils/withdrawalCustomPurposes';

import ArchiveCustomPurposeModal from './ArchiveCustomPurposeModal';
import CustomPurposeRowContent from './CustomPurposeRowContent';
import useManageCustomPurposes from './useManageCustomPurposes';

type WithdrawalCustomPurposeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  /** Reports a rename or archive that is still in flight, so the form can hold the user on it. */
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
  id?: string;
  sx?: SxProps;
};

/**
 * The shared dialog decides whether a click dismissed it by looking at the class of the element
 * clicked, not at which dialog the handler belongs to. A dialog opened from inside another one
 * therefore closes both, so its events stop here.
 */
const NestedDialogBoundary = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <Box onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()}>
    {children}
  </Box>
);

/**
 * Names an Other withdrawal, picked from the organization's saved purposes or typed in. A typed
 * name that doesn't match a saved one is added to the organization's list by the withdrawal itself.
 * Admins can also rename and archive the saved purposes.
 */
const WithdrawalCustomPurposeSelector = ({
  value,
  onChange,
  onBusyChange,
  disabled,
  id = 'custom-purpose',
  sx,
}: WithdrawalCustomPurposeSelectorProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { customPurposes } = useWithdrawalCustomPurposes();

  const [open, setOpen] = useState(false);
  // Set when the inline editor is about to take focus from the combobox, whose blur then asks the
  // list to close. That one request is the editor's own doing; every other one is the user's.
  const editorTakingFocus = useRef(false);

  const canManage = isAdmin(selectedOrganization);

  const {
    archive,
    archiving,
    cancelRenaming,
    changeEditingName,
    editing,
    isUpdating,
    saveRename,
    startArchiving,
    startRenaming,
    stopArchiving,
  } = useManageCustomPurposes({ customPurposes, selectedName: value, onSelectedNameChange: onChange });

  // A rename only reaches the withdrawal once the server answers. Until then the form must not
  // move on, or it would carry a snapshot of the name the purpose no longer has. Going away
  // mid-rename has to clear the flag too, or the form it belongs to stays stuck on this step.
  useEffect(() => {
    onBusyChange?.(isUpdating);
    return () => onBusyChange?.(false);
  }, [isUpdating, onBusyChange]);

  const beginRenaming = useCallback(
    (customPurpose: WithdrawalCustomPurposePayload) => {
      editorTakingFocus.current = true;
      startRenaming(customPurpose);
    },
    [startRenaming]
  );

  const endRenaming = useCallback(() => {
    editorTakingFocus.current = false;
    cancelRenaming();
  }, [cancelRenaming]);

  /**
   * Nothing closes the list if the user simply looks away mid-rename: the combobox blurred when
   * the editor took focus, so it has no blur left to report. Decide from where the focus actually
   * landed, once it has landed.
   */
  const handleEditorBlur = useCallback(() => {
    window.setTimeout(() => {
      const active = document.activeElement;
      const stayedInList = active instanceof HTMLElement && active.closest('.MuiAutocomplete-popper') !== null;
      const returnedToField = active instanceof HTMLElement && active.id === id;
      if (!stayedInList && !returnedToField) {
        endRenaming();
        setOpen(false);
      }
    }, 0);
  }, [endRenaming, id]);

  const options = useMemo(() => customPurposes.map((customPurpose) => customPurpose.name), [customPurposes]);

  const filterOptions = useCallback(
    (allOptions: ValueType[]) => {
      const query = normalizeCustomPurposeName(value);
      if (query === '') {
        return allOptions;
      }
      return allOptions.filter((option) => normalizeCustomPurposeName(String(option ?? '')).includes(query));
    },
    [value]
  );

  const focusField = useCallback(() => document.getElementById(id)?.focus(), [id]);

  const renderOption = useCallback(
    (optionProps: React.HTMLAttributes<HTMLLIElement>, option: ValueType) => {
      const name = String(option ?? '');
      const customPurpose = customPurposes.find((candidate) => candidate.name === name);
      const { key, ...liProps } = optionProps as React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };

      if (!customPurpose) {
        return (
          <li {...liProps} key={key ?? name}>
            {name}
          </li>
        );
      }

      const isEditing = editing?.id === customPurpose.id;

      return (
        <Box
          component='li'
          key={key ?? name}
          {...liProps}
          // While the row is a field rather than an option, clicking it must not pick it.
          {...(isEditing ? { onClick: (event: React.MouseEvent) => event.stopPropagation() } : {})}
          sx={{ alignItems: 'center', display: 'flex', gap: theme.spacing(1) }}
        >
          <CustomPurposeRowContent
            busy={isUpdating}
            canManage={canManage}
            customPurpose={customPurpose}
            editingName={isEditing ? editing.name : undefined}
            idPrefix={id}
            onArchive={() => startArchiving(customPurpose)}
            onBlur={handleEditorBlur}
            onCancelRename={() => {
              endRenaming();
              focusField();
            }}
            onEditingNameChange={changeEditingName}
            onSaveRename={() => {
              editorTakingFocus.current = false;
              // A name the list or the server rejects leaves the editor open for correction, and
              // the field beside it belongs to the withdrawal: typing there would edit that.
              void saveRename().then((finished) => {
                if (finished) {
                  focusField();
                }
              });
            }}
            onStartRename={() => beginRenaming(customPurpose)}
          />
        </Box>
      );
    },
    [
      beginRenaming,
      canManage,
      changeEditingName,
      customPurposes,
      editing,
      endRenaming,
      focusField,
      handleEditorBlur,
      id,
      isUpdating,
      saveRename,
      startArchiving,
      theme,
    ]
  );

  const archiveConfirmation = archiving ? (
    <NestedDialogBoundary>
      <ArchiveCustomPurposeModal
        busy={isUpdating}
        customPurpose={archiving}
        onClose={stopArchiving}
        onConfirm={() => void archive()}
      />
    </NestedDialogBoundary>
  ) : null;

  return (
    <>
      <Autocomplete
        freeSolo
        disabled={disabled}
        id={id}
        options={options}
        selected={value}
        placeholder={strings.ENTER_OR_SELECT}
        // Truncating here would leave the field showing text the withdrawal wouldn't save, since
        // the component keeps its own input text once the value it is given stops changing.
        onChange={(newValue) => onChange(String(newValue ?? ''))}
        errorText={
          isCustomPurposeTooLong(value)
            ? (strings.formatString(strings.NAME_MAXIMUM_LENGTH_X, CUSTOM_PURPOSE_MAX_LENGTH) as string)
            : undefined
        }
        filterOptions={filterOptions}
        open={open}
        onOpen={() => setOpen(true)}
        // The list has to outlive the blur that opening the inline editor causes — but only
        // that one. Anything else asking it to close, such as picking another suggestion,
        // means the user is done with the rename.
        onClose={() => {
          if (editorTakingFocus.current) {
            editorTakingFocus.current = false;
            return;
          }
          endRenaming();
          setOpen(false);
        }}
        renderOption={renderOption}
        sx={sx}
      />
      {archiveConfirmation}
    </>
  );
};

export default WithdrawalCustomPurposeSelector;
