import { useCallback } from 'react';

import {
  useForceLockReportMutation,
  useLockReportMutation,
  useSubmitReportMutation,
  useUnlockReportMutation,
  useUpdateReportMutation,
} from 'src/queries/generated/seedFundReports';
import { SeedFundReport } from 'src/types/SeedFundReport';

/**
 * Imperative write actions for a SeedFund report (save, lock/unlock, submit). Each callback throws
 * if the request fails. `isLoading` is true while any of the actions is in flight.
 */
const useSeedFundReportActions = () => {
  const [updateReportMutation, updateReportResult] = useUpdateReportMutation();
  const [lockReportMutation, lockReportResult] = useLockReportMutation();
  const [forceLockReportMutation, forceLockReportResult] = useForceLockReportMutation();
  const [unlockReportMutation, unlockReportResult] = useUnlockReportMutation();
  const [submitReportMutation, submitReportResult] = useSubmitReportMutation();

  const onUpdate = useCallback(
    async (report: SeedFundReport): Promise<void> => {
      await updateReportMutation({ id: report.id, putReportRequestPayload: { report } }).unwrap();
    },
    [updateReportMutation]
  );

  const lockReport = useCallback(
    async (reportId: number): Promise<void> => {
      await lockReportMutation(reportId).unwrap();
    },
    [lockReportMutation]
  );

  const forceLockReport = useCallback(
    async (reportId: number): Promise<void> => {
      await forceLockReportMutation(reportId).unwrap();
    },
    [forceLockReportMutation]
  );

  const unlockReport = useCallback(
    async (reportId: number): Promise<void> => {
      await unlockReportMutation(reportId).unwrap();
    },
    [unlockReportMutation]
  );

  const onSubmit = useCallback(
    async (reportId: number): Promise<void> => {
      await submitReportMutation(reportId).unwrap();
    },
    [submitReportMutation]
  );

  const isLoading =
    updateReportResult.isLoading ||
    lockReportResult.isLoading ||
    forceLockReportResult.isLoading ||
    unlockReportResult.isLoading ||
    submitReportResult.isLoading;

  return { onUpdate, lockReport, forceLockReport, unlockReport, onSubmit, isLoading };
};

export default useSeedFundReportActions;
