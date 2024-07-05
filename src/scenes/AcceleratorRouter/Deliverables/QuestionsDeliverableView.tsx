import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DropdownItem, Message } from '@terraware/web-components';

import { components } from 'src/api/types/generated-schema';
import { Crumb } from 'src/components/BreadCrumbs';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps } from 'src/components/DeliverableView/types';
import DeliverableDisplayVariableValue from 'src/components/DocumentProducer/DeliverableDisplayVariableValue';
import DeliverableEditVariable from 'src/components/DocumentProducer/DeliverableEditVariable';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import {
  requestListDeliverableVariablesValues,
  requestUpdateVariableValues,
} from 'src/redux/features/documentProducer/values/valuesThunks';
import {
  selectDeliverableVariablesWithValues,
  selectUpdateVariableWorkflowDetails,
} from 'src/redux/features/documentProducer/variables/variablesSelector';
import {
  requestListDeliverableVariables,
  requestUpdateVariableWorkflowDetails,
} from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ApprovedDeliverableMessage from './ApprovedDeliverableMessage';
import RejectDialog from './RejectDialog';
import RejectedDeliverableMessage from './RejectedDeliverableMessage';
import VariableStatusBadge from './VariableStatusBadge';
import InternalComment from 'src/components/DeliverableView/InternalComment';

export type Props = EditProps & {
  isBusy?: boolean;
  showRejectDialog: () => void;
};

const QuestionBox = ({
  item,
  projectId,
  index,
  reload,
}: {
  item: VariableWithValues;
  projectId: number;
  index: number;
  reload: () => void;
}): JSX.Element => {
  const theme = useTheme();

  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<VariableValueValue[]>([]);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState('');
  const { activeLocale } = useLocalization();
  const updateResponse = useAppSelector(selectUpdateVariableWorkflowDetails(requestId));

  useEffect(() => {
    if (updateResponse.status === 'success') {
      reload();
    }
  }, [updateResponse]);

  const setStatus = (status: VariableStatusType, feedback?: string) => {
    const request = dispatch(
      requestUpdateVariableWorkflowDetails({ status, feedback, projectId, variableId: item.id })
    );
    setRequestId(request.requestId);
  };

  const rejectItem = (feedback: string) => {
    setStatus('Rejected', feedback);
  };

  const approveItem = () => {
    setStatus('Approved');
  };

  const onEditItem = () => {
    setEditing(true);
  };

  const onValuesChanged = (variableId: number, values: VariableValueValue[]) => {
    setValues(values);
  };

  const onSave = async () => {
    const operations: components['schemas']['AppendValueOperationPayload'][] = [];
    values.forEach((val) => {
      operations.push({ operation: 'Append', variableId: item.id, value: val });
    });

    await dispatch(requestUpdateVariableValues({ operations, projectId }));
    reload();
    setEditing(false);
  };

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      switch (optionItem.value) {
        case 'needs_translation': {
          setStatus('Needs Translation');
          break;
        }
        case 'not_needed': {
          setStatus('Not Needed');
          break;
        }
      }
    },
    [setStatus]
  );

  const optionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NEEDS_TRANSLATION) as string,
              value: 'needs_translation',
              disabled:
                item.variableValues &&
                item.variableValues.length > 0 &&
                item.variableValues[0].status === 'Needs Translation',
            },
            {
              label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NOT_NEEDED) as string,
              value: 'not_needed',
              disabled:
                item.variableValues && item.variableValues.length > 0 && item.variableValues[0].status === 'Not Needed',
            },
          ]
        : [],
    [activeLocale, item.variableValues]
  );

  return (
    <Box key={`question-${index}`} onMouseLeave={() => setEditing(false)}>
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
          {item.variableValues && item.variableValues.length && (
            <VariableStatusBadge status={item.variableValues[0].status} />
          )}
          <Box className='actions'>
            {!editing && (
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
            )}
            <Button
              label={strings.REJECT_ACTION}
              onClick={() => setShowRejectDialog(true)}
              priority='secondary'
              type='destructive'
              disabled={
                item.variableValues && item.variableValues.length > 0 && item.variableValues[0].status === 'Rejected'
              }
            />
            <Button
              label={strings.APPROVE}
              onClick={approveItem}
              priority='secondary'
              disabled={
                item.variableValues && item.variableValues.length > 0 && item.variableValues[0].status === 'Approved'
              }
            />
            <OptionsMenu onOptionItemClick={onOptionItemClick} optionItems={optionItems} />
          </Box>
        </Box>
        <Typography sx={{ fontWeight: '600', marginBottom: '16px' }}>{item.name}</Typography>
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
        { item.variableValues && item.variableValues.length > 0 && item.variableValues[0].internalComment && <InternalComment entity={item.variableValues[0]} update={() => true} /> }
        {editing && (
          <DeliverableEditVariable
            variable={item}
            setHasErrors={() => true}
            setRemovedValues={() => true}
            setValues={onValuesChanged}
          />
        )}
        {item.variableValues && item.variableValues.length > 0 && item.variableValues[0].feedback && (
          <Box marginBottom={theme.spacing(2)}>
            <Message
              body={`${strings.ANSWER_NOT_ACCEPETED} ${item.variableValues[0].feedback}`}
              priority='critical'
              type='page'
            />
            { editing && }
          </Box>
        )}
        <Typography>{!editing && <DeliverableDisplayVariableValue projectId={projectId} variable={item} />}</Typography>
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
            <Button id={'save'} onClick={onSave} label={strings.SAVE} key='button-2' priority='secondary' />
          </Box>
        )}
      </Box>
    </Box>
  );
};

const QuestionsDeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: Props = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { deliverableId, projectId } = useDeliverableData();
  const dispatch = useAppDispatch();

  const reload = () => {
    void dispatch(requestListDeliverableVariables(deliverableId));
    void dispatch(requestListDeliverableVariablesValues({ deliverableId, projectId }));
  };

  useEffect(() => {
    if (!(deliverableId && projectId)) {
      return;
    }

    void dispatch(requestListDeliverableVariables(deliverableId));
    void dispatch(requestListDeliverableVariablesValues({ deliverableId, projectId }));
  }, [deliverableId, projectId]);

  const variablesWithValues: VariableWithValues[] = useAppSelector((state) =>
    selectDeliverableVariablesWithValues(state, deliverableId, projectId)
  );

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
            {variablesWithValues.map((variableWithValues: VariableWithValues, index: number) => {
              return (
                <QuestionBox
                  item={variableWithValues}
                  projectId={projectId}
                  index={index}
                  key={index}
                  reload={reload}
                />
              );
            })}
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default QuestionsDeliverableView;
