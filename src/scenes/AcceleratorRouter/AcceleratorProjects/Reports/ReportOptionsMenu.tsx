import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { DropdownItem } from '@terraware/web-components';

import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import useAcceleratorReportActions from 'src/hooks/useAcceleratorReportActions';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useUser } from 'src/providers';
import useSnackbar from 'src/utils/useSnackbar';

import PublishModal from './PublishModal';

type ReportOptionsMenuProps = {
  projectId: number;
  reportId: number;
};

const ReportOptionsMenu = ({ projectId, reportId }: ReportOptionsMenuProps): JSX.Element => {
  const { strings } = useLocalization();
  const { isAllowed } = useUser();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const canPublish = isAllowed('PUBLISH_REPORTS');

  const [showPublishModal, setShowPublishModal] = useState(false);

  const { report } = useOneAcceleratorReport(reportId);

  const { isLoading, publishReport, publishReportResponse } = useAcceleratorReportActions(reportId);

  useEffect(() => {
    if (publishReportResponse.isError) {
      snackbar.toastError();
      publishReportResponse.reset();
      return;
    }
    if (publishReportResponse.isSuccess) {
      snackbar.toastSuccess(strings.REPORT_PUBLISHED);
      setShowPublishModal(false);
      publishReportResponse.reset();
    }
  }, [publishReportResponse, snackbar, strings]);

  const optionItems = useMemo(
    (): DropdownItem[] => [
      {
        disabled: report?.status !== 'Approved' || isLoading,
        label: strings.PUBLISH,
        value: 'publish',
      },
      {
        label: strings.PREVIEW_FUNDER_REPORT,
        value: 'preview',
      },
      ...(canPublish
        ? [
            {
              disabled: report?.status !== 'Approved',
              label: strings.PUBLISH,
              value: 'publish',
            },
          ]
        : []),
    ],
    [canPublish, isLoading, report?.status, strings]
  );

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      if (optionItem.value === 'preview') {
        navigate(`${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)}/${reportId}/preview`);
      } else if (optionItem.value === 'publish') {
        setShowPublishModal(true);
      }
    },
    [navigate, projectId, reportId]
  );

  const closePublishModal = useCallback(() => setShowPublishModal(false), []);

  const publish = useCallback(() => void publishReport(), [publishReport]);

  return (
    <>
      {showPublishModal && (
        <PublishModal disabled={publishReportResponse.isLoading} onClose={closePublishModal} onSubmit={publish} />
      )}

      <OptionsMenu
        onOptionItemClick={onOptionItemClick}
        optionItems={optionItems}
        size='medium'
        sx={{ '& .button': { margin: '4px' }, marginLeft: 0 }}
      />
    </>
  );
};

export default ReportOptionsMenu;
