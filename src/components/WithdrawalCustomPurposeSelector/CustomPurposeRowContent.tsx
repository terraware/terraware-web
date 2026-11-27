import React, { type JSX } from 'react';

import { Box, IconButton, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import Textfield from 'src/components/common/Textfield/Textfield';
import { useLocalization } from 'src/providers';
import { WithdrawalCustomPurposePayload } from 'src/queries/generated/withdrawalCustomPurposes';
import { CUSTOM_PURPOSE_MAX_LENGTH } from 'src/utils/withdrawalCustomPurposes';

type CustomPurposeRowContentProps = {
  customPurpose: WithdrawalCustomPurposePayload;
  canManage: boolean;
  editingName?: string;
  busy?: boolean;
  idPrefix: string;
  onArchive: () => void;
  /** Called when focus leaves the rename editor, for callers that have to react to it. */
  onBlur?: () => void;
  onCancelRename: () => void;
  onEditingNameChange: (name: string) => void;
  onSaveRename: () => void;
  onStartRename: () => void;
};

/**
 * One saved purpose, either as its name with the actions an admin can take on it, or as the field
 * that renames it. The caller supplies the row around it, since it is used both as an option in the
 * suggestion list and as a row in the dialog that makes the same actions reachable by keyboard.
 */
const CustomPurposeRowContent = ({
  customPurpose,
  canManage,
  editingName,
  busy,
  idPrefix,
  onArchive,
  onBlur,
  onCancelRename,
  onEditingNameChange,
  onSaveRename,
  onStartRename,
}: CustomPurposeRowContentProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();

  if (editingName !== undefined) {
    return (
      <Box
        display='flex'
        alignItems='center'
        gap={theme.spacing(1)}
        width='100%'
        onBlur={onBlur}
        onKeyDown={(event: React.KeyboardEvent) => {
          // The suggestion list is a combobox popup: without this, Enter and Escape would reach it
          // and pick or dismiss an option instead of finishing the rename.
          event.stopPropagation();
          if (event.key === 'Enter') {
            onSaveRename();
          } else if (event.key === 'Escape') {
            onCancelRename();
          }
        }}
      >
        <Textfield
          autoFocus
          id={`${idPrefix}-rename-${customPurpose.id}`}
          label=''
          maxLength={CUSTOM_PURPOSE_MAX_LENGTH}
          onChange={(name) => onEditingNameChange(String(name ?? ''))}
          type='text'
          value={editingName}
        />
        <IconButton aria-label={strings.SAVE} disabled={busy} onClick={onSaveRename} size='small' title={strings.SAVE}>
          <Icon name='checkmark' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box display='flex' alignItems='center' justifyContent='space-between' gap={theme.spacing(1)} width='100%'>
      <span>{customPurpose.name}</span>
      {canManage && (
        <Box display='flex' gap={theme.spacing(0.5)}>
          <IconButton
            aria-label={strings.formatString(strings.RENAME_X, customPurpose.name) as string}
            onClick={(event) => {
              event.stopPropagation();
              onStartRename();
            }}
            onMouseDown={(event) => event.preventDefault()}
            size='small'
            title={strings.RENAME}
          >
            <Icon name='iconEdit' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
          </IconButton>
          <IconButton
            aria-label={strings.formatString(strings.ARCHIVE_X, customPurpose.name) as string}
            onClick={(event) => {
              event.stopPropagation();
              onArchive();
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
};

export default CustomPurposeRowContent;
