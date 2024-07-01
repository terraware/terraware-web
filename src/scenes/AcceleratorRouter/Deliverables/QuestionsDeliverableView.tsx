import React, { useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, Message, Select } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps } from 'src/components/DeliverableView/types';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ApprovedDeliverableMessage from './ApprovedDeliverableMessage';
import RejectDialog from './RejectDialog';
import RejectedDeliverableMessage from './RejectedDeliverableMessage';

export type Props = EditProps & {
  isBusy?: boolean;
  showRejectDialog: () => void;
};

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

const QuestionAnswerSets = ({
  items,
  optionsMenu,
}: {
  items: QuestionDeliverableItem[];
  optionsMenu: React.ReactNode;
}): JSX.Element => {
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
        <QuestionAnswerSet key={`item-${index}`} item={item} optionsMenu={optionsMenu} />
      ))}
    </Box>
  );
};

const QuestionAnswerSet = ({
  item,
  optionsMenu,
}: {
  item: QuestionDeliverableItem;
  optionsMenu: React.ReactNode;
}): JSX.Element => {
  const theme = useTheme();

  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [editing, setEditing] = useState(false);

  const rejectItem = () => {
    return true;
  };

  const approveItem = () => {
    return true;
  };

  const onEditItem = () => {
    setEditing(true);
  };

  return (
    <>
      {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectItem} />}
      <Box
        sx={{
          marginBottom: theme.spacing(4),
          '&:hover': {
            background: theme.palette.TwClrBgHover,
            '.actions': {
              display: 'block',
            },
          },
          '& .actions': {
            display: 'none',
          },
          padding: 2,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            float: 'right',
            marginBottom: '16px',
            marginLeft: '16px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <DeliverableStatusBadge status={item.submissionStatus} />
          <Box className='actions'>
            <Button
              id='edit'
              label={strings.EDIT}
              onClick={onEditItem}
              icon='iconEdit'
              priority='secondary'
              className='edit-button'
              size='small'
              type='passive'
            />
            <Button
              label={strings.REJECT_ACTION}
              onClick={() => setShowRejectDialog(true)}
              priority='secondary'
              type='destructive'
              disabled={item.submissionStatus === 'Rejected'}
            />
            <Button
              label={strings.APPROVE}
              onClick={approveItem}
              priority='secondary'
              disabled={item.submissionStatus === 'Approved'}
            />
            {optionsMenu}
          </Box>
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
        {editing && <Select onChange={(newValue: string) => console.log(newValue)}></Select>}
        {!!item.feedback && (
          <Box marginBottom={theme.spacing(2)}>
            <Message body={item.feedback} priority='critical' type='page' />
          </Box>
        )}
        <Typography>{!editing && item?.answer ? item.answer : '--'}</Typography>
        {editing && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              id='cancel'
              label={strings.CANCEL}
              type='passive'
              onClick={() => setEditing(false)}
              priority='secondary'
              key='button-1'
            />
            <Button id={'save'} onClick={() => true} label={strings.SAVE} key='button-2' priority='secondary' />
          </Box>
        )}
      </Box>
    </>
  );
};

const QuestionsDeliverableView = (props: Props): JSX.Element => {
  const { optionsMenu, ...viewProps }: Props = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.DELIVERABLES : '',
        to: APP_PATHS.ACCELERATOR_DELIVERABLES,
      },
    ],
    [activeLocale]
  );

  if (isMobile) {
    return <MobileMessage {...viewProps} />;
  }

  return (
    <>
      {/* TODO: render modals for Q&A items here? (Reject Answer, Edit Rejection Feedback, Edit Comments) */}

      <Page crumbs={crumbs} rightComponent={viewProps.callToAction} title={<TitleBar {...viewProps} />}>
        {props.isBusy && <BusySpinner />}
        <Box display='flex' flexDirection='column' flexGrow={1}>
          <ApprovedDeliverableMessage {...viewProps} />
          <RejectedDeliverableMessage {...viewProps} />
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
            }}
          >
            <Metadata {...viewProps} />
            <QuestionAnswerSets items={QA_SETS} optionsMenu={optionsMenu} />
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default QuestionsDeliverableView;
