import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { Button, DropdownItem } from '@terraware/web-components';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';
import Page from 'src/components/Page';
import OptionsMenu from 'src/components/common/OptionsMenu';
import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';
import useUpdateDeliverable from './useUpdateDeliverable';
import DeliverableView from './DeliverableView';
import RejectDialog from './RejectDialog';

const DeliverableViewWrapper = () => {
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const { deliverableId } = useParams<{ deliverableId: string }>();
  const { status: requestStatus, update } = useUpdateDeliverable();
  const theme = useTheme();

  const { deliverable } = useFetchDeliverable({ deliverableId: Number(deliverableId) });

  // temporary solution until we have the confirmation modal design
  const setStatus = useCallback(
    (status: DeliverableStatusType) => {
      if (deliverable?.id !== undefined) {
        if (window.confirm(`Are you sure you want to set the status to ${status} ?`)) {
          update({ ...deliverable, status });
        }
      }
    },
    [deliverable, update]
  );

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
        case 'not_submitted': {
          setStatus('Not Submitted');
          break;
        }
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
          onClick={() => setStatus('Approved')}
          size='medium'
        />
        <OptionsMenu
          onOptionItemClick={onOptionItemClick}
          optionItems={[
            ...(deliverable?.status === 'Not Submitted'
              ? []
              : [{ label: strings.NOT_SUBMITTED, value: 'not_submitted' }]),
            ...(deliverable?.status === 'Needs Translation'
              ? []
              : [{ label: strings.NEEDS_TRANSLATION, value: 'needs_translation' }]),
            ...(deliverable?.status === 'Not Needed' ? [] : [{ label: strings.NOT_NEEDED, value: 'not_needed' }]),
          ]}
        />
      </Box>
    );
  }, [deliverable?.status, onOptionItemClick, setStatus, theme]);

  if (deliverable) {
    return (
      <>
        {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectDeliverable} />}
        <DeliverableView callToAction={callToAction} deliverable={deliverable} isBusy={requestStatus === 'pending'} />
      </>
    );
  } else {
    return <Page isLoading={true} />;
  }
};

export default DeliverableViewWrapper;
