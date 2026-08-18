import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useBatchReportPhotosMutation } from 'src/queries/acceleratorReports/photos';
import {
  ReviewAcceleratorReportIndicatorsRequestPayload,
  ReviewAcceleratorReportRequestPayload,
  UpdateAcceleratorReportValuesRequestPayload,
  usePublishOneAcceleratorReportMutation,
  useReviewOneAcceleratorReportIndicatorsMutation,
  useReviewOneAcceleratorReportMutation,
  useSubmitOneAcceleratorReportMutation,
  useUpdateOneAcceleratorReportValuesMutation,
} from 'src/queries/generated/acceleratorReports';
import { AcceleratorReportPhoto, NewAcceleratorReportPhoto } from 'src/types/AcceleratorReport';

type BatchReportPhotosArgs = {
  fileIdsToDelete?: number[];
  photosToUpdate?: AcceleratorReportPhoto[];
  photosToUpload?: NewAcceleratorReportPhoto[];
  projectId: number;
};

const cacheKey = (reportId: number | undefined, action: string) =>
  reportId === undefined ? undefined : `report-${reportId}-${action}`;

/**
 * Write actions for a single accelerator report. Each mutation is registered under a `fixedCacheKey`
 * derived from `reportId`, so every component that calls this hook for the same report shares one
 * in-flight state: a submit started by one component is visible to all the others, even after the
 * component that started it unmounts. `isLoading` is true while any of the actions is in flight.
 *
 * Each action resolves to `undefined` without making a request when `reportId` is undefined.
 */
const useAcceleratorReportActions = (reportId?: number) => {
  const [submit, submitReportResponse] = useSubmitOneAcceleratorReportMutation({
    fixedCacheKey: cacheKey(reportId, 'submit'),
  });
  const [publish, publishReportResponse] = usePublishOneAcceleratorReportMutation({
    fixedCacheKey: cacheKey(reportId, 'publish'),
  });
  const [review, reviewReportResponse] = useReviewOneAcceleratorReportMutation({
    fixedCacheKey: cacheKey(reportId, 'review'),
  });
  // the feedback edit is a separate affordance that happens to reuse the review endpoint, and it is
  // rendered alongside the review buttons, so it gets its own key to keep the two results apart
  const [reviewFeedbackOnly, reviewFeedbackResponse] = useReviewOneAcceleratorReportMutation({
    fixedCacheKey: cacheKey(reportId, 'review-feedback'),
  });
  const [reviewIndicatorEntries, reviewIndicatorsResponse] = useReviewOneAcceleratorReportIndicatorsMutation({
    fixedCacheKey: cacheKey(reportId, 'review-indicators'),
  });
  const [updateValues, updateReportValuesResponse] = useUpdateOneAcceleratorReportValuesMutation({
    fixedCacheKey: cacheKey(reportId, 'update-values'),
  });
  const [batchPhotoChanges, batchPhotosResponse] = useBatchReportPhotosMutation({
    fixedCacheKey: cacheKey(reportId, 'photos'),
  });

  const submitReport = useCallback(() => (reportId === undefined ? undefined : submit(reportId)), [reportId, submit]);

  const publishReport = useCallback(
    () => (reportId === undefined ? undefined : publish(reportId)),
    [publish, reportId]
  );

  const reviewReport = useCallback(
    (reviewAcceleratorReportRequestPayload: ReviewAcceleratorReportRequestPayload) =>
      reportId === undefined ? undefined : review({ reportId, reviewAcceleratorReportRequestPayload }),
    [reportId, review]
  );

  const reviewFeedback = useCallback(
    (reviewAcceleratorReportRequestPayload: ReviewAcceleratorReportRequestPayload) =>
      reportId === undefined ? undefined : reviewFeedbackOnly({ reportId, reviewAcceleratorReportRequestPayload }),
    [reportId, reviewFeedbackOnly]
  );

  const reviewIndicators = useCallback(
    (reviewAcceleratorReportIndicatorsRequestPayload: ReviewAcceleratorReportIndicatorsRequestPayload) =>
      reportId === undefined
        ? undefined
        : reviewIndicatorEntries({ reportId, reviewAcceleratorReportIndicatorsRequestPayload }),
    [reportId, reviewIndicatorEntries]
  );

  const updateReportValues = useCallback(
    (updateAcceleratorReportValuesRequestPayload: UpdateAcceleratorReportValuesRequestPayload) =>
      reportId === undefined ? undefined : updateValues({ reportId, updateAcceleratorReportValuesRequestPayload }),
    [reportId, updateValues]
  );

  const batchPhotos = useCallback(
    (args: BatchReportPhotosArgs) => (reportId === undefined ? undefined : batchPhotoChanges({ ...args, reportId })),
    [batchPhotoChanges, reportId]
  );

  const responses = useMemo(
    () => [
      submitReportResponse,
      publishReportResponse,
      reviewReportResponse,
      reviewFeedbackResponse,
      reviewIndicatorsResponse,
      updateReportValuesResponse,
      batchPhotosResponse,
    ],
    [
      batchPhotosResponse,
      publishReportResponse,
      reviewFeedbackResponse,
      reviewIndicatorsResponse,
      reviewReportResponse,
      submitReportResponse,
      updateReportValuesResponse,
    ]
  );

  // Results held under a fixedCacheKey outlive the components that created them, so a component
  // mounting for a report that was already acted on would re-run its isSuccess/isError effects on a
  // result someone else has handled. Discard settled results once per report, leaving anything still
  // in flight alone so a component mounting mid-request still sees it.
  const clearedReportId = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (clearedReportId.current === reportId) {
      return;
    }

    clearedReportId.current = reportId;

    responses.forEach((response) => {
      if (response.isSuccess || response.isError) {
        response.reset();
      }
    });
  }, [reportId, responses]);

  const isLoading = responses.some((response) => response.isLoading);

  return {
    batchPhotos,
    batchPhotosResponse,
    isLoading,
    publishReport,
    publishReportResponse,
    reviewFeedback,
    reviewFeedbackResponse,
    reviewIndicators,
    reviewIndicatorsResponse,
    reviewReport,
    reviewReportResponse,
    submitReport,
    submitReportResponse,
    updateReportValues,
    updateReportValuesResponse,
  };
};

export default useAcceleratorReportActions;
