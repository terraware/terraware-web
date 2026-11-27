import React, { type JSX, type ReactNode } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { WithdrawalCustomPurposePayload } from 'src/queries/generated/withdrawalCustomPurposes';

import CustomPurposeRowContent from './CustomPurposeRowContent';

type ManageCustomPurposesModalProps = {
  customPurposes: WithdrawalCustomPurposePayload[];
  editing?: { id: number; name: string };
  busy?: boolean;
  /**
   * The archive confirmation, rendered inside this dialog rather than beside it. Each dialog traps
   * focus within its own subtree, so a confirmation rendered as a sibling would be pulled out of
   * by this one and left unreachable from the keyboard.
   */
  confirmation?: ReactNode;
  onArchive: (customPurpose: WithdrawalCustomPurposePayload) => void;
  onCancelRename: () => void;
  onClose: () => void;
  onEditingNameChange: (name: string) => void;
  onSaveRename: () => void;
  onStartRename: (customPurpose: WithdrawalCustomPurposePayload) => void;
};

/**
 * The saved purposes as a list that can be reached with the keyboard. The suggestion list offers
 * the same actions, but it is a combobox popup: focus stays in the input while it is open, so the
 * buttons inside it are reachable with a pointer only.
 */
const ManageCustomPurposesModal = ({
  customPurposes,
  editing,
  busy,
  confirmation,
  onArchive,
  onCancelRename,
  onClose,
  onEditingNameChange,
  onSaveRename,
  onStartRename,
}: ManageCustomPurposesModalProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();

  return (
    <DialogBox
      onClose={onClose}
      open
      title={strings.SAVED_OTHER_PURPOSES}
      size='medium'
      middleButtons={[
        <Button id='closeManageCustomPurposes' key='button-1' label={strings.CLOSE} onClick={onClose} size='medium' />,
      ]}
      scrolled
      skrim
    >
      {customPurposes.length === 0 ? (
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {strings.NO_SAVED_OTHER_PURPOSES}
        </Typography>
      ) : (
        <Box component='ul' sx={{ listStyle: 'none', margin: 0, padding: 0, textAlign: 'left' }}>
          {customPurposes.map((customPurpose) => (
            <Box
              component='li'
              key={customPurpose.id}
              sx={{
                alignItems: 'center',
                borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                display: 'flex',
                padding: theme.spacing(1, 0),
              }}
            >
              <CustomPurposeRowContent
                busy={busy}
                canManage
                customPurpose={customPurpose}
                editingName={editing?.id === customPurpose.id ? editing.name : undefined}
                idPrefix='manage-custom-purpose'
                onArchive={() => onArchive(customPurpose)}
                onCancelRename={onCancelRename}
                onEditingNameChange={onEditingNameChange}
                onSaveRename={onSaveRename}
                onStartRename={() => onStartRename(customPurpose)}
              />
            </Box>
          ))}
        </Box>
      )}
      {confirmation}
    </DialogBox>
  );
};

export default ManageCustomPurposesModal;
