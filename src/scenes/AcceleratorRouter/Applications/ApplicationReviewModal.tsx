import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
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

  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectApplicationReview(requestId));

  const dropdownOptions: DropdownItem[] = ApplicationReviewStatuses.map((status) => ({
    label: status,
    value: status,
  }));

  const getApplicationReviewStatus = (status: ApplicationStatus): ApplicationReviewStatus => {
    switch (status) {
      case 'In Review':
        return 'Submitted';
      case 'Waitlist':
        return 'Issue Pending';
      default:
        return status;
    }
  };

  const [applicationReview, , onChange] = useForm<ApplicationReview>({
    status: getApplicationReviewStatus(application.status),
    feedback: application.feedback,
    internalComment: application.internalComment,
  });

  const canUpdateStatus = useMemo(
    () =>
      ApplicationReviewStatuses.find((status) => status === application.status) !== undefined &&
      !(application.status === 'Failed Pre-screen' || application.status === 'Not Submitted'),
    [application.status]
  );

  const onCloseWrapper = useCallback(() => {
    if (!(result?.status === 'pending')) {
      onClose();
    }
  }, [onClose]);

  const hasChange = useCallback(() => {
    const originalReview: ApplicationReview = {
      feedback: application.feedback,
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
                onChange={(value) => {
                  onChange('status', value);
                }}
                options={dropdownOptions}
                required
                selectedValue={applicationReview.status}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                type='textarea'
                label={strings.FEEDBACK}
                id='feedback'
                onChange={(value) => {
                  onChange('feedback', value);
                }}
                sx={{ marginTop: theme.spacing(1) }}
                value={applicationReview.feedback}
              />
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <TextField
            type='textarea'
            label={strings.INTERNAL_COMMENTS}
            id='internalComment'
            onChange={(value) => {
              onChange('internalComment', value);
            }}
            sx={{ marginTop: theme.spacing(1) }}
            value={applicationReview.internalComment}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
};

export default ApplicationReviewModal;
