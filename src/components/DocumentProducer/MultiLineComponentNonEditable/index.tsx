import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography } from '@mui/material';
import { DropdownItem, theme } from '@terraware/web-components';

import CompleteIncompleteBadge from 'src/components/common/CompleteIncompleteBadge';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { useLocalization } from 'src/providers';
import {
  useUpdateVariableOwnerMutation,
  useUpdateVariableWorkflowDetailsMutation,
} from 'src/queries/generated/documentProducerVariables';
import { useGetUserQuery } from 'src/queries/generated/users';
import strings from 'src/strings';
import { VariableStatusType } from 'src/types/documentProducer/Variable';
import useSnackbar from 'src/utils/useSnackbar';
import { getUserDisplayName } from 'src/utils/user';

import AssignOwnerModal from './AssignOwnerModal';

type MultiLineComponentNonEditableProps = {
  id?: string;
  titleNumber?: string;
  title: string;
  description: string;
  status: VariableStatusType;
  variableId: number;
  projectId: number;
  ownerId?: number;
};

export default function MultiLineComponentNonEditable({
  id,
  titleNumber,
  title,
  description,
  status,
  variableId,
  projectId,
  ownerId,
}: MultiLineComponentNonEditableProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const snackbar = useSnackbar();
  const [updateVariableWorkflowDetails] = useUpdateVariableWorkflowDetailsMutation();
  const [updateVariableOwner] = useUpdateVariableOwnerMutation();
  const { currentData: ownerData } = useGetUserQuery(ownerId ?? -1, { skip: !ownerId || ownerId === -1 });
  const ownedByUser = ownerData?.user;
  const [showAssignOwnerModal, setShowAssignOwnerModal] = useState(false);
  const [displayActionsHover, setDisplyActionsHover] = useState(false);

  const setStatus = useCallback(
    (_status: VariableStatusType) => {
      void updateVariableWorkflowDetails({
        projectId,
        variableId,
        updateVariableWorkflowDetailsRequestPayload: { status: _status },
      })
        .unwrap()
        .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
    },
    [projectId, snackbar, updateVariableWorkflowDetails, variableId]
  );

  const assignOwner = (_ownerId?: string) => {
    if (_ownerId) {
      const ownedBy = _ownerId.toString() === '-1' ? undefined : Number(_ownerId);
      void updateVariableOwner({ projectId, variableId, updateVariableOwnerRequestPayload: { ownedBy } })
        .unwrap()
        .then(() => snackbar.toastSuccess(strings.SECTION_OWNER_ASSIGNED))
        .catch(() => snackbar.toastError(strings.GENERIC_ERROR));
      setShowAssignOwnerModal(false);
    }
  };

  const ownedByName = useMemo(() => getUserDisplayName(ownedByUser), [ownedByUser]);
  const optionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: status === 'Complete' ? strings.MARK_AS_INCOMPLETE : strings.MARK_AS_COMPLETE,
              value: 'changeStatus',
            },
            {
              label: strings.ASSIGN_OWNER_ELLIPSIS,
              value: 'assignOwner',
            },
          ]
        : [],
    [activeLocale, status]
  );

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      switch (optionItem.value) {
        case 'changeStatus': {
          setStatus(status === 'Complete' ? 'Incomplete' : 'Complete');
          break;
        }
        case 'assignOwner': {
          setShowAssignOwnerModal(true);
          break;
        }
      }
    },
    [setStatus, status]
  );

  return (
    <>
      {showAssignOwnerModal && (
        <AssignOwnerModal onClose={() => setShowAssignOwnerModal(false)} onSubmit={assignOwner} ownerId={ownerId} />
      )}
      <Box
        id={id}
        sx={{
          padding: theme.spacing(2),
          '&:hover': {
            background: theme.palette.TwClrBgHover,
            '.actions-hover': {
              display: 'flex',
            },
            '.actions': {
              display: 'none',
            },
          },
          background: displayActionsHover ? theme.palette.TwClrBgHover : 'none',
          '& .actions-hover': {
            display: displayActionsHover ? 'flex' : 'none',
          },
          '& .actions': {
            display: displayActionsHover ? 'none' : 'block',
          },
        }}
      >
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography fontWeight={600}>{titleNumber ? `${titleNumber} ${title}` : title}</Typography>
          <Box className='actions'>
            <CompleteIncompleteBadge status={status} />
          </Box>
          <Box className='actions-hover' sx={{ 'align-items': 'center' }}>
            {ownedByName && (
              <Typography
                fontSize={'14px'}
                fontWeight={400}
                color={theme.palette.TwClrTxtSecondary}
                fontStyle={'italic'}
                lineHeight={'20px'}
              >{`${strings.OWNER}: ${ownedByName}`}</Typography>
            )}
            <Box sx={{ padding: '0 8px' }}>
              <CompleteIncompleteBadge status={status} />
            </Box>
            <OptionsMenu
              onOptionItemClick={onOptionItemClick}
              optionItems={optionItems}
              onOpen={() => setDisplyActionsHover(true)}
              onClose={() => setDisplyActionsHover(false)}
            />
          </Box>
        </Box>
        <Box sx={{ paddingTop: theme.spacing(1) }}>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
            {description}
          </Typography>
        </Box>
      </Box>
    </>
  );
}
