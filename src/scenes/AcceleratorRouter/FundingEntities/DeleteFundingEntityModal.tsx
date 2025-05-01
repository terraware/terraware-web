import React from 'react';
import { useNavigate } from 'react-router';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import FundingEntityService from 'src/services/FundingEntityService';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';
import useSnackbar from 'src/utils/useSnackbar';

export interface DeleteFundingEntityModalProps {
  open: boolean;
  fundingEntity: FundingEntity;
  onClose: () => void;
}

const DeleteFundingEntityModal = ({ onClose, open, fundingEntity }: DeleteFundingEntityModalProps): JSX.Element => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const deleteHandler = async () => {
    const response = await FundingEntityService.deleteFundingEntity(fundingEntity.id);
    if (response.requestSucceeded) {
      void navigate(APP_PATHS.ACCELERATOR_FUNDING_ENTITIES);
    } else {
      snackbar.toastError();
    }
  };

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
