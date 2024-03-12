import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, useTheme } from '@mui/material';
import { Button, DropdownItem } from '@terraware/web-components';

import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';
import useUpdateDeliverable from 'src/components/DeliverableView/useUpdateDeliverable';
import Page from 'src/components/Page';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';

import ApproveDeliverableDialog from './ApproveDeliverableDialog';
import DeliverableView from './DeliverableView';
import RejectDialog from './RejectDialog';

const DeliverableViewWrapper = () => {
  const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const { deliverableId: _deliverableId, projectId: _projectId } = useParams<{
    deliverableId: string;
    projectId: string;
  }>();
  const { status: requestStatus, update } = useUpdateDeliverable();
  const theme = useTheme();
  const { activeLocale } = useLocalization();

  const deliverableId = Number(_deliverableId);
  const projectId = Number(_projectId);

  const { deliverable } = useFetchDeliverable({ deliverableId, projectId });

  const setStatus = useCallback(
    (status: DeliverableStatusType) => {
      if (deliverable?.id !== undefined) {
        update({ ...deliverable, status });
      }
    },
    [deliverable, update]
  );

  const approveDeliverable = useCallback(() => {
    if (deliverable?.id !== undefined) {
      update({ ...deliverable, status: 'Approved' });
    }
    setShowApproveDialog(false);
  }, [deliverable, setShowApproveDialog, update]);

  const rejectDeliverable = useCallback(
    (feedback: string) => {
      if (deliverable?.id !== undefined) {
        update({ ...deliverable, status: 'Rejected', feedback });
      }
      setShowRejectDialog(false);
    },
    [deliverable, setShowRejectDialog, update]
  );

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
              disabled: deliverable?.status === 'Needs Translation',
            },
            {
              label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NOT_NEEDED) as string,
              value: 'not_needed',
              disabled: deliverable?.status === 'Not Needed',
            },
          ]
        : [],
    [activeLocale, deliverable?.status]
  );

  const callToAction = useMemo(() => {
    return (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        <Button
          disabled={deliverable?.status === 'Rejected'}
          id='rejectDeliverable'
          label={strings.REJECT_ACTION}
          priority='secondary'
          onClick={() => void setShowRejectDialog(true)}
          size='medium'
          type='destructive'
        />
        <Button
          disabled={deliverable?.status === 'Approved'}
          id='approveDeliverable'
          label={strings.APPROVE_DELIVERABLE}
          onClick={() => void setShowApproveDialog(true)}
          size='medium'
        />
        <OptionsMenu onOptionItemClick={onOptionItemClick} optionItems={optionItems} />
      </Box>
    );
  }, [deliverable?.status, onOptionItemClick, optionItems, theme]);

  if (deliverable) {
    return (
      <>
        {showApproveDialog && (
          <ApproveDeliverableDialog onClose={() => setShowApproveDialog(false)} onSubmit={approveDeliverable} />
        )}
        {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectDeliverable} />}
        <DeliverableView
          callToAction={callToAction}
          deliverable={deliverable}
          isBusy={requestStatus === 'pending'}
          showRejectDialog={() => setShowRejectDialog(true)}
        />
      </>
    );
  } else {
    return <Page isLoading={true} />;
  }
};

export default DeliverableViewWrapper;
