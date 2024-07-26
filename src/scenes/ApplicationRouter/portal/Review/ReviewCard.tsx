import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

type ReviewCardProps = {
  sections: {
    name: string;
    status?: 'Incomplete' | 'Complete';
  }[];
};

const ReviewCard = ({ sections }: ReviewCardProps): JSX.Element => {
  const theme = useTheme();

  const statusText = (status: 'Incomplete' | 'Complete') => (
    <Typography
      color={status === 'Incomplete' ? theme.palette.TwClrTxtDanger : theme.palette.TwClrTxtSuccess}
      display={'inline'}
      fontWeight={'bold'}
    >
      {status}
    </Typography>
  );

  const allSectionsCompleted = sections.every(({ status }) => status === 'Complete');

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
      <Grid
        container
        flexDirection={'column'}
        alignItems={'center'}
        spacing={theme.spacing(2)}
        paddingTop={theme.spacing(3)}
        paddingBottom={theme.spacing(6)}
      >
        {sections.map(({ name, status }, index: number) => (
          <Grid item xs={12} key={index}>
            <Box
              borderRadius={theme.spacing(1)}
              borderColor={theme.palette.TwClrBaseGreen300}
              border={1}
              paddingY={theme.spacing(2)}
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
          </Grid>
        ))}
      </Grid>

      <Typography
        align={'center'}
        color={theme.palette.TwClrTxt}
        fontSize='16px'
        fontWeight={400}
        lineHeight='24px'
        marginBottom={theme.spacing(4)}
      >
        {allSectionsCompleted ? strings.REVIEW_APPLICATION_COMPLETE : strings.REVIEW_APPLICATION_INCOMPLETE}
      </Typography>

      <Button disabled={!allSectionsCompleted} label={strings.SUBMIT_APPLICATION} size='medium' onClick={() => {}} />
    </Card>
  );
};

export default ReviewCard;
