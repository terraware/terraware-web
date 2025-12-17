import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DropdownItem, Message } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ApprovedReportMessage from 'src/components/AcceleratorReports/ApprovedReportMessage';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import MetricBox from 'src/components/AcceleratorReports/MetricBox';
import PhotosBox from 'src/components/AcceleratorReports/PhotosBox';
import RejectedReportMessage from 'src/components/AcceleratorReports/RejectedReportMessage';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import OptionsMenu from 'src/components/common/OptionsMenu';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useBoolean from 'src/hooks/useBoolean';
import useProjectReports from 'src/hooks/useProjectReports';
import { useLocalization, useUser } from 'src/providers';
import { requestListFunderReports } from 'src/redux/features/funder/entities/fundingEntitiesAsyncThunks';
import { selectListFunderReports } from 'src/redux/features/funder/entities/fundingEntitiesSelectors';
import {
  selectPublishAcceleratorReport,
  selectReviewAcceleratorReport,
} from 'src/redux/features/reports/reportsSelectors';
import {
  requestPublishAcceleratorReport,
  requestReviewAcceleratorReport,
} from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import FunderReportView from 'src/scenes/FunderReport/FunderReportView';
import strings from 'src/strings';
import { AcceleratorReport, MetricType, PublishedReport } from 'src/types/AcceleratorReport';
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
  const [showApproveDialog, , openApprovalDialog, closeApproveDialog] = useBoolean(false);
  const [showRejectDialog, , openRejectDialog, closeRejectDialog] = useBoolean(false);
  const { crumbs: participantProjectCrumbs, participantProject, project } = useParticipantProjectData();
  const theme = useTheme();
  const [boxInEdit, setBoxInEdit] = useState<boolean>(false);
  const [approveRequestId, setApproveRequestId] = useState('');
  const [rejectRequestId, setRejectRequestId] = useState('');
  const [publishRequestId, setPublishRequestId] = useState('');
  const approveReportResponse = useAppSelector(selectReviewAcceleratorReport(approveRequestId));
  const rejectReportResponse = useAppSelector(selectReviewAcceleratorReport(rejectRequestId));
  const [showPublishModal, , openPublishModal, closePublishModal] = useBoolean(false);
  const publishReportResponse = useAppSelector(selectPublishAcceleratorReport(publishRequestId));
  const snackbar = useSnackbar();
  const { reload, acceleratorReports: reports } = useProjectReports(projectId, true, true);
  const { reload: reloadProject } = useParticipantProjectData();
  const [publishedFunderView, setPublishedFunderView] = useState(false);
  const reportsResponse = useAppSelector(selectListFunderReports(projectId ?? ''));
  const [publishedReports, setPublishedReports] = useState<PublishedReport[]>();
  const [selectedPublishedReport, setSelectedPublishedReport] = useState<PublishedReport>();

  const publishReport = useCallback(() => {
    const request = dispatch(
      requestPublishAcceleratorReport({
        projectId: Number(projectId),
        reportId: Number(reportId),
      })
    );
    setPublishRequestId(request.requestId);
    closePublishModal();
  }, [closePublishModal, dispatch, projectId, reportId]);

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

  const reloadPublishedReport = useCallback(async () => {
    if (projectId) {
      await dispatch(requestListFunderReports(Number(projectId)));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (projectId) {
      void reloadPublishedReport();
    }
  }, [dispatch, projectId, reloadPublishedReport]);

  useEffect(() => {
    if (approveReportResponse?.status === 'error') {
      return;
    }
    if (approveReportResponse?.status === 'success') {
      reload();
      closeApproveDialog();
    }
  }, [approveReportResponse, closeApproveDialog, reload]);

  useEffect(() => {
    if (rejectReportResponse?.status === 'error') {
      return;
    }
    if (rejectReportResponse?.status === 'success') {
      reload();
      closeRejectDialog();
    }
  }, [closeRejectDialog, rejectReportResponse, reload]);

  useEffect(() => {
    if (publishReportResponse?.status === 'error') {
      snackbar.toastError();
      return;
    }
    if (publishReportResponse?.status === 'success') {
      snackbar.toastSuccess(strings.REPORT_PUBLISHED);
      void reloadPublishedReport();
      reload();
      reloadProject();
      closePublishModal();
    }
  }, [closePublishModal, publishReportResponse, reload, reloadProject, reloadPublishedReport, snackbar]);

  useEffect(() => {
    if (reports) {
      const reportSelected = reports.find((report) => report.id.toString() === reportId);
      setSelectedReport(reportSelected);
    }
  }, [reportId, reports]);

  useEffect(() => {
    if (reportsResponse?.status === 'success') {
      setPublishedReports(reportsResponse.data);
    }
  }, [reportsResponse]);

  useEffect(() => {
    if (reportId) {
      const found = publishedReports?.find((r) => r.reportId.toString() === reportId);
      setSelectedPublishedReport(found);
    }
  }, [publishedReports, reportId]);

  const year = useMemo(() => {
    return selectedReport?.startDate.split('-')[0];
  }, [selectedReport]);

  const crumbs: Crumb[] = useMemo(() => {
    let crumbsList: Crumb[] = [
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

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      switch (optionItem.value) {
        case 'publish': {
          openPublishModal();
          break;
        }
      }
    },
    [openPublishModal]
  );

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
            onClick={openRejectDialog}
            size='medium'
            type='destructive'
          />
          <Button
            disabled={selectedReport?.status === 'Approved'}
            id='approveDeliverable'
            label={strings.APPROVE}
            onClick={openApprovalDialog}
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
  }, [isAllowed, selectedReport?.status, openRejectDialog, openApprovalDialog, onOptionItemClick, optionItems]);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {callToAction}
      </Box>
    ),
    [callToAction, theme]
  );

  const reportName = selectedReport ? getReportName(selectedReport) : '';

  const onEditChange = useCallback((isInEdit: boolean) => {
    setBoxInEdit(isInEdit);
  }, []);

  const changeToFunderView = useCallback(() => {
    setPublishedFunderView(true);
  }, []);

  const changeToInternalView = useCallback(() => {
    setPublishedFunderView(false);
  }, []);

  return (
    <>
      {showPublishModal && <PublishModal onClose={closePublishModal} onSubmit={publishReport} />}
      {showApproveDialog && <ApproveReportDialog onClose={closeApproveDialog} onSubmit={approveReport} />}
      {showRejectDialog && <RejectDialog onClose={closeRejectDialog} onSubmit={rejectReport} />}

      <Page
        title={
          <TitleBar
            title={`${strings.REPORT} (${reportName})`}
            header={participantProject ? `${strings.PROJECT}: ${participantProject?.dealName}` : ''}
            subtitle={
              selectedPublishedReport
                ? strings
                    .formatString(
                      strings.FUNDER_REPORT_LAST_PUBLISHED,
                      getDateDisplayValue(selectedPublishedReport.publishedTime)
                    )
                    .toString()
                : ''
            }
            titleExtraComponent={
              selectedPublishedReport &&
              (publishedFunderView ? (
                <Link fontSize={'16px'} fontWeight={400} onClick={changeToInternalView}>
                  {strings.VIEW_INTERNAL_REPORT_FORM}
                </Link>
              ) : (
                <Link fontSize={'16px'} fontWeight={400} onClick={changeToFunderView}>
                  {strings.VIEW_PUBLISHED_FUNDER_REPORT}
                </Link>
              ))
            }
          />
        }
        rightComponent={!publishedFunderView && selectedReport?.status !== 'Not Submitted' ? rightComponent : undefined}
        crumbs={crumbs}
        hierarchicalCrumbs={false}
      >
        {publishedFunderView ? (
          <>
            <Box marginBottom={4} width={'100%'}>
              <Message type='page' priority='info' body={strings.PUBLISHED_REPORT_CONSOLE_WARNING} />
            </Box>
            <Box marginBottom={4} width={'100%'}>
              <FunderReportView selectedProjectId={Number(projectId)} selectedReport={selectedPublishedReport} />
            </Box>
          </>
        ) : (
          <Box display='flex' flexDirection='column' flexGrow={1} overflow={'auto'}>
            {selectedReport && <ApprovedReportMessage report={selectedReport} />}
            {selectedReport && <RejectedReportMessage report={selectedReport} showRejectDialog={openRejectDialog} />}
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
              <FinancialSummariesBox
                report={selectedReport}
                projectId={projectId}
                reload={reload}
                isConsoleView={true}
                onEditChange={onEditChange}
                canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
              />
              <AdditionalCommentsBox
                report={selectedReport}
                projectId={projectId}
                reload={reload}
                isConsoleView={true}
                onEditChange={onEditChange}
                canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
              />
              <PhotosBox
                report={selectedReport}
                projectId={projectId}
                reload={reload}
                isConsoleView={true}
                onEditChange={onEditChange}
                canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
              />
            </Card>
          </Box>
        )}
      </Page>
    </>
  );
};

export default ReportView;
