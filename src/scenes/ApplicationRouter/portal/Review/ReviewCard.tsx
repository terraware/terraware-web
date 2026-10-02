import React, { type JSX, useCallback } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useApplicationData } from 'src/providers/Application/Context';
import { useSubmitApplicationMutation } from 'src/queries/generated/applications';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

type ReviewCardProps = {
  sections: {
    name: string;
    status?: 'Incomplete' | 'Complete';
  }[];
};

export const SUBMIT_APPLICATION_MUTATION_KEY = 'application-review-submit';

const ReviewCard = ({ sections }: ReviewCardProps): JSX.Element => {
  const theme = useTheme();

  const { selectedApplication } = useApplicationData();
  const { goToApplicationReview } = useNavigateTo();
  const { toastSuccess, toastWarning } = useSnackbar();

  const [submitApplication, { isLoading }] = useSubmitApplicationMutation({
    fixedCacheKey: SUBMIT_APPLICATION_MUTATION_KEY,
  });

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
    if (!selectedApplication) {
      return;
    }
    void submitApplication(selectedApplication.id)
      .unwrap()
      .then(({ problems }) => {
        if (problems.length === 0) {
          toastSuccess(strings.SUCCESS);
          refreshPage();
        } else {
          toastWarning(`${strings.GENERIC_ERROR}: ${problems.toString()}`);
        }
      })
      .catch(() => undefined);
  }, [refreshPage, selectedApplication, submitApplication, toastSuccess, toastWarning]);

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
