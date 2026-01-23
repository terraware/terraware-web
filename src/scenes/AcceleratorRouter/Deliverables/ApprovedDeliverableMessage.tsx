import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { ViewProps } from 'src/components/DeliverableView/types';
import { useLocalization } from 'src/providers/hooks';

const ApprovedDeliverableMessage = ({ deliverable }: ViewProps): JSX.Element | null => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const messageBody =
    deliverable?.type === 'Document'
      ? strings.THIS_DELIVERABLE_HAS_BEEN_APPROVED_DOCUMENT
      : deliverable?.type === 'Questions'
        ? strings.THIS_DELIVERABLE_HAS_BEEN_APPROVED_QUESTIONNAIRE
        : strings.THIS_DELIVERABLE_HAS_BEEN_APPROVED_SPECIES;

  if (deliverable?.status !== 'Approved') {
    return null;
  }

  return (
    <>
      <Box marginBottom={theme.spacing(4)}>
        <Message body={messageBody} priority='success' title={strings.DELIVERABLE_APPROVED} type='page' />
      </Box>
    </>
  );
};

export default ApprovedDeliverableMessage;
