import React, { useCallback, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button, DropdownItem } from '@terraware/web-components';

import useUpdateDeliverable from 'src/components/DeliverableView/useUpdateDeliverable';
import Page from 'src/components/Page';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { useLocalization, useUser } from 'src/providers';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';

import ApproveDeliverableDialog from './ApproveDeliverableDialog';
import DocumentDeliverableView from './DocumentDeliverableView';
import RejectDialog from './RejectDialog';
import SpeciesDeliverableView from './SpeciesDeliverableView';

const DeliverableViewWrapper = () => {
  const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);

  const { status: requestStatus, update } = useUpdateDeliverable();
  const theme = useTheme();
  const { isAllowed } = useUser();
  const { activeLocale } = useLocalization();
  const { currentDeliverable: deliverable } = useDeliverableData();

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
      isAllowed('UPDATE_SUBMISSION_STATUS') && (
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
            label={strings.APPROVE}
            onClick={() => void setShowApproveDialog(true)}
            size='medium'
          />
          <OptionsMenu onOptionItemClick={onOptionItemClick} optionItems={optionItems} />
        </Box>
      )
    );
  }, [deliverable?.status, isAllowed, onOptionItemClick, optionItems, theme]);

  if (deliverable) {
    return (
      <>
        {showApproveDialog && (
          <ApproveDeliverableDialog
            onClose={() => setShowApproveDialog(false)}
            onSubmit={approveDeliverable}
            deliverableType={deliverable.type}
          />
        )}
        {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectDeliverable} />}

        {deliverable.type === 'Document' ? (
          <DocumentDeliverableView
            callToAction={callToAction}
            deliverable={deliverable}
            isBusy={requestStatus === 'pending'}
            showRejectDialog={() => setShowRejectDialog(true)}
          />
        ) : (
          <SpeciesDeliverableView
            callToAction={callToAction}
            deliverable={deliverable}
            isBusy={requestStatus === 'pending'}
            showRejectDialog={() => setShowRejectDialog(true)}
          />
        )}
      </>
    );
  } else {
    return <Page isLoading={true} />;
  }
};

export default DeliverableViewWrapper;
