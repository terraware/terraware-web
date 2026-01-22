import React, { type JSX, useCallback, useEffect } from 'react';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useDeleteFundingEntityMutation } from 'src/queries/generated/fundingEntities';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';
import useSnackbar from 'src/utils/useSnackbar';

export interface DeleteFundingEntityModalProps {
  open: boolean;
  fundingEntity: FundingEntity;
  onClose: () => void;
}

const DeleteFundingEntityModal = ({ onClose, open, fundingEntity }: DeleteFundingEntityModalProps): JSX.Element => {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const [deleteFundingEntity, result] = useDeleteFundingEntityMutation();

  const deleteHandler = useCallback(() => {
    void deleteFundingEntity(fundingEntity.id);
  }, [deleteFundingEntity, fundingEntity.id]);

  useEffect(() => {
    if (result.isSuccess) {
      navigate(APP_PATHS.ACCELERATOR_FUNDING_ENTITIES);
    } else if (result.isError) {
      snackbar.toastError();
    }
  }, [navigate, result.isError, result.isSuccess, snackbar]);

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.DELETE_FUNDING_ENTITY}
      size='medium'
      middleButtons={[
        <Button
          id='cancelDeleteFundingEntity'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id='saveDeleteFundingEntity'
          onClick={deleteHandler}
          type='destructive'
          label={strings.DELETE}
          key='button-2'
        />,
      ]}
      message={strings.formatString(strings.DELETE_FUNDING_ENTITY_MESSAGE, fundingEntity.name.toString())}
      skrim={true}
    >
      <Typography>{strings.DELETE_FUNDING_ENTITY_FUNDERS_MESSAGE}</Typography>
      <Typography sx={{ paddingTop: 3 }}>{strings.ARE_YOU_SURE}</Typography>
    </DialogBox>
  );
};

export default DeleteFundingEntityModal;
