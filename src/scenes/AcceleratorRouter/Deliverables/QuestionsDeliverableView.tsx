import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

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
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import {
  requestListDeliverableVariablesValues,
  requestUpdateVariableValues,
} from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectDeliverableVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListDeliverableVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ApprovedDeliverableMessage from './ApprovedDeliverableMessage';
import RejectDialog from './RejectDialog';
import RejectedDeliverableMessage from './RejectedDeliverableMessage';

export type Props = EditProps & {
  isBusy?: boolean;
  showRejectDialog: () => void;
};

const QuestionBox = ({
  item,
  optionsMenu,
  projectId,
  index,
  reload,
}: {
  item: VariableWithValues;
  optionsMenu: React.ReactNode;
  projectId: number;
  index: number;
  reload: () => void;
}): JSX.Element => {
  const theme = useTheme();

  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [editing, setEditing] = useState(false);

  const [values, setValues] = useState<VariableValueValue[]>([]);
  const dispatch = useAppDispatch();

  const rejectItem = () => {
    return true;
  };

  const approveItem = () => {
    return true;
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
          {/* <DeliverableStatusBadge status={item.submissionStatus} /> */}
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
              // disabled={item.submissionStatus === 'Rejected'}
            />
            <Button
              label={strings.APPROVE}
              onClick={approveItem}
              priority='secondary'
              // disabled={item.submissionStatus === 'Approved'}
            />
            {optionsMenu}
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
        {editing && (
          <DeliverableEditVariable
            variable={item}
            setHasErrors={() => true}
            setRemovedValues={() => true}
            setValues={onValuesChanged}
            showInternalComment={true}
          />
        )}
        {/* {!!item.feedback && (
          <Box marginBottom={theme.spacing(2)}>
            <Message body={item.feedback} priority='critical' type='page' />
          </Box>
        )} */}
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
  const { optionsMenu, ...viewProps }: Props = props;
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
                  optionsMenu={optionsMenu}
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
