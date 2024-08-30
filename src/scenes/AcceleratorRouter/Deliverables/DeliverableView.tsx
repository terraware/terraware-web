import React, { useCallback, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { BusySpinner, Button, DropdownItem } from '@terraware/web-components';

import AcceleratorDeliverableCard from 'src/components/AcceleratorDeliverableView/DeliverableCard';
import RejectDialog from 'src/components/AcceleratorDeliverableView/RejectDialog';
import useUpdateDeliverable from 'src/components/AcceleratorDeliverableView/useUpdateDeliverable';
import { Crumb } from 'src/components/BreadCrumbs';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import Page from 'src/components/Page';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import DownloadSpeciesSnapshotModal from '../Species/DownloadSpeciesSnapshotModal';
import ApproveDeliverableDialog from './ApproveDeliverableDialog';
import ApprovedDeliverableMessage from './ApprovedDeliverableMessage';
import RejectedDeliverableMessage from './RejectedDeliverableMessage';

const DeliverableView = () => {
  const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  const { isMobile } = useDeviceInfo();
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
        case 'download_snapshot': {
          setShowDownloadModal(true);
          break;
        }
      }
    },
    [setStatus]
  );

  const speciesOptionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: strings.DOWNLOAD_SPECIES_SUBMISSION_SNAPSHOT,
              value: 'download_snapshot',
            },
          ]
        : [],
    [activeLocale]
  );

  const optionItems = useMemo((): DropdownItem[] => {
    if (!activeLocale || !deliverable) {
      return [];
    }

    const defaultOptionItems = [
      {
        label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NEEDS_TRANSLATION) as string,
        value: 'needs_translation',
        disabled: deliverable.status === 'Needs Translation',
      },
      {
        label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NOT_NEEDED) as string,
        value: 'not_needed',
        disabled: deliverable.status === 'Not Needed',
      },
    ];

    return deliverable.type === 'Species' && deliverable.status === 'Approved'
      ? speciesOptionItems
      : defaultOptionItems;
  }, [activeLocale, deliverable, speciesOptionItems]);

  const callToAction = useMemo(() => {
    return (
      isAllowed('UPDATE_SUBMISSION_STATUS') && (
        <>
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
        </>
      )
    );
  }, [deliverable?.status, isAllowed, theme]);

  const optionsMenu = useMemo(
    () => (
      <>
        {isAllowed('UPDATE_SUBMISSION_STATUS') && (
          <OptionsMenu onOptionItemClick={onOptionItemClick} optionItems={optionItems} />
        )}
      </>
    ),
    [isAllowed, onOptionItemClick, optionItems, deliverable]
  );

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {callToAction}
        {optionsMenu}
      </Box>
    ),
    [callToAction, optionsMenu]
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

  if (deliverable) {
    if (isMobile) {
      return <MobileMessage deliverable={deliverable} />;
    }

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
        {showDownloadModal && (
          <DownloadSpeciesSnapshotModal
            deliverableId={deliverable.id}
            projectId={deliverable.projectId}
            open={showDownloadModal}
            onClose={() => setShowDownloadModal(false)}
          />
        )}

        <Page title={<TitleBar deliverable={deliverable} />} rightComponent={rightComponent} crumbs={crumbs}>
          {requestStatus === 'pending' && <BusySpinner />}
          <Box display='flex' flexDirection='column' flexGrow={1} overflow={'auto'}>
            <ApprovedDeliverableMessage deliverable={deliverable} />
            <RejectedDeliverableMessage deliverable={deliverable} showRejectDialog={() => setShowRejectDialog(true)} />
            <AcceleratorDeliverableCard deliverable={deliverable} />
          </Box>
        </Page>
      </>
    );
  } else {
    return <Page isLoading={true} />;
  }
};

export default DeliverableView;
