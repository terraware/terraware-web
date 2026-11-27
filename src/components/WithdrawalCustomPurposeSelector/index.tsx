import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, IconButton, SxProps, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { ValueType } from '@terraware/web-components/components/Autocomplete/Autocomplete';

import Autocomplete from 'src/components/common/Autocomplete';
import Textfield from 'src/components/common/Textfield/Textfield';
import useWithdrawalCustomPurposes from 'src/hooks/useWithdrawalCustomPurposes';
import { useLocalization, useOrganization } from 'src/providers';
import {
  WithdrawalCustomPurposePayload,
  useUpdateCustomPurposeMutation,
} from 'src/queries/generated/withdrawalCustomPurposes';
import { isAdmin } from 'src/utils/organization';
import useSnackbar from 'src/utils/useSnackbar';
import {
  CUSTOM_PURPOSE_MAX_LENGTH,
  findCustomPurposeByName,
  isCustomPurposeTooLong,
  normalizeCustomPurposeName,
} from 'src/utils/withdrawalCustomPurposes';

import ArchiveCustomPurposeModal from './ArchiveCustomPurposeModal';

type WithdrawalCustomPurposeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  sx?: SxProps;
};

/**
 * Names an Other withdrawal, picked from the organization's saved purposes or typed in. A typed
 * name that doesn't match a saved one is added to the organization's list by the withdrawal itself.
 * Admins can also rename and archive the saved purposes from the list.
 */
const WithdrawalCustomPurposeSelector = ({
  value,
  onChange,
  disabled,
  id = 'custom-purpose',
  sx,
}: WithdrawalCustomPurposeSelectorProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const { customPurposes } = useWithdrawalCustomPurposes();
  const [updateCustomPurpose, { isLoading: isUpdating }] = useUpdateCustomPurposeMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number; name: string }>();
  const [archiving, setArchiving] = useState<WithdrawalCustomPurposePayload>();

  const canManage = isAdmin(selectedOrganization);

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

  const saveEdit = useCallback(async () => {
    if (!editing) {
      return;
    }

    const name = editing.name.trim();
    const previous = customPurposes.find((customPurpose) => customPurpose.id === editing.id);
    if (name === '' || name === previous?.name) {
      setEditing(undefined);
      return;
    }

    const conflict = findCustomPurposeByName(customPurposes, name);
    if (conflict && conflict.id !== editing.id) {
      snackbar.toastError(strings.CUSTOM_PURPOSE_NAME_EXISTS);
      return;
    }

    try {
      await updateCustomPurpose({
        customPurposeId: editing.id,
        updateWithdrawalCustomPurposeRequestPayload: { name },
      }).unwrap();
      // The withdrawal being filled in refers to the purpose by name, not by id.
      if (previous && normalizeCustomPurposeName(value) === normalizeCustomPurposeName(previous.name)) {
        onChange(name);
      }
      setEditing(undefined);
    } catch (e) {
      snackbar.toastError((e as { status?: number })?.status === 409 ? strings.CUSTOM_PURPOSE_NAME_EXISTS : undefined);
    }
  }, [customPurposes, editing, onChange, snackbar, strings, updateCustomPurpose, value]);

  const archive = useCallback(async () => {
    if (!archiving) {
      return;
    }

    try {
      await updateCustomPurpose({
        customPurposeId: archiving.id,
        updateWithdrawalCustomPurposeRequestPayload: { isArchived: true },
      }).unwrap();
      if (normalizeCustomPurposeName(value) === normalizeCustomPurposeName(archiving.name)) {
        onChange('');
      }
      setArchiving(undefined);
    } catch (e) {
      snackbar.toastError();
    }
  }, [archiving, onChange, snackbar, updateCustomPurpose, value]);

  const renderOption = useCallback(
    (optionProps: React.HTMLAttributes<HTMLLIElement>, option: ValueType) => {
      const name = String(option ?? '');
      const customPurpose = customPurposes.find((candidate) => candidate.name === name);
      const { key, ...liProps } = optionProps as React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };

      if (editing && customPurpose?.id === editing.id) {
        return (
          <Box
            component='li'
            key={key ?? name}
            {...liProps}
            onClick={(event: React.MouseEvent) => event.stopPropagation()}
            onKeyDown={(event: React.KeyboardEvent) => {
              event.stopPropagation();
              if (event.key === 'Enter') {
                void saveEdit();
              } else if (event.key === 'Escape') {
                setEditing(undefined);
              }
            }}
            sx={{ alignItems: 'center', display: 'flex', gap: theme.spacing(1) }}
          >
            <Textfield
              autoFocus
              id={`${id}-rename-${customPurpose.id}`}
              label=''
              maxLength={CUSTOM_PURPOSE_MAX_LENGTH}
              onChange={(newName) => setEditing({ id: customPurpose.id, name: String(newName ?? '') })}
              type='text'
              value={editing.name}
            />
            <IconButton
              aria-label={strings.SAVE}
              disabled={isUpdating}
              onClick={() => void saveEdit()}
              size='small'
              title={strings.SAVE}
            >
              <Icon name='iconEdit' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
            </IconButton>
          </Box>
        );
      }

      return (
        <Box
          component='li'
          key={key ?? name}
          {...liProps}
          sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', gap: theme.spacing(1) }}
        >
          <span>{name}</span>
          {canManage && customPurpose && (
            <Box display='flex' gap={theme.spacing(0.5)}>
              <IconButton
                aria-label={strings.formatString(strings.RENAME_X, name) as string}
                onClick={(event) => {
                  event.stopPropagation();
                  setEditing({ id: customPurpose.id, name: customPurpose.name });
                }}
                onMouseDown={(event) => event.preventDefault()}
                size='small'
                title={strings.RENAME}
              >
                <Icon name='iconEdit' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
              </IconButton>
              <IconButton
                aria-label={strings.formatString(strings.ARCHIVE_X, name) as string}
                onClick={(event) => {
                  event.stopPropagation();
                  setArchiving(customPurpose);
                }}
                onMouseDown={(event) => event.preventDefault()}
                size='small'
                title={strings.ARCHIVE}
              >
                <Icon name='iconFolder' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
              </IconButton>
            </Box>
          )}
        </Box>
      );
    },
    [canManage, customPurposes, editing, id, isUpdating, saveEdit, strings, theme]
  );

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
        // Renaming happens inside the list, so the list has to outlive the blur it causes.
        onClose={() => {
          if (!editing) {
            setOpen(false);
          }
        }}
        renderOption={renderOption}
        sx={sx}
      />
      {archiving && (
        <ArchiveCustomPurposeModal
          busy={isUpdating}
          customPurpose={archiving}
          onClose={() => setArchiving(undefined)}
          onConfirm={() => void archive()}
        />
      )}
    </>
  );
};

export default WithdrawalCustomPurposeSelector;
