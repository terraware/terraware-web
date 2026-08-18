import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { DropdownItem } from '@terraware/web-components';

import OptionsMenu from 'src/components/common/OptionsMenu';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useLocalization, useUser } from 'src/providers';
import { usePublishOneAcceleratorReportMutation } from 'src/queries/generated/acceleratorReports';
import useSnackbar from 'src/utils/useSnackbar';

import PublishModal from './PublishModal';

type ReportOptionsMenuProps = {
  reportId: number;
};

const ReportOptionsMenu = ({ reportId }: ReportOptionsMenuProps): JSX.Element | null => {
  const { strings } = useLocalization();
  const { isAllowed } = useUser();
  const snackbar = useSnackbar();

  const [showPublishModal, setShowPublishModal] = useState(false);

  const { report } = useOneAcceleratorReport(reportId);

  const [publishReport, publishReportResponse] = usePublishOneAcceleratorReportMutation();

  useEffect(() => {
    if (publishReportResponse.isError) {
      snackbar.toastError();
      return;
    }
    if (publishReportResponse.isSuccess) {
      snackbar.toastSuccess(strings.REPORT_PUBLISHED);
      setShowPublishModal(false);
    }
  }, [publishReportResponse.isError, publishReportResponse.isSuccess, snackbar, strings]);

  const optionItems = useMemo(
    (): DropdownItem[] => [
      {
        disabled: report?.status !== 'Approved',
        label: strings.PUBLISH,
        value: 'publish',
      },
    ],
    [report?.status, strings]
  );

  const onOptionItemClick = useCallback((optionItem: DropdownItem) => {
    if (optionItem.value === 'publish') {
      setShowPublishModal(true);
    }
  }, []);

  const closePublishModal = useCallback(() => setShowPublishModal(false), []);

  const publish = useCallback(() => void publishReport(reportId), [publishReport, reportId]);

  if (!isAllowed('PUBLISH_REPORTS')) {
    return null;
  }

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
