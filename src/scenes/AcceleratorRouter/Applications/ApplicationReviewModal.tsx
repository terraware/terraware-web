import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useUser } from 'src/providers';
import { requestReviewApplication } from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationReview } from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  Application,
  ApplicationReview,
  ApplicationReviewStatus,
  ApplicationReviewStatuses,
  ApplicationStatus,
  ApplicationStatusOrder,
} from 'src/types/Application';
import useForm from 'src/utils/useForm';

export type ApplicationReviewModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  application: Application;
};

const ApplicationReviewModal = ({
  open,
  onClose,
  onSuccess,
  application,
}: ApplicationReviewModalProps): JSX.Element => {
  const theme = useTheme();
  const { isAllowed } = useUser();

  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectApplicationReview(requestId));

  const dropdownOptions: DropdownItem[] = ApplicationReviewStatuses.sort((a, b) => {
    return ApplicationStatusOrder[a] - ApplicationStatusOrder[b];
  }).map((status) => ({
    label: status,
    value: status,
  }));

  const getApplicationReviewStatus = (status: ApplicationStatus): ApplicationReviewStatus => {
    switch (status) {
      case 'In Review':
        return 'Submitted';
      case 'Waitlist':
        return 'Issue Reassessment';
      default:
        return status;
    }
  };

  const [applicationReview, , , onChangeCallback] = useForm<ApplicationReview>({
    status: getApplicationReviewStatus(application.status),
    internalComment: application.internalComment,
  });

  const canUpdateStatus = useMemo(
    () =>
      isAllowed('UPDATE_APPLICATION_STATUS') &&
      ApplicationReviewStatuses.find((status) => status === application.status) !== undefined,
    [application.status, isAllowed]
  );

  const onCloseWrapper = useCallback(() => {
    if (!(result?.status === 'pending')) {
      onClose();
    }
  }, [onClose, result?.status]);

  const hasChange = useCallback(() => {
    const originalReview: ApplicationReview = {
      internalComment: application.internalComment,
      status: getApplicationReviewStatus(application.status),
    };
    return applicationReview !== originalReview;
  }, [applicationReview, application]);

  const onSave = useCallback(() => {
    if (hasChange()) {
      const dispatched = dispatch(
        requestReviewApplication({ applicationId: application.id, review: applicationReview })
      );
      setRequestId(dispatched.requestId);
    }
  }, [dispatch, application, applicationReview, hasChange, setRequestId]);

  useEffect(() => {
    if (result && result.status === 'success') {
      onSuccess();
      onClose();
      return;
    }
  }, [result, onSuccess, onClose]);

  const busy = useMemo(() => result?.status === 'pending', [result]);

  return (
    <DialogBox
      onClose={onCloseWrapper}
      open={open}
      title={strings.REVIEW_APPLICATION}
      size='medium'
      middleButtons={[
        <Button
          id='cancelReview'
          label={strings.CANCEL}
          disabled={busy}
          priority='secondary'
          type='passive'
          onClick={onCloseWrapper}
          key='cancel-button'
        />,
        <Button
          id='saveNewApplication'
          label={strings.SAVE}
          disabled={busy || !hasChange()}
          onClick={onSave}
          key='save-button'
        />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        {canUpdateStatus && (
          <>
            <Grid item xs={12}>
              <Dropdown
                fullWidth={true}
                label={strings.APPLICATION_STATUS}
                onChange={onChangeCallback('status')}
                options={dropdownOptions}
                required
                selectedValue={applicationReview.status}
              />
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <TextField
            type='textarea'
            label={strings.INTERNAL_COMMENTS}
            id='internalComment'
            onChange={onChangeCallback('internalComment')}
            sx={{ marginTop: theme.spacing(1) }}
            value={applicationReview.internalComment}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
};

export default ApplicationReviewModal;
