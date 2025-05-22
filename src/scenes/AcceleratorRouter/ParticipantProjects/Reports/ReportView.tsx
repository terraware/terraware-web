import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DropdownItem } from '@terraware/web-components';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import ApprovedReportMessage from 'src/components/AcceleratorReports/ApprovedReportMessage';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import MetricBox from 'src/components/AcceleratorReports/MetricBox';
import RejectedReportMessage from 'src/components/AcceleratorReports/RejectedReportMessage';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useProjectReports from 'src/hooks/useProjectReports';
import { useLocalization, useUser } from 'src/providers';
import {
  selectPublishAcceleratorReport,
  selectReviewAcceleratorReport,
} from 'src/redux/features/reports/reportsSelectors';
import {
  requestPublishAcceleratorReport,
  requestReviewAcceleratorReport,
} from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport, MetricType } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import { useParticipantProjectData } from '../ParticipantProjectContext';
import ApproveReportDialog from './ApproveReportDialog';
import Metadata from './Metadata';
import PublishModal from './PublishModal';
import RejectDialog from './RejectDialog';

const ReportView = () => {
  const { activeLocale } = useLocalization();
  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const projectId = String(pathParams.projectId);
  const reportId = String(pathParams.reportId);
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const dispatch = useAppDispatch();
  const [selectedReport, setSelectedReport] = useState<AcceleratorReport>();
  const { isAllowed } = useUser();
  const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const { crumbs: participantProjectCrumbs, participantProject, project } = useParticipantProjectData();
  const theme = useTheme();
  const [boxInEdit, setBoxInEdit] = useState<boolean>(false);
  const [approveRequestId, setApproveRequestId] = useState('');
  const [rejectRequestId, setRejectRequestId] = useState('');
  const [publishRequestId, setPublishRequestId] = useState('');
  const approveReportResponse = useAppSelector(selectReviewAcceleratorReport(approveRequestId));
  const rejectReportResponse = useAppSelector(selectReviewAcceleratorReport(rejectRequestId));
  const [showPublishModal, setShowPublishModal] = useState(false);
  const publishReportResponse = useAppSelector(selectPublishAcceleratorReport(publishRequestId));
  const snackbar = useSnackbar();
  const { reload, acceleratorReports: reports } = useProjectReports(projectId, true, true);

  const publishReport = () => {
    const request = dispatch(
      requestPublishAcceleratorReport({
        projectId: Number(projectId),
        reportId: Number(reportId),
      })
    );
    setPublishRequestId(request.requestId);
    setShowPublishModal(false);
  };

  const approveReport = useCallback(() => {
    if (selectedReport) {
      const request = dispatch(
        requestReviewAcceleratorReport({
          projectId: Number(projectId),
          reportId: Number(reportId),
          review: {
            ...selectedReport,
            feedback: undefined,
            status: 'Approved',
          },
        })
      );
      setApproveRequestId(request.requestId);
    }
  }, [dispatch, projectId, reportId, selectedReport]);

  const rejectReport = useCallback(
    (feedback?: string) => {
      if (selectedReport) {
        const request = dispatch(
          requestReviewAcceleratorReport({
            projectId: Number(projectId),
            reportId: Number(reportId),
            review: {
              ...selectedReport,
              status: 'Needs Update',
              feedback,
            },
          })
        );
        setRejectRequestId(request.requestId);
      }
    },
    [dispatch, projectId, reportId, selectedReport]
  );

  useEffect(() => {
    if (approveReportResponse?.status === 'error') {
      return;
    }
    if (approveReportResponse?.status === 'success') {
      reload();
      setShowApproveDialog(false);
    }
  }, [approveReportResponse, reload]);

  useEffect(() => {
    if (rejectReportResponse?.status === 'error') {
      return;
    }
    if (rejectReportResponse?.status === 'success') {
      reload();
      setShowRejectDialog(false);
    }
  }, [rejectReportResponse, reload]);

  useEffect(() => {
    if (publishReportResponse?.status === 'error') {
      snackbar.toastError();
      return;
    }
    if (publishReportResponse?.status === 'success') {
      snackbar.toastSuccess(strings.REPORT_PUBLISHED);
      reload();
      setShowPublishModal(false);
    }
  }, [publishReportResponse, reload, snackbar]);

  useEffect(() => {
    if (reports) {
      const reportSelected = reports.find((report) => report.id.toString() === reportId);
      setSelectedReport(reportSelected);
    }
  }, [reportId, reports]);

  const year = useMemo(() => {
    return selectedReport?.startDate.split('-')[0];
  }, [selectedReport]);

  const crumbs: Crumb[] = useMemo(() => {
    let crumbsList = [
      {
        name: activeLocale ? strings.REPORTS : '',
        to: year
          ? `${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId)}?year=${year}`
          : APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId),
      },
    ];
    if (isAcceleratorRoute) {
      crumbsList = [
        ...participantProjectCrumbs,
        {
          name: participantProject?.dealName || project?.name || '',
          to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', participantProject?.projectId.toString() || ''),
        },
      ].concat(crumbsList);
    }

    return crumbsList;
  }, [
    activeLocale,
    isAcceleratorRoute,
    participantProject?.dealName,
    participantProject?.projectId,
    participantProjectCrumbs,
    project?.name,
    projectId,
    year,
  ]);

  const onOptionItemClick = (optionItem: DropdownItem) => {
    switch (optionItem.value) {
      case 'publish': {
        setShowPublishModal(true);
        break;
      }
    }
  };

  const optionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: strings.PUBLISH,
              value: 'publish',
              disabled: selectedReport?.status !== 'Approved',
            },
          ]
        : [],
    [activeLocale, selectedReport?.status]
  );

  const callToAction = useMemo(() => {
    return (
      isAllowed('UPDATE_SUBMISSION_STATUS') && (
        <>
          <Button
            disabled={selectedReport?.status === 'Needs Update'}
            id='rejectDeliverable'
            label={strings.REQUEST_UPDATE_ACTION}
            priority='secondary'
            onClick={() => void setShowRejectDialog(true)}
            size='medium'
            type='destructive'
          />
          <Button
            disabled={selectedReport?.status === 'Approved'}
            id='approveDeliverable'
            label={strings.APPROVE}
            onClick={() => void setShowApproveDialog(true)}
            size='medium'
          />
          {isAllowed('PUBLISH_REPORTS') && (
            <OptionsMenu
              onOptionItemClick={onOptionItemClick}
              optionItems={optionItems}
              size='medium'
              sx={{ '& .button': { margin: '4px' }, marginLeft: 0 }}
            />
          )}
        </>
      )
    );
  }, [isAllowed, selectedReport?.status, optionItems]);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {callToAction}
      </Box>
    ),
    [callToAction, theme]
  );

  const reportName = selectedReport ? getReportName(selectedReport) : '';

  const onEditChange = (isInEdit: boolean) => {
    setBoxInEdit(isInEdit);
  };

  return (
    <>
      {showPublishModal && <PublishModal onClose={() => setShowPublishModal(false)} onSubmit={publishReport} />}
      {showApproveDialog && (
        <ApproveReportDialog onClose={() => setShowApproveDialog(false)} onSubmit={approveReport} />
      )}
      {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectReport} />}

      <Page
        title={
          <TitleBar
            title={`${strings.REPORT} (${reportName})`}
            subtitle={participantProject ? `${strings.PROJECT}: ${participantProject?.dealName}` : ''}
          />
        }
        rightComponent={selectedReport?.status !== 'Not Submitted' ? rightComponent : undefined}
        crumbs={crumbs}
        hierarchicalCrumbs={false}
      >
        <Box display='flex' flexDirection='column' flexGrow={1} overflow={'auto'}>
          {selectedReport && <ApprovedReportMessage report={selectedReport} />}
          {selectedReport && (
            <RejectedReportMessage report={selectedReport} showRejectDialog={() => setShowRejectDialog(true)} />
          )}
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
            }}
          >
            {selectedReport && <Metadata report={selectedReport} projectId={projectId} reload={reload} />}
            {selectedReport?.startDate && selectedReport?.endDate && (
              <Box
                borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
                padding={theme.spacing(3, 0)}
                marginBottom={3}
              >
                <Typography fontSize={14} fontStyle={'italic'}>
                  {strings.formatString(strings.REPORT_PERIOD, selectedReport?.startDate, selectedReport?.endDate)}
                </Typography>
              </Box>
            )}
            <HighlightsBox
              report={selectedReport}
              projectId={projectId}
              reload={reload}
              isConsoleView={true}
              onEditChange={onEditChange}
              canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
            />
            {['system', 'project', 'standard'].map((type) => {
              const metrics =
                type === 'system'
                  ? selectedReport?.systemMetrics
                  : type === 'project'
                    ? selectedReport?.projectMetrics
                    : selectedReport?.standardMetrics;

              return metrics?.map((metric, index) => (
                <MetricBox
                  isConsoleView
                  key={`${type}-${index}`}
                  metric={metric}
                  projectId={projectId}
                  reload={reload}
                  reportId={Number(reportId)}
                  type={type as MetricType}
                  onEditChange={onEditChange}
                  canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
                />
              ));
            })}
            <AchievementsBox
              report={selectedReport}
              projectId={projectId}
              reload={reload}
              isConsoleView={true}
              onEditChange={onEditChange}
              canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
            />
            <ChallengesMitigationBox
              report={selectedReport}
              projectId={projectId}
              reload={reload}
              isConsoleView={true}
              onEditChange={onEditChange}
              canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
            />
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default ReportView;
