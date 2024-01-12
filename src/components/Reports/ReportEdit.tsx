import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { BusySpinner, FormButton } from '@terraware/web-components';
import { makeStyles } from '@mui/styles';
import { Box, Typography, useTheme } from '@mui/material';
import produce from 'immer';
import { overWordLimit } from 'src/utils/text';
import strings from 'src/strings';
import ReportService from 'src/services/ReportService';
import { Report, ReportFile } from 'src/types/Report';
import { APP_PATHS } from 'src/constants';
import useSnackbar from 'src/utils/useSnackbar';
import { useOrganization, useUser } from 'src/providers';
import ReportForm from 'src/components/Reports/ReportForm';
import TfMain from 'src/components/common/TfMain';
import PageForm from 'src/components/common/PageForm';
import SubmitConfirmationDialog from 'src/components/Reports/SubmitConfirmationDialog';
import ReportFormAnnual from 'src/components/Reports/ReportFormAnnual';
import useReportFiles from 'src/components/Reports/useReportFiles';
import CannotEditReportDialog from 'src/components/Reports/InvalidUserModal';
import {
  buildCompletedDateValid,
  buildStartedDateValid,
  operationStartedDateValid,
} from 'src/components/Reports/LocationSelection/util';

const useStyles = makeStyles((theme) => ({
  form: {
    paddingBottom: '250px',
  },
}));

