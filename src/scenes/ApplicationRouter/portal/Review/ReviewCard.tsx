import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { requestSubmitApplication } from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationSubmit } from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import { useApplicationData } from '../../../../providers/Application/Context';

type ReviewCardProps = {
  sections: {
    name: string;
    status?: 'Incomplete' | 'Complete';
  }[];
};

const ReviewCard = ({ sections }: ReviewCardProps): JSX.Element => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { selectedApplication, reload } = useApplicationData();
  const { goToApplicationReview } = useNavigateTo();
  const { toastSuccess, toastWarning } = useSnackbar();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectApplicationSubmit(requestId));

  const statusText = (status: 'Incomplete' | 'Complete') => (
    <Typography
      color={status === 'Incomplete' ? theme.palette.TwClrTxtDanger : theme.palette.TwClrTxtSuccess}
      display={'inline'}
      fontWeight={'bold'}
    >
      {status}
    </Typography>
  );

  const refreshPage = useCallback(() => {
    if (selectedApplication) {
      goToApplicationReview(selectedApplication.id);
    }
  }, [selectedApplication, goToApplicationReview]);

  const allSectionsCompleted = sections.every(({ status }) => status === 'Complete');

  const submit = useCallback(() => {
    if (selectedApplication) {
      const dispatched = dispatch(requestSubmitApplication({ applicationId: selectedApplication.id }));
      setRequestId(dispatched.requestId);
    }
  }, [dispatch, selectedApplication, setRequestId]);

  useEffect(() => {
    if (result && result.status === 'success' && result.data) {
      if (result.data.length === 0) {
        toastSuccess(strings.SUCCESS);
        reload(refreshPage);
      } else {
        toastWarning(`${strings.GENERIC_ERROR}: ${result.data.toString()}`);
      }
    }
  }, [result, reload, toastSuccess]);

  const isLoading = useMemo(() => result?.status === 'pending', [result]);

  return (
    <Card
      title={strings.REVIEW_YOUR_APPLICATION}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        alignItems: 'center',
        padding: theme.spacing(3),
      }}
    >
      {sections.map(({ name, status }, index: number) => (
        <Box
          key={index}
          borderRadius={theme.spacing(1)}
          borderColor={theme.palette.TwClrBaseGreen300}
          border={1}
          paddingY={theme.spacing(1)}
          marginBottom={theme.spacing(2)}
          width={'600px'}
        >
          <Typography
            align={'center'}
            color={theme.palette.TwClrTxt}
            fontSize='16px'
            fontWeight={400}
            lineHeight='24px'
          >
            {strings.formatString(
              strings.REVIEW_APPLICATION_STATUS_TEXT,
              <b>{name}</b>,
              statusText(status ?? 'Incomplete')
            )}
          </Typography>
        </Box>
      ))}
      <Typography
        align={'center'}
        color={theme.palette.TwClrTxt}
        fontSize='16px'
        fontWeight={400}
        lineHeight='24px'
        marginTop={theme.spacing(2)}
        marginBottom={theme.spacing(2)}
      >
        {allSectionsCompleted ? strings.REVIEW_APPLICATION_COMPLETE : strings.REVIEW_APPLICATION_INCOMPLETE}
      </Typography>

      <Button
        disabled={!allSectionsCompleted || isLoading}
        label={strings.SUBMIT_APPLICATION}
        size='medium'
        onClick={() => submit()}
      />
    </Card>
  );
};

export default ReviewCard;
