import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { DropdownItem } from '@terraware/web-components';

import AcceleratorReportPrint from 'src/components/AcceleratorReports/AcceleratorReportPrint';
import useExportReportCsv from 'src/components/AcceleratorReports/useExportReportCsv';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import useAcceleratorReportActions from 'src/hooks/useAcceleratorReportActions';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useUser } from 'src/providers';
import { useListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import useSnackbar from 'src/utils/useSnackbar';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';
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
  const { acceleratorProject, project } = useAcceleratorProjectData();
  const { exportAcceleratorReport } = useExportReportCsv();

  const canPublish = isAllowed('PUBLISH_REPORTS');

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [printing, setPrinting] = useState(false);

  const projectName = acceleratorProject?.dealName || project?.name;

  const { report } = useOneAcceleratorReport(reportId);

  const { isLoading, publishReport, publishReportResponse } = useAcceleratorReportActions(reportId);

  const { currentData: listPublishedReportsData } = useListPublishedReportsQuery(projectId);

  const isPublished = useMemo(
    () => listPublishedReportsData?.reports.some((publishedReport) => publishedReport.reportId === reportId) ?? false,
    [listPublishedReportsData, reportId]
  );

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
      {
        disabled: !isPublished,
        label: strings.VIEW_PUBLISHED_FUNDER_REPORT,
        value: 'published',
      },
      {
        label: strings.EXPORT_CSV,
        value: 'exportCsv',
      },
      {
        label: strings.PRINT_REPORT,
        value: 'print',
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
    [canPublish, isLoading, isPublished, report?.status, strings]
  );

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      if (optionItem.value === 'preview') {
        navigate(`${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)}/${reportId}/preview`);
      } else if (optionItem.value === 'published') {
        navigate(
          `${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)}/${reportId}/published`
        );
      } else if (optionItem.value === 'exportCsv') {
        void exportAcceleratorReport({ projectName, reportId });
      } else if (optionItem.value === 'print') {
        setPrinting(true);
      } else if (optionItem.value === 'publish') {
        setShowPublishModal(true);
      }
    },
    [exportAcceleratorReport, navigate, projectId, projectName, reportId]
  );

  const closePublishModal = useCallback(() => setShowPublishModal(false), []);

  const stopPrinting = useCallback(() => setPrinting(false), []);

  const publish = useCallback(() => void publishReport(), [publishReport]);

  return (
    <>
      {showPublishModal && (
        <PublishModal disabled={publishReportResponse.isLoading} onClose={closePublishModal} onSubmit={publish} />
      )}

      {printing && <AcceleratorReportPrint onClose={stopPrinting} projectName={projectName} reportId={reportId} />}

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
