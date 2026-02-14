import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DropdownItem, Message } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

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
import isEnabled from 'src/features';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useBoolean from 'src/hooks/useBoolean';
import { useLocalization, useUser } from 'src/providers';
import { useListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import {
  useGetAcceleratorReportQuery,
  usePublishAcceleratorReportMutation,
  useReviewAcceleratorReportMutation,
} from 'src/queries/generated/reports';
import FunderReportView from 'src/scenes/FunderReport/FunderReportView';
import strings from 'src/strings';
import { MetricType } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';
import ApproveReportDialog from './ApproveReportDialog';
import Metadata from './Metadata';
import MetricRow from './MetricRow';
import PublishModal from './PublishModal';
import RejectDialog from './RejectDialog';

const ReportView = () => {
  const { activeLocale } = useLocalization();
  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const projectId = Number(pathParams.projectId);
  const reportId = Number(pathParams.reportId);
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isAllowed } = useUser();
  const [showApproveDialog, , openApprovalDialog, closeApproveDialog] = useBoolean(false);
  const [showRejectDialog, , openRejectDialog, closeRejectDialog] = useBoolean(false);
  const { crumbs: participantProjectCrumbs, acceleratorProject, project } = useAcceleratorProjectData();
  const theme = useTheme();
  const [boxInEdit, setBoxInEdit] = useState<boolean>(false);

  const [showPublishModal, , openPublishModal, closePublishModal] = useBoolean(false);
  const snackbar = useSnackbar();
  const { reload: reloadProject } = useAcceleratorProjectData();
  const [publishedFunderView, setPublishedFunderView] = useState(false);

  const getReportResponse = useGetAcceleratorReportQuery({ reportId, projectId, includeMetrics: true });
  const listPublishedReportResponse = useListPublishedReportsQuery(projectId);

  const [reviewReport, reviewReportResponse] = useReviewAcceleratorReportMutation();
  const [publishReport, publishReportResponse] = usePublishAcceleratorReportMutation();

  const report = useMemo(() => getReportResponse.data?.report, [getReportResponse.data?.report]);
  const publishedReport = useMemo(
    () => listPublishedReportResponse.data?.reports.find((thisReport) => thisReport.reportId === reportId),
    [listPublishedReportResponse.data?.reports, reportId]
  );

  const publishReportCallback = useCallback(() => {
    void publishReport({
      reportId,
      projectId,
    });
    closePublishModal();
  }, [closePublishModal, projectId, publishReport, reportId]);

  const approveReportCallback = useCallback(() => {
    if (report) {
      void reviewReport({
        projectId,
        reportId,
        reviewAcceleratorReportRequestPayload: {
          review: {
            ...report,
            feedback: undefined,
            status: 'Approved',
          },
        },
      });
    }
  }, [projectId, report, reportId, reviewReport]);

  const rejectReport = useCallback(
    (feedback?: string) => {
      if (report) {
        void reviewReport({
          projectId,
          reportId,
          reviewAcceleratorReportRequestPayload: {
            review: {
              ...report,
              feedback,
              status: 'Needs Update',
            },
          },
        });
      }
    },
    [projectId, report, reportId, reviewReport]
  );

  useEffect(() => {
    if (reviewReportResponse.isError) {
      return;
    }
    if (reviewReportResponse.isSuccess) {
      closeApproveDialog();
      closeRejectDialog();
    }
  }, [closeApproveDialog, closeRejectDialog, reviewReportResponse.isError, reviewReportResponse.isSuccess]);

  useEffect(() => {
    if (publishReportResponse.isError) {
      snackbar.toastError();
      return;
    }
    if (publishReportResponse.isSuccess) {
      snackbar.toastSuccess(strings.REPORT_PUBLISHED);
      reloadProject();
      closePublishModal();
    }
  }, [closePublishModal, publishReportResponse, reloadProject, snackbar]);

  const year = useMemo(() => {
    return report?.startDate.split('-')[0];
  }, [report]);

  const crumbs: Crumb[] = useMemo(() => {
    let crumbsList: Crumb[] = [
      {
        name: activeLocale ? strings.REPORTS : '',
        to: year
          ? `${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId.toString())}?year=${year}`
          : APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId.toString()),
      },
    ];
    if (isAcceleratorRoute) {
      crumbsList = [
        ...participantProjectCrumbs,
        {
          name: acceleratorProject?.dealName || project?.name || '',
          to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', acceleratorProject?.projectId.toString() || ''),
        },
      ].concat(crumbsList);
    }

    return crumbsList;
  }, [
    activeLocale,
    isAcceleratorRoute,
    acceleratorProject?.dealName,
    acceleratorProject?.projectId,
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
              disabled: report?.status !== 'Approved',
            },
          ]
        : [],
    [activeLocale, report?.status]
  );

  const callToAction = useMemo(() => {
    return (
      isAllowed('UPDATE_SUBMISSION_STATUS') && (
        <>
          <Button
            disabled={report?.status === 'Needs Update'}
            id='rejectDeliverable'
            label={strings.REQUEST_UPDATE_ACTION}
            priority='secondary'
            onClick={openRejectDialog}
            size='medium'
            type='destructive'
          />
          <Button
            disabled={report?.status === 'Approved'}
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
  }, [isAllowed, report?.status, openRejectDialog, openApprovalDialog, onOptionItemClick, optionItems]);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {callToAction}
      </Box>
    ),
    [callToAction, theme]
  );

  const reportName = report ? getReportName(report) : '';

  const onEditChange = useCallback((isInEdit: boolean) => {
    setBoxInEdit(isInEdit);
  }, []);

  const changeToFunderView = useCallback(() => {
    setPublishedFunderView(true);
  }, []);

  const changeToInternalView = useCallback(() => {
    setPublishedFunderView(false);
  }, []);

  const yearToUse = useMemo(
    () => (year ? Number(report?.startDate.split('-')[0]) : DateTime.now().year),
    [report?.startDate, year]
  );
  const improvedReportsEnabled = isEnabled('Improved Reports');

  return (
    <>
      {showPublishModal && <PublishModal onClose={closePublishModal} onSubmit={publishReportCallback} />}
      {showApproveDialog && <ApproveReportDialog onClose={closeApproveDialog} onSubmit={approveReportCallback} />}
      {showRejectDialog && <RejectDialog onClose={closeRejectDialog} onSubmit={rejectReport} />}

      <Page
        title={
          <TitleBar
            title={`${strings.REPORT} (${reportName})`}
            header={acceleratorProject ? `${strings.PROJECT}: ${acceleratorProject?.dealName}` : ''}
            subtitle={
              publishedReport
                ? strings
                    .formatString(
                      strings.FUNDER_REPORT_LAST_PUBLISHED,
                      getDateDisplayValue(publishedReport.publishedTime)
                    )
                    .toString()
                : ''
            }
            titleExtraComponent={
              publishedReport &&
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
        rightComponent={!publishedFunderView && report?.status !== 'Not Submitted' ? rightComponent : undefined}
        crumbs={crumbs}
        hierarchicalCrumbs={false}
      >
        {publishedFunderView ? (
          <>
            <Box marginBottom={4} width={'100%'}>
              <Message type='page' priority='info' body={strings.PUBLISHED_REPORT_CONSOLE_WARNING} />
            </Box>
            <Box marginBottom={4} width={'100%'}>
              <FunderReportView selectedProjectId={projectId} selectedReport={publishedReport} />
            </Box>
          </>
        ) : (
          <Box display='flex' flexDirection='column' flexGrow={1} overflow={'auto'}>
            {report && <ApprovedReportMessage report={report} />}
            {report && <RejectedReportMessage report={report} showRejectDialog={openRejectDialog} />}
            <Card
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}
            >
              {report && <Metadata report={report} projectId={projectId} />}
              {report?.startDate && report?.endDate && !improvedReportsEnabled && (
                <Box
                  borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
                  padding={theme.spacing(3, 0)}
                  marginBottom={3}
                >
                  <Typography fontSize={14} fontStyle={'italic'}>
                    {strings.formatString(strings.REPORT_PERIOD, report?.startDate, report?.endDate)}
                  </Typography>
                </Box>
              )}
              <HighlightsBox
                report={report}
                projectId={projectId}
                isConsoleView={true}
                onEditChange={onEditChange}
                canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
              />
              {improvedReportsEnabled && (
                <Typography fontSize={'20px'} fontWeight={600}>
                  {strings.PROGRESS}
                </Typography>
              )}
              {['system', 'project', 'standard'].map((type) => {
                const metrics =
                  type === 'system'
                    ? report?.systemMetrics
                    : type === 'project'
                      ? report?.projectMetrics
                      : report?.standardMetrics;

                return metrics?.map((metric, index) => {
                  return improvedReportsEnabled ? (
                    <MetricRow
                      key={`${type}-${index}`}
                      type={type as MetricType}
                      metric={metric}
                      reportLabel={report?.quarter}
                      year={yearToUse}
                    />
                  ) : (
                    <MetricBox
                      isConsoleView
                      key={`${type}-${index}`}
                      metric={metric}
                      projectId={projectId}
                      reportId={Number(reportId)}
                      type={type as MetricType}
                      onEditChange={onEditChange}
                      canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
                      year={yearToUse}
                    />
                  );
                });
              })}
              {!improvedReportsEnabled && (
                <>
                  <AchievementsBox
                    report={report}
                    projectId={projectId}
                    isConsoleView={true}
                    onEditChange={onEditChange}
                    canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
                  />
                  <ChallengesMitigationBox
                    report={report}
                    projectId={projectId}
                    isConsoleView={true}
                    onEditChange={onEditChange}
                    canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
                  />
                  <FinancialSummariesBox
                    report={report}
                    projectId={projectId}
                    isConsoleView={true}
                    onEditChange={onEditChange}
                    canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
                  />
                  <AdditionalCommentsBox
                    report={report}
                    projectId={projectId}
                    isConsoleView={true}
                    onEditChange={onEditChange}
                    canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
                  />
                  <PhotosBox
                    report={report}
                    projectId={projectId}
                    isConsoleView={true}
                    onEditChange={onEditChange}
                    canEdit={isAllowed('EDIT_REPORTS') && !boxInEdit}
                  />
                </>
              )}
            </Card>
          </Box>
        )}
      </Page>
    </>
  );
};

export default ReportView;