export default function ReportEdit(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const { reportId } = useParams<{ reportId: string }>();
  const { user } = useUser();
  const theme = useTheme();
  const classes = useStyles();
  const history = useHistory();
  const snackbar = useSnackbar();

  const [showInvalidUserModal, setShowInvalidUserModal] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoIdsToRemove, setPhotoIdsToRemove] = useState<number[]>([]);
  const [report, setReport] = useState<Report>();
  const [validateFields, setValidateFields] = useState(false);
  const [busyState, setBusyState] = useState(false);
  const [idInView, setIdInView] = useState('');
  const [newReportFiles, setNewReportFiles] = useState<File[]>([]);
  const [updatedReportFiles, setUpdatedReportFiles] = useState<ReportFile[]>([]);
  const [showAnnual, setShowAnnual] = useState(false);
  const [confirmSubmitDialogOpen, setConfirmSubmitDialogOpen] = useState(false);
  const [currentUserEditing, setCurrentUserEditing] = useState(true);

  const initialReportFiles = useReportFiles(report, setUpdatedReportFiles);

  const reportIdInt = parseInt(reportId, 10);
  const reportName = `Report (${report?.year}-Q${report?.quarter}) ` + (report?.projectName ?? '');

  useEffect(() => {
    const el = document.getElementById(idInView);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIdInView('');
    }
  }, [idInView]);

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
      void getReport();
    } else {
      snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_OPEN);
    }
  }, [reportIdInt, snackbar]);

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

  const updatePhotos = async (iReportId: number) => {
    await ReportService.uploadReportPhotos(iReportId, photos);
    setPhotos([]);
    if (photoIdsToRemove) {
      await ReportService.deleteReportPhotos(iReportId, photoIdsToRemove);
      setPhotoIdsToRemove([]);
    }
  };

  const gotoReportView = async (saveChanges: boolean) => {
    let saveResult;
    if (saveChanges && report) {
      setBusyState(true);
      saveResult = await ReportService.updateReport(report);
      if (!saveResult.requestSucceeded) {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      } else {
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        await updateFiles();
        await updatePhotos(report.id);
      }
      setBusyState(false);
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

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const switchPages = (page: 'quarterly' | 'annual') => {
    setShowAnnual(page === 'annual');
    goToTop();
  };

  const handleSaveAndNext = async () => {
    if (report) {
      setBusyState(true);
      const saveResult = await ReportService.updateReport(report);
      switchPages('annual');
      setValidateFields(false);
      if (!saveResult.requestSucceeded) {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      } else {
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        await updateFiles();
        await updatePhotos(report.id);
      }
      setBusyState(false);
    }
  };

  const handleBack = async (hideToast?: boolean) => {
    if (report) {
      setBusyState(true);
      const saveResult = await ReportService.updateReport(report);
      switchPages('quarterly');
      if (!hideToast) {
        if (!saveResult.requestSucceeded) {
          snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
        } else {
          snackbar.toastSuccess(strings.CHANGES_SAVED);
        }
      }
      setBusyState(false);
    }
  };

  useEffect(() => {
    const popStateEventHandler = (event: PopStateEvent) => {
      window.history.pushState(null, document.title, window.location.href);
      snackbar.toastWarning(strings.REPORT_BACK_WARNING);
    };

    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', popStateEventHandler);
    return () => {
      window.removeEventListener('popstate', popStateEventHandler);
    };
  }, [snackbar]);

  const hasEmptyRequiredFields = (iReport: Report) => {
    if (!iReport.summaryOfProgress) {
      return 'summary-of-progress';
    }

    const emptyWorkerField = (location: any) => {
      return (
        location.workers.paidWorkers === null ||
        location.workers.femalePaidWorkers === null ||
        location.workers.volunteers === null
      );
    };
    const emptySeedbankFields = iReport.seedBanks?.findIndex((sb) => {
      return (
        sb.selected &&
        (!sb.buildStartedDate ||
          !sb.buildCompletedDate ||
          !sb.operationStartedDate ||
          !buildStartedDateValid(sb) ||
          !buildCompletedDateValid(sb) ||
          !operationStartedDateValid(sb) ||
          emptyWorkerField(sb))
      );
    });
    if (emptySeedbankFields !== undefined && emptySeedbankFields >= 0) {
      return `seedbank-${emptySeedbankFields}`;
    }

    const emptyNurseryFields = iReport.nurseries?.findIndex((nursery) => {
      return (
        nursery.selected &&
        (!nursery.buildStartedDate ||
          !nursery.buildCompletedDate ||
          !nursery.operationStartedDate ||
          nursery.capacity === null ||
          !buildStartedDateValid(nursery) ||
          !buildCompletedDateValid(nursery) ||
          !operationStartedDateValid(nursery) ||
          emptyWorkerField(nursery))
      );
    });
    if (emptyNurseryFields !== undefined && emptyNurseryFields >= 0) {
      return `nursery-${emptyNurseryFields}`;
    }

    const emptyPlantingSitesFields = iReport.plantingSites?.findIndex((plantingSite) => {
      const speciesDataMissing =
        plantingSite.species?.some((sp) => sp.totalPlanted === null || sp.mortalityRateInField === null) ?? false;
      return (
        plantingSite.selected &&
        (plantingSite.totalPlantingSiteArea === null ||
          plantingSite.totalPlantedArea === null ||
          plantingSite.totalTreesPlanted === null ||
          plantingSite.totalPlantsPlanted === null ||
          plantingSite.mortalityRate === null ||
          speciesDataMissing ||
          emptyWorkerField(plantingSite))
      );
    });
    if (emptyPlantingSitesFields !== undefined && emptyPlantingSitesFields >= 0) {
      return `planting-site-${emptyPlantingSitesFields}`;
    }

    return '';
  };

  const hasEmptyRequiredAnnualFields = (iReport: Report) => {
    if (!iReport.isAnnual) {
      return '';
    }

    if ((iReport.annualDetails?.bestMonthsForObservation?.length ?? 0) === 0) {
      return 'observation-months';
    } else if (!iReport.annualDetails?.projectSummary || overWordLimit(iReport.annualDetails?.projectSummary, 100)) {
      return 'project-summary';
    } else if (!iReport.annualDetails?.projectImpact) {
      return 'project-impact';
    } else if (!iReport.annualDetails?.budgetNarrativeSummary) {
      return 'budget-narrative';
    } else if (!iReport.annualDetails?.socialImpact) {
      return 'social-impact';
    } else if (iReport.annualDetails?.sustainableDevelopmentGoals.some((sdg) => !sdg?.progress)) {
      return 'sdg';
    } else if (!iReport.annualDetails?.challenges) {
      return 'challenges';
    } else if (!iReport.annualDetails?.keyLessons) {
      return 'key-lessons';
    } else if (!iReport.annualDetails?.successStories) {
      return 'success-stories';
    } else if (iReport.annualDetails?.isCatalytic && !iReport.annualDetails?.catalyticDetail) {
      return 'catalytic-detail';
    } else if (!iReport.annualDetails?.opportunities) {
      return 'opportunities';
    } else if (!iReport.annualDetails?.nextSteps) {
      return 'next-steps';
    } else {
      return '';
    }
  };

  const handleSubmitButton = async () => {
    if (report) {
      const invalidField = hasEmptyRequiredFields(report);
      if (invalidField !== '') {
        if (showAnnual) {
          await handleBack(true).then(() => setIdInView(invalidField));
        }
        setValidateFields(true);
        snackbar.toastError(strings.PROBLEMS_WITH_ENTRIES);
        return;
      }

      const invalidAnnualField = hasEmptyRequiredAnnualFields(report);
      if (invalidAnnualField !== '') {
        setIdInView(invalidAnnualField);
        setValidateFields(true);
        snackbar.toastError(strings.PROBLEMS_WITH_ENTRIES);
        return;
      }
    }
    setConfirmSubmitDialogOpen(true);
  };

  const submitReport = async () => {
    if (report) {
      setBusyState(true);
      const saveResult = await ReportService.updateReport(report);
      if (saveResult.requestSucceeded) {
        await updateFiles();
        await updatePhotos(report.id);
        const submitResult = await ReportService.submitReport(reportIdInt);
        if (submitResult.requestSucceeded) {
          reloadOrganizations(selectedOrganization.id);
          history.replace({ pathname: APP_PATHS.REPORTS_VIEW.replace(':reportId', reportId) });
        } else {
          snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SUBMIT);
        }
      } else {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      }
      setBusyState(false);
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
      {busyState && <BusySpinner withSkrim={true} />}
      <Box padding={theme.spacing(3)}>
        <Typography fontSize='24px' fontWeight={600}>
          {reportName}
        </Typography>
      </Box>
      {report && (
        <PageForm
          className={classes.form}
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
