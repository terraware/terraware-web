import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Message } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps, ViewProps } from 'src/components/DeliverableView/types';
import useUpdateDeliverable from 'src/components/DeliverableView/useUpdateDeliverable';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { requestListDeliverableVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectDeliverableVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListDeliverableVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import SubmitDeliverableDialog from './SubmitDeliverableDialog';

type QuestionDeliverableItem = {
  answer: string;
  description: string;
  feedback?: string;
  internal?: boolean;
  question: string;
  submissionStatus: DeliverableStatusType;
};

const QA_SETS: QuestionDeliverableItem[] = [
  {
    answer: 'Treemendo.us, Incorporated.',
    description: 'Official/full legal name under which your organization is registered.',
    question: 'What is the name of your organization?',
    submissionStatus: 'Approved',
  },
  {
    answer: 'Yal Ankovic',
    description: 'Name of the person responsible for the partnership.',
    question: 'What is the full name of the main contact of your organization?',
    submissionStatus: 'Approved',
  },
  {
    answer: 'yal.ankovic@treemendo.us',
    description: '',
    feedback: 'Please provide a valid email address.',
    question: 'What is the email address of the main contact?',
    submissionStatus: 'Rejected',
  },
  {
    answer: 'Ghana',
    description: '',
    question: 'In what country is your reforestation project located?',
    submissionStatus: 'In Review',
  },
  {
    answer: 'Single Location',
    description: 'Specify if the project occurs in more than one site (planting area).',
    internal: true,
    question: '[Internal] Does the project include single or multiple location(s)?',
    submissionStatus: 'In Review',
  },
  {
    answer: 'No',
    description: '',
    question: 'Is this a mangrove project?',
    submissionStatus: 'In Review',
  },
];

const QuestionAnswerSets = ({ items }: { items: QuestionDeliverableItem[] }): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        marginBottom: theme.spacing(4),
        paddingTop: theme.spacing(3),
      }}
    >
      {items.map((item, index) => (
        <QuestionAnswerSet key={`item-${index}`} item={item} />
      ))}
    </Box>
  );
};

const QuestionAnswerSet = ({ item }: { item: QuestionDeliverableItem }): JSX.Element => {
  const theme = useTheme();

  return (
    <Box sx={{ marginBottom: theme.spacing(4) }}>
      <Box sx={{ float: 'right', marginBottom: '16px', marginLeft: '16px' }}>
        <DeliverableStatusBadge status={item.submissionStatus} />
      </Box>
      <Typography sx={{ fontWeight: '600', marginBottom: '16px' }}>{item.question}</Typography>
      {!!item.description && (
        <Typography
          sx={{
            color: 'rgba(0, 0, 0, 0.54)',
            fontSize: '14px',
            fontStyle: 'italic',
            lineHeight: '20px',
            marginBottom: '16px',
          }}
        >
          {item.description}
        </Typography>
      )}
      {!!item.feedback && (
        <Box marginBottom={theme.spacing(2)}>
          <Message body={item.feedback} priority='critical' type='page' />
        </Box>
      )}
      <Typography>{item?.answer ? item.answer : '--'}</Typography>
    </Box>
  );
};

export type Props = EditProps & {
  isBusy?: boolean;
};

const QuestionsDeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: ViewProps = props;
  const deliverableId = viewProps.deliverable.id;
  const projectId = viewProps.deliverable.projectId;

  const dispatch = useAppDispatch();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { currentDeliverable: deliverable } = useDeliverableData();
  const { status: requestStatus } = useUpdateDeliverable();

  const variablesWithValues = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverableId, projectId)
  );
  console.log({ variablesWithValues });

  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);

  // const submitButtonIsDisabled = useMemo(() => {
  //   return (
  //     !ppsSearchResults?.data?.length ||
  //     ppsSearchResults?.data?.every((species) => species.participantProjectSpecies.submissionStatus === 'Approved')
  //   );
  // }, [ppsSearchResults]);

  const submitDeliverable = useCallback(() => {
    if (deliverable?.id !== undefined) {
      alert('TODO: Submit Deliverable');
    }
    setShowSubmitDialog(false);
  }, [deliverable]);

  useEffect(() => {
    if (!(deliverableId && projectId)) {
      return;
    }

    void dispatch(requestListDeliverableVariables(deliverableId));
    void dispatch(requestListDeliverableVariablesValues({ deliverableId, projectId }));
  }, [deliverableId, projectId]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.DELIVERABLES : '',
        to: APP_PATHS.DELIVERABLES,
      },
    ],
    [activeLocale]
  );

  if (isMobile) {
    return <MobileMessage {...viewProps} />;
  }

  const actionMenu = useMemo(() => {
    if (!activeLocale) {
      return null;
    }

    return (
      <Box display='flex' justifyContent='right'>
        <Button
          id='edit-deliverable'
          icon='iconEdit'
          label={isMobile ? '' : strings.EDIT}
          onClick={() => {
            alert('TODO: Edit Deliverable');
          }}
          size='medium'
          priority='secondary'
        />
        <Button
          // disabled={submitButtonIsDisabled}
          disabled={false}
          label={strings.SUBMIT_FOR_APPROVAL}
          onClick={() => setShowSubmitDialog(true)}
          size='medium'
          id='submit-deliverable'
        />
      </Box>
    );
  }, []);

  return (
    <>
      {deliverable && showSubmitDialog && (
        <SubmitDeliverableDialog
          onClose={() => setShowSubmitDialog(false)}
          onSubmit={submitDeliverable}
          submitMessage={strings.SUBMIT_QUESTIONNAIRE_CONFIRMATION}
        />
      )}

      <Page crumbs={crumbs} rightComponent={actionMenu} title={<TitleBar {...props} />}>
        {(props.isBusy || requestStatus === 'pending') && <BusySpinner />}
        <Box display='flex' flexDirection='column' flexGrow={1}>
          {/* <QuestionsDeliverableStatusMessage {...viewProps} questions={ppsSearchResults?.data || []} /> */}
          <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Metadata {...viewProps} />
            <QuestionAnswerSets items={QA_SETS} />
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default QuestionsDeliverableView;
