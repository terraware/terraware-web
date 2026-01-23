import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography } from '@mui/material';
import { DropdownItem, theme } from '@terraware/web-components';

import CompleteIncompleteBadge from 'src/components/common/CompleteIncompleteBadge';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { useLocalization } from 'src/providers';
import {
  selectUpdateVariableOwner,
  selectUpdateVariableWorkflowDetails,
} from 'src/redux/features/documentProducer/variables/variablesSelector';
import {
  requestUpdateVariableOwner,
  requestUpdateVariableWorkflowDetails,
} from 'src/redux/features/documentProducer/variables/variablesThunks';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { User } from 'src/types/User';
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
  reload: () => void;
  reloadVariables: () => void;
};

export default function MultiLineComponentNonEditable({
  id,
  titleNumber,
  title,
  description,
  status,
  variableId,
  projectId,
  reload,
  ownerId,
  reloadVariables,
}: MultiLineComponentNonEditableProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const [requestId, setRequestId] = useState('');
  const [assignOwnerRequestId, setAssignOwnerRequestId] = useState('');
  const updateWorkflowDetailsResponse = useAppSelector(selectUpdateVariableWorkflowDetails(requestId));
  const updateOwnerResponse = useAppSelector(selectUpdateVariableOwner(assignOwnerRequestId));
  const ownedBySelector = useAppSelector(selectUser(ownerId));
  const [ownedByUser, setOwnedByUser] = useState<User>();
  const [showAssignOwnerModal, setShowAssignOwnerModal] = useState(false);
  const [displayActionsHover, setDisplyActionsHover] = useState(false);

  useEffect(() => {
    setOwnedByUser(ownedBySelector);
  }, [ownedBySelector]);

  useEffect(() => {
    if (ownerId && ownerId !== -1) {
      void dispatch(requestGetUser(ownerId));
    }
  }, [dispatch, ownerId]);

  useEffect(() => {
    if (updateWorkflowDetailsResponse?.status === 'success') {
      reloadVariables();
    }
  }, [reloadVariables, updateWorkflowDetailsResponse]);

  useEffect(() => {
    if (updateOwnerResponse?.status === 'success') {
      snackbar.toastSuccess(strings.SECTION_OWNER_ASSIGNED);
      reload();
    }
    if (updateOwnerResponse?.status === 'error') {
      snackbar.toastError();
    }
  }, [reload, snackbar, updateOwnerResponse]);

  const setStatus = useCallback(
    (_status: VariableStatusType) => {
      const request = dispatch(requestUpdateVariableWorkflowDetails({ status: _status, variableId, projectId }));
      setRequestId(request.requestId);
    },
    [dispatch, projectId, variableId]
  );

  const assignOwner = (_ownerId?: string) => {
    if (_ownerId) {
      let assignOwnerRequest;
      if (_ownerId.toString() === '-1') {
        assignOwnerRequest = dispatch(requestUpdateVariableOwner({ ownedBy: undefined, variableId, projectId }));
      } else {
        assignOwnerRequest = dispatch(requestUpdateVariableOwner({ ownedBy: Number(_ownerId), variableId, projectId }));
      }

      setAssignOwnerRequestId(assignOwnerRequest.requestId);
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
