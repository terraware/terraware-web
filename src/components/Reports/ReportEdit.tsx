import React, { useEffect, useState } from 'react';
import TfMain from 'src/components/common/TfMain';
import PageForm from 'src/components/common/PageForm';
import strings from 'src/strings';
import ReportForm from 'src/components/Reports/ReportForm';
import { Box, Typography, useTheme } from '@mui/material';
import ReportService from 'src/services/ReportService';
import { Report, ReportFile } from 'src/types/Report';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import ReportFormAnnual from 'src/components/Reports/ReportFormAnnual';
import { FormButton } from 'src/components/common/FormBottomBar';
import useSnackbar from 'src/utils/useSnackbar';
import SubmitConfirmationDialog from 'src/components/Reports/SubmitConfirmationDialog';
import { useUser } from 'src/providers';
import produce from 'immer';
import { Organization } from 'src/types/Organization';
import CannotEditReportDialog from './InvalidUserModal';
import useReportFiles from 'src/components/Reports/useReportFiles';

export type ReportEditProps = {
  organization: Organization;
};

export default function ReportEdit({ organization }: ReportEditProps): JSX.Element {
  const { reportId } = useParams<{ reportId: string }>();
  const reportIdInt = parseInt(reportId, 10);
  const { user } = useUser();

  const theme = useTheme();

  const history = useHistory();

  const snackbar = useSnackbar();

  const [showInvalidUserModal, setShowInvalidUserModal] = useState(false);

  const [photos, setPhotos] = useState<File[]>([]);

  const [photoIdsToRemove, setPhotoIdsToRemove] = useState<number[]>([]);

  const [report, setReport] = useState<Report>();

  const [validateFields, setValidateFields] = useState(false);

  useEffect(() => {
    const getReport = async () => {
      const result = await ReportService.getReport(reportIdInt);
      if (result.requestSucceeded && result.report) {
        setReport(result.report);
      } else {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_OPEN);
      }
    };

    if (reportIdInt) {
      getReport();
    } else {
      snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_OPEN);
    }
  }, [reportIdInt, snackbar]);

  const [newReportFiles, setNewReportFiles] = useState<File[]>([]);

  const [updatedReportFiles, setUpdatedReportFiles] = useState<ReportFile[]>([]);

  const initialReportFiles = useReportFiles(report, setUpdatedReportFiles);

  const updateFiles = async () => {
    await Promise.all(
      initialReportFiles?.map((f) => {
        if (!updatedReportFiles?.includes(f)) {
          return ReportService.deleteReportFile(reportIdInt, f.id);
        }
        return undefined;
      }) ?? []
    );
    await Promise.all(newReportFiles?.map((f) => ReportService.uploadReportFile(reportIdInt, f)) ?? []);
  };

  const [currentUserEditing, setCurrentUserEditing] = useState(true);
  useEffect(() => {
    const getReport = async () => {
      const result = await ReportService.getReport(reportIdInt);
      if (result.requestSucceeded && result.report) {
        setCurrentUserEditing(result.report.lockedByUserId === user?.id);
      }
    };

    let interval: ReturnType<typeof setInterval>;

    interval = setInterval(getReport, 60000);

    // Clean up existing interval.
    return () => {
      clearInterval(interval);
    };
  }, [reportIdInt, user?.id]);

  useEffect(() => {
    if (report && user && !currentUserEditing && !showInvalidUserModal) {
      setShowInvalidUserModal(true);
    }
  }, [report, user, showInvalidUserModal, currentUserEditing]);

  const [showAnnual, setShowAnnual] = useState(false);

  const [confirmSubmitDialogOpen, setConfirmSubmitDialogOpen] = useState(false);

  const updatePhotos = async (iReportId: number) => {
    await ReportService.uploadReportPhotos(iReportId, photos);
    if (photoIdsToRemove) {
      await ReportService.deleteReportPhotos(iReportId, photoIdsToRemove);
    }
  };

  const gotoReportView = async (saveChanges: boolean) => {
    let saveResult;
    if (saveChanges && report) {
      saveResult = await ReportService.updateReport(report);
      if (!saveResult.requestSucceeded) {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      } else {
        await updateFiles();
        await updatePhotos(report.id);
      }
    }

    if (!saveResult || saveResult.requestSucceeded) {
      // unlock the report
      const unlockResult = await ReportService.unlockReport(reportIdInt);
      if (!unlockResult.requestSucceeded) {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_UNLOCK);
      }

      // then navigate to view
      history.replace({ pathname: APP_PATHS.REPORTS_VIEW.replace(':reportId', reportId) });
    }
  };

  const handleSaveAndNext = async () => {
    if (report) {
      const saveResult = await ReportService.updateReport(report);
      setShowAnnual(true);
      setValidateFields(false);
      if (!saveResult.requestSucceeded) {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      } else {
        await updateFiles();
        await updatePhotos(report.id);
      }
    }
  };

  const handleBack = async () => {
    if (report) {
      const saveResult = await ReportService.updateReport(report);
      setShowAnnual(false);
      if (!saveResult.requestSucceeded) {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      }
    }
  };

  const hasEmptyRequiredFields = (iReport: Report) => {
    const emptySeedbankFields = iReport.seedBanks?.some((sb) => {
      return !sb.buildStartedDate || !sb.buildCompletedDate || !sb.operationStartedDate;
    });
    const emptyNurseryFields = iReport.nurseries?.some((nursery) => {
      return (
        !nursery.buildStartedDate || !nursery.buildCompletedDate || !nursery.operationStartedDate || !nursery.capacity
      );
    });
    const emptyPlantingSitesFields = iReport.plantingSites?.some((plantingSite) => {
      return (
        !plantingSite.totalPlantingSiteArea ||
        !plantingSite.totalPlantedArea ||
        !plantingSite.totalTreesPlanted ||
        !plantingSite.totalPlantsPlanted ||
        !plantingSite.mortalityRate
      );
    });
    return !iReport.summaryOfProgress || emptySeedbankFields || emptyNurseryFields || emptyPlantingSitesFields;
  };

  const hasEmptyRequiredAnnualFields = (iReport: Report) => {
    if (!iReport.isAnnual) {
      return false;
    }
    return (
      !iReport.annualDetails?.projectSummary ||
      !iReport.annualDetails?.projectImpact ||
      !iReport.annualDetails?.budgetNarrativeSummary ||
      !iReport.annualDetails?.socialImpact ||
      !iReport.annualDetails?.challenges ||
      !iReport.annualDetails?.keyLessons ||
      !iReport.annualDetails?.successStories ||
      !iReport.annualDetails?.opportunities ||
      !iReport.annualDetails?.nextSteps ||
      (iReport.annualDetails?.isCatalytic && !iReport.annualDetails?.catalyticDetail) ||
      iReport.annualDetails?.sustainableDevelopmentGoals.some((sdg) => !sdg?.progress)
    );
  };

  const handleSubmitButton = () => {
    if (report) {
      if (hasEmptyRequiredFields(report)) {
        setConfirmSubmitDialogOpen(false);
        if (showAnnual) {
          handleBack();
        }
        setValidateFields(true);
        snackbar.toastError(strings.GENERIC_ERROR, strings.FILL_OUT_ALL_FIELDS);
        return;
      }
      if (hasEmptyRequiredAnnualFields(report)) {
        setConfirmSubmitDialogOpen(false);
        setValidateFields(true);
        snackbar.toastError(strings.GENERIC_ERROR, strings.FILL_OUT_ALL_FIELDS);
        return;
      }
    }
    setConfirmSubmitDialogOpen(true);
  };

  const submitReport = async () => {
    if (report) {
      const saveResult = await ReportService.updateReport(report);
      if (saveResult.requestSucceeded) {
        await updateFiles();
        await updatePhotos(report.id);
        const submitResult = await ReportService.submitReport(reportIdInt);
        if (submitResult.requestSucceeded) {
          await ReportService.unlockReport(reportIdInt);
          history.replace({ pathname: APP_PATHS.REPORTS_VIEW.replace(':reportId', reportId) });
        } else {
          snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SUBMIT);
        }
      } else {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      }
    }
  };

  const onPhotosChanged = (photosList: File[]) => {
    setPhotos(photosList);
  };

  const onNewFilesChanged = (filesList: File[]) => {
    setNewReportFiles(filesList);
  };

  const onExistingFilesChanged = (filesList: ReportFile[]) => {
    setUpdatedReportFiles(filesList);
  };

  const rightButtons: FormButton[] = [];
  if (report?.isAnnual && showAnnual) {
    rightButtons.push({
      id: 'backToQuarterly',
      text: strings.BACK,
      onClick: handleBack,
      disabled: false,
      buttonType: 'passive',
    });
  }
  rightButtons.push({
    id: 'saveAndCloseReport',
    text: strings.REPORT_SAVE_AND_CLOSE,
    onClick: () => gotoReportView(true),
    disabled: false,
    buttonType: 'passive',
  });

  const redirectToReportView = () => {
    history.push(APP_PATHS.REPORTS_VIEW.replace(':reportId', reportId));
  };

  /**
   * Report update functions
   */
  const updateReport = (field: string, value: any) => {
    if (report) {
      setReport(
        produce((draft) => {
          // @ts-ignore
          draft[field] = value;
        })
      );
    }
  };

  const updateLocation = (
    index: number,
    field: string,
    value: any,
    location: 'seedBanks' | 'nurseries' | 'plantingSites'
  ) => {
    if (report && report[location]) {
      setReport(
        produce((draft) => {
          // @ts-ignore
          draft[location][index][field] = value;
        })
      );
    }
  };

  const updateWorkers = (
    index: number,
    workersField: string,
    value: any,
    location: 'seedBanks' | 'nurseries' | 'plantingSites'
  ) => {
    if (report && report[location]) {
      setReport(
        produce((draft) => {
          // @ts-ignore
          draft[location][index].workers[workersField] = value;
        })
      );
    }
  };

  const onRemovePhoto = (id: number) => {
    const newIds = [...photoIdsToRemove];
    newIds.push(id);
    setPhotoIdsToRemove(newIds);
  };

  const updateAnnualDetails = (field: string, value: any) => {
    if (report && report.annualDetails) {
      setReport(
        produce((draft) => {
          // @ts-ignore
          draft.annualDetails[field] = value;
        })
      );
    }
  };

  const updateSDGProgress = (index: number, value: string) => {
    if (
      report?.annualDetails?.sustainableDevelopmentGoals &&
      report?.annualDetails?.sustainableDevelopmentGoals[index]
    ) {
      setReport(
        produce((draft) => {
          // @ts-ignore
          draft.annualDetails.sustainableDevelopmentGoals[index].progress = value;
        })
      );
    }
  };

  /** end of update functions */

  return (
    <TfMain>
      {showInvalidUserModal && (
        <CannotEditReportDialog
          open={showInvalidUserModal}
          onClose={redirectToReportView}
          onSubmit={redirectToReportView}
        />
      )}
      <SubmitConfirmationDialog
        open={confirmSubmitDialogOpen}
        onClose={() => setConfirmSubmitDialogOpen(false)}
        onCancel={() => setConfirmSubmitDialogOpen(false)}
        onSubmit={submitReport}
      />
      <Box padding={theme.spacing(3)}>
        <Typography fontSize='24px' fontWeight={600}>
          {report ? `Report (${report?.year}-Q${report?.quarter})` : ''}
        </Typography>
      </Box>
      {report && (
        <PageForm
          cancelID='cancelEdits'
          saveID='submitReport'
          onCancel={() => gotoReportView(false)}
          onSave={report.isAnnual ? (showAnnual ? handleSubmitButton : handleSaveAndNext) : handleSubmitButton}
          saveButtonText={
            report.isAnnual ? (showAnnual ? strings.REPORT_SUBMIT : strings.SAVE_AND_NEXT) : strings.REPORT_SUBMIT
          }
          cancelButtonText={strings.CANCEL}
          additionalRightButtons={rightButtons}
        >
          {report &&
            (showAnnual ? (
              <ReportFormAnnual
                editable={true}
                report={report}
                updateDetails={updateAnnualDetails}
                updateSDGProgress={updateSDGProgress}
                initialReportFiles={initialReportFiles ?? []}
                onNewFilesChanged={onNewFilesChanged}
                onExistingFilesChanged={onExistingFilesChanged}
                validate={validateFields}
              />
            ) : (
              <ReportForm
                editable={true}
                draftReport={report}
                onUpdateReport={updateReport}
                allSeedbanks={report.seedBanks ?? []}
                allNurseries={report.nurseries ?? []}
                allPlantingSites={report.plantingSites ?? []}
                onUpdateLocation={updateLocation}
                onUpdateWorkers={updateWorkers}
                onPhotosChanged={onPhotosChanged}
                onPhotoRemove={onRemovePhoto}
                validate={validateFields}
              />
            ))}
        </PageForm>
      )}
    </TfMain>
  );
}
