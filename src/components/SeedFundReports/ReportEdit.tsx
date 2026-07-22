import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, FormButton } from '@terraware/web-components';
import produce from 'immer';

import CannotEditReportDialog from 'src/components/SeedFundReports/InvalidUserModal';
import {
  buildCompletedDateValid,
  buildStartedDateValid,
  operationStartedDateValid,
} from 'src/components/SeedFundReports/LocationSelection/util';
import ReportForm from 'src/components/SeedFundReports/ReportForm';
import ReportFormAnnual from 'src/components/SeedFundReports/ReportFormAnnual';
import SubmitConfirmationDialog from 'src/components/SeedFundReports/SubmitConfirmationDialog';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import useSeedFundReport from 'src/hooks/useSeedFundReport';
import useSeedFundReportActions from 'src/hooks/useSeedFundReportActions';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization, useUser } from 'src/providers';
import SeedFundReportService from 'src/services/SeedFundReportService';
import strings from 'src/strings';
import { SeedFundReport, SeedFundReportFile } from 'src/types/SeedFundReport';
import { overWordLimit } from 'src/utils/text';
import useSnackbar from 'src/utils/useSnackbar';

import useReportFiles from './useReportFiles';

export default function ReportEdit(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const { reportId } = useParams<{ reportId: string }>();
  const { user } = useUser();
  const theme = useTheme();

  const navigate = useSyncNavigate();

  const snackbar = useSnackbar();

  const [showInvalidUserModal, setShowInvalidUserModal] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoIdsToRemove, setPhotoIdsToRemove] = useState<number[]>([]);
  const [report, setReport] = useState<SeedFundReport>();
  const [validateFields, setValidateFields] = useState(false);
  const [idInView, setIdInView] = useState('');
  const [newReportFiles, setNewReportFiles] = useState<File[]>([]);
  const [updatedReportFiles, setUpdatedReportFiles] = useState<SeedFundReportFile[]>([]);
  const [showAnnual, setShowAnnual] = useState(false);
  const [confirmSubmitDialogOpen, setConfirmSubmitDialogOpen] = useState(false);
  const [currentUserEditing, setCurrentUserEditing] = useState(true);

  const initialReportFiles = useReportFiles(report, setUpdatedReportFiles);

  const reportIdInt = reportId ? parseInt(reportId, 10) : -1;
  const reportName = `Report (${report?.year}-Q${report?.quarter}) ` + (report?.projectName ?? '');

  const { report: loadedReport, isError, reload } = useSeedFundReport(reportIdInt);
  const { onUpdate, unlockReport, onSubmit, isLoading: reportActionInProgress } = useSeedFundReportActions();

  const busyState = reportActionInProgress;

  useEffect(() => {
    const el = document.getElementById(idInView);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIdInView('');
    }
  }, [idInView]);

  const reportIdValid = useCallback(() => reportIdInt && reportIdInt !== -1, [reportIdInt]);

  useEffect(() => {
    if (loadedReport && !report) {
      setReport(loadedReport);
    }
  }, [loadedReport, report]);

  useEffect(() => {
    if (isError) {
      snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_OPEN);
    }
  }, [isError, snackbar]);

  const updateFiles = async () => {
    if (reportIdValid()) {
      await Promise.all(
        initialReportFiles?.map((f: { id: number; filename: string }) => {
          if (!updatedReportFiles?.includes(f)) {
            return SeedFundReportService.deleteReportFile(reportIdInt, f.id);
          }
          return undefined;
        }) ?? []
      );
      await Promise.all(newReportFiles?.map((f) => SeedFundReportService.uploadReportFile(reportIdInt, f)) ?? []);
    }
  };

  useEffect(() => {
    const checkLockOwner = async () => {
      const latest = await reload();
      if (latest) {
        setCurrentUserEditing(latest.lockedByUserId === user?.id);
      }
    };

    const interval = setInterval(() => void checkLockOwner(), 60000);

    // Clean up existing interval.
    return () => {
      clearInterval(interval);
    };
  }, [reload, user?.id]);

  useEffect(() => {
    if (report && user && !currentUserEditing && !showInvalidUserModal) {
      setShowInvalidUserModal(true);
    }
  }, [report, user, showInvalidUserModal, currentUserEditing]);

  const updatePhotos = async (iReportId: number) => {
    await SeedFundReportService.uploadReportPhotos(iReportId, photos);
    setPhotos([]);
    if (photoIdsToRemove) {
      await SeedFundReportService.deleteReportPhotos(iReportId, photoIdsToRemove);
      setPhotoIdsToRemove([]);
    }
  };

  const gotoReportView = async (saveChanges: boolean) => {
    if (saveChanges && report) {
      try {
        await onUpdate(report);
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        await updateFiles();
        await updatePhotos(report.id);
      } catch {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
        return;
      }
    }

    if (reportIdValid()) {
      // unlock the report
      try {
        await unlockReport(reportIdInt);
      } catch {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_UNLOCK);
      }

      // then navigate to view
      if (reportId) {
        navigate({ pathname: APP_PATHS.SEED_FUND_REPORTS_VIEW.replace(':reportId', reportId) });
      }
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
      try {
        await onUpdate(report);
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        await updateFiles();
        await updatePhotos(report.id);
      } catch {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      } finally {
        switchPages('annual');
        setValidateFields(false);
      }
    }
  };

  const handleBack = async (hideToast?: boolean) => {
    if (report) {
      try {
        await onUpdate(report);
        if (!hideToast) {
          snackbar.toastSuccess(strings.CHANGES_SAVED);
        }
      } catch {
        if (!hideToast) {
          snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
        }
      } finally {
        switchPages('quarterly');
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const hasEmptyRequiredFields = (iReport: SeedFundReport) => {
    if (!iReport.summaryOfProgress) {
      return 'summary-of-progress';
    }

    const emptyWorkerField = (location: any) => {
      /* eslint-disable eqeqeq */
      return (
        location.workers.paidWorkers == null ||
        location.workers.femalePaidWorkers == null ||
        location.workers.volunteers == null
      );
      /* eslint-enable eqeqeq */
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
          /* eslint-disable-next-line eqeqeq */
          nursery.capacity == null ||
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
      /* eslint-disable eqeqeq */
      const speciesDataMissing =
        plantingSite.species?.some((sp) => sp.totalPlanted == null || sp.mortalityRateInField == null) ?? false;
      return (
        plantingSite.selected &&
        (plantingSite.totalPlantingSiteArea == null ||
          plantingSite.totalPlantedArea == null ||
          plantingSite.totalTreesPlanted == null ||
          plantingSite.totalPlantsPlanted == null ||
          plantingSite.mortalityRate == null ||
          speciesDataMissing ||
          emptyWorkerField(plantingSite))
      );
      /* eslint-enable eqeqeq */
    });
    if (emptyPlantingSitesFields !== undefined && emptyPlantingSitesFields >= 0) {
      return `planting-site-${emptyPlantingSitesFields}`;
    }

    return '';
  };

  const hasEmptyRequiredAnnualFields = (iReport: SeedFundReport) => {
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
      try {
        await onUpdate(report);
      } catch {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
        return;
      }

      try {
        if (reportIdInt) {
          await updateFiles();
          await updatePhotos(report.id);
          await onSubmit(reportIdInt);
          if (reportId && selectedOrganization) {
            void reloadOrganizations(selectedOrganization.id);
            navigate({ pathname: APP_PATHS.SEED_FUND_REPORTS_VIEW.replace(':reportId', reportId) }, { replace: true });
          } else {
            snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SUBMIT);
          }
        }
      } catch {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SUBMIT);
      }
    }
  };

  const onPhotosChanged = (photosList: File[]) => {
    setPhotos(photosList);
  };

  const onNewFilesChanged = (filesList: File[]) => {
    setNewReportFiles(filesList);
  };

  const onExistingFilesChanged = (filesList: SeedFundReportFile[]) => {
    setUpdatedReportFiles(filesList);
  };

  const rightButtons: FormButton[] = [];
  if (report?.isAnnual && showAnnual) {
    rightButtons.push({
      id: 'backToQuarterly',
      text: strings.BACK,
      onClick: () => void handleBack(),
      disabled: false,
      buttonType: 'passive',
    });
  }
  rightButtons.push({
    id: 'saveAndCloseReport',
    text: strings.REPORT_SAVE_AND_CLOSE,
    onClick: () => void gotoReportView(true),
    disabled: false,
    buttonType: 'passive',
  });

  const redirectToReportView = () => {
    if (reportId) {
      navigate(APP_PATHS.SEED_FUND_REPORTS_VIEW.replace(':reportId', reportId));
    }
  };

  /**
   * Report update functions
   */
  const updateReport = (field: string, value: any) => {
    if (report) {
      setReport(
        produce((draft) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
        onSubmit={() => void submitReport()}
      />
      {busyState && <BusySpinner withSkrim={true} />}
      <Box padding={theme.spacing(3)}>
        <Typography fontSize='24px' fontWeight={600}>
          {reportName}
        </Typography>
      </Box>
      {report && (
        <PageForm
          cancelID='cancelEdits'
          saveID='submitReport'
          onCancel={() => void gotoReportView(false)}
          onSave={() =>
            report.isAnnual
              ? showAnnual
                ? void handleSubmitButton()
                : void handleSaveAndNext()
              : void handleSubmitButton()
          }
          saveButtonText={
            report.isAnnual ? (showAnnual ? strings.REPORT_SUBMIT : strings.SAVE_AND_NEXT) : strings.REPORT_SUBMIT
          }
          cancelButtonText={strings.CANCEL}
          additionalRightButtons={rightButtons}
          style={{ paddingBottom: '250px' }}
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
                onUpdateLocation={updateLocation}
                onUpdateWorkers={updateWorkers}
                onPhotosChanged={onPhotosChanged}
                onPhotoRemove={onRemovePhoto}
                reportNurseries={report.nurseries ?? []}
                reportPlantingSites={report.plantingSites ?? []}
                reportSeedBanks={report.seedBanks ?? []}
                validate={validateFields}
              />
            ))}
        </PageForm>
      )}
    </TfMain>
  );
}
